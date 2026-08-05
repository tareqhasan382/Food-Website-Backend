import httpStatus from 'http-status'
import Stripe from 'stripe'
import ApiError from '../../../errors/ApiError'
import config from '../../../config'
import { stripe } from '../../../shared/stripe'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interface/common'
import PaymentModel from './payment.model'
import {
  IPayment,
  IPaymentRefund,
  PaymentStatus,
} from './payment.interface'
import { CartService } from '../cart/cart.service'
import CartModel from '../cart/cart.model'

const findPayment = async (
  userId: string,
  paymentId?: string,
  paymentIntentId?: string
): Promise<InstanceType<typeof PaymentModel>> => {
  const query: Record<string, unknown> = { userId }
  if (paymentId) {
    query._id = paymentId
  } else {
    query.paymentIntentId = paymentIntentId
  }

  const payment = await PaymentModel.findOne(query)
  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found')
  }
  return payment
}

const normalizeStatus = (intent: Stripe.PaymentIntent): PaymentStatus => {
  if (intent.last_payment_error) {
    return 'failed'
  }

  switch (intent.status) {
    case 'succeeded':
      return 'succeeded'
    case 'processing':
      return 'processing'
    case 'requires_capture':
      return 'processing'
    case 'requires_action':
      return 'requires_action'
    case 'requires_payment_method':
      return 'requires_payment_method'
    case 'canceled':
      return 'canceled'
    default:
      return 'pending'
  }
}

const syncFromIntent = async (
  payment: InstanceType<typeof PaymentModel>,
  intent: Stripe.PaymentIntent
): Promise<IPayment> => {
  const previousStatus = payment.status
  const nextStatus = normalizeStatus(intent)

  payment.status = nextStatus
  const paymentMethod = intent.payment_method as Stripe.PaymentMethod | null
  if (paymentMethod?.type) {
    payment.paymentMethod = paymentMethod.type
  }

  if (intent.last_payment_error) {
    payment.failureReason =
      intent.last_payment_error.message ?? 'Payment failed'
    payment.failureCode = intent.last_payment_error.code ?? undefined
  }

  if (nextStatus === 'succeeded') {
    const chargeId =
      typeof intent.latest_charge === 'string'
        ? intent.latest_charge
        : intent.latest_charge?.id
    if (chargeId) {
      payment.transactionId = chargeId
    }
    payment.paidAt = payment.paidAt ?? new Date()

    if (previousStatus !== 'succeeded') {
      await CartModel.findOneAndUpdate(
        { userId: payment.userId },
        { $set: { items: [] } }
      )
    }
  }

  await payment.save()
  return payment.toObject()
}

const createPaymentIntent = async (
  userId: string
): Promise<{ payment: IPayment; clientSecret: string | null }> => {
  const cart = await CartService.getCart(userId)
  if (!cart.items.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cart is empty. Add items before checkout.'
    )
  }

  const amount = Math.round(cart.total * 100)
  if (amount <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid cart total')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: config.stripe.currency,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    metadata: { userId },
  })

  const payment = await PaymentModel.create({
    userId,
    paymentIntentId: paymentIntent.id,
    transactionId: paymentIntent.id,
    amount,
    currency: paymentIntent.currency,
    status: 'pending',
    metadata: { cartTotal: cart.total },
  })

  return {
    payment: payment.toObject(),
    clientSecret: paymentIntent.client_secret,
  }
}

const verifyPayment = async (
  userId: string,
  payload: { paymentId?: string; paymentIntentId?: string }
): Promise<IPayment> => {
  const payment = await findPayment(
    userId,
    payload.paymentId,
    payload.paymentIntentId
  )

  const intent = await stripe.paymentIntents.retrieve(
    payment.paymentIntentId,
    { expand: ['payment_method'] }
  )

  return syncFromIntent(payment, intent)
}

const getPaymentHistory = async (
  userId: string,
  filters: { status?: string },
  options: Record<string, unknown>
): Promise<IGenericResponse<IPayment[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = { userId }
  if (filters.status) {
    query.status = filters.status
  }

  const total = await PaymentModel.countDocuments(query)
  const result = await PaymentModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(payment => payment.toObject()),
  }
}

const getPaymentById = async (
  userId: string,
  paymentId: string
): Promise<IPayment> => {
  const payment = await findPayment(userId, paymentId)
  return payment.toObject()
}

const refundPayment = async (
  userId: string,
  paymentId: string,
  reason?: string
): Promise<IPayment> => {
  const payment = await findPayment(userId, paymentId)

  if (
    payment.status !== 'succeeded' &&
    payment.status !== 'partially_refunded'
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Only successful payments can be refunded'
    )
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.paymentIntentId,
    reason: 'requested_by_customer',
    metadata: reason ? { reason } : undefined,
  })

  const refundRecord: IPaymentRefund = {
    refundId: refund.id,
    amount: refund.amount,
    status: refund.status ?? 'pending',
    reason,
    createdAt: new Date(refund.created * 1000),
  }

  if (!payment.refunds.some(r => r.refundId === refund.id)) {
    payment.refunds.push(refundRecord)
  }

  const totalRefunded = payment.refunds.reduce(
    (sum, r) => sum + r.amount,
    0
  )
  payment.status =
    totalRefunded >= payment.amount ? 'refunded' : 'partially_refunded'

  await payment.save()
  return payment.toObject()
}

const onPaymentSucceeded = async (intent: Stripe.PaymentIntent) => {
  const payment = await PaymentModel.findOne({
    paymentIntentId: intent.id,
  })
  if (payment) {
    await syncFromIntent(payment, intent)
  }
}

const onPaymentFailed = async (intent: Stripe.PaymentIntent) => {
  const payment = await PaymentModel.findOne({
    paymentIntentId: intent.id,
  })
  if (!payment) return

  payment.status = 'failed'
  payment.failureReason =
    intent.last_payment_error?.message ?? 'Payment failed'
  payment.failureCode = intent.last_payment_error?.code ?? undefined
  await payment.save()
}

const onRefundCreated = async (refund: Stripe.Refund) => {
  const paymentIntentId =
    typeof refund.payment_intent === 'string'
      ? refund.payment_intent
      : refund.payment_intent?.id

  if (!paymentIntentId) return
  const payment = await PaymentModel.findOne({ paymentIntentId })
  if (!payment) return

  if (!payment.refunds.some(r => r.refundId === refund.id)) {
    payment.refunds.push({
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status ?? 'pending',
      createdAt: new Date(refund.created * 1000),
    })
  }
  await payment.save()
}

const onChargeRefunded = async (charge: Stripe.Charge) => {
  const paymentIntentId =
    typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id

  if (!paymentIntentId) return
  const payment = await PaymentModel.findOne({ paymentIntentId })
  if (!payment) return

  payment.status =
    charge.amount_refunded >= charge.amount_captured
      ? 'refunded'
      : 'partially_refunded'
  await payment.save()
}

const handleWebhook = async (
  body: Buffer,
  signature: string | undefined
): Promise<string> => {
  if (!config.stripe.webhook_secret) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Stripe webhook secret is not configured'
    )
  }
  if (!signature) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Missing stripe-signature header'
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      config.stripe.webhook_secret
    )
  } catch (err) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${(err as Error).message}`
    )
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await onPaymentSucceeded(event.data.object as Stripe.PaymentIntent)
      break
    case 'payment_intent.payment_failed':
      await onPaymentFailed(event.data.object as Stripe.PaymentIntent)
      break
    case 'refund.created':
      await onRefundCreated(event.data.object as Stripe.Refund)
      break
    case 'charge.refunded':
      await onChargeRefunded(event.data.object as Stripe.Charge)
      break
    default:
      break
  }

  return event.type
}

export const PaymentService = {
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
  handleWebhook,
}
