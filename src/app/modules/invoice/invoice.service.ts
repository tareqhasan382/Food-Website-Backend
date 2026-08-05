import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import config from '../../../config'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interface/common'
import InvoiceModel from './invoice.model'
import {
  IInvoice,
  InvoiceStatus,
} from './invoice.interface'
import { IOrder } from '../order/order.interface'
import { IPayment } from '../payment/payment.interface'
import OrderModel from '../order/order.model'
import PaymentModel from '../payment/payment.model'
import AuthModel from '../auth/auth.model'

const generateInvoiceNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random()
      .toString(36)
      .slice(2)
      .slice(0, 6)
      .toUpperCase()
      .padEnd(6, '0')
    const invoiceNumber = `BILL-${date}-${random}`
    const exists = await InvoiceModel.exists({ invoiceNumber })
    if (!exists) {
      return invoiceNumber
    }
  }
  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    'Failed to generate a unique invoice number'
  )
}

const deriveStatus = (
  order: IOrder,
  payment: IPayment | null
): InvoiceStatus => {
  if (payment) {
    if (payment.status === 'succeeded') {
      return 'paid'
    }
    if (payment.status === 'refunded') {
      return 'refunded'
    }
  }
  if (order.status === 'cancelled') {
    return 'cancelled'
  }
  if (order.status === 'delivered') {
    return 'paid'
  }
  return 'pending'
}

/**
 * Idempotently creates or refreshes the invoice snapshot for an order.
 * The invoice status is always derived from the current order + payment state.
 */
const ensureInvoice = async (orderId: string): Promise<IInvoice> => {
  const order = await OrderModel.findById(orderId).lean()
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }

  const payment = order.paymentId
    ? await PaymentModel.findById(order.paymentId).lean()
    : null

  const status = deriveStatus(order, payment as IPayment | null)
  const currency = config.stripe.currency || 'usd'

  const existing = await InvoiceModel.findOne({ orderId })
  if (existing) {
    if (existing.status !== status || existing.paidAt === undefined) {
      existing.status = status
      existing.paidAt =
        status === 'paid' ? existing.paidAt ?? new Date() : existing.paidAt
      await existing.save()
    }
    return existing.toObject()
  }

  const invoiceNumber = await generateInvoiceNumber()
  const invoice = await InvoiceModel.create({
    invoiceNumber,
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.items.map(item => ({
      foodId: item.foodId,
      name: item.name,
      price: item.discountPrice ?? item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryCharge: order.deliveryCharge,
    couponCode: order.couponCode,
    couponDiscount: order.couponDiscount ?? 0,
    total: order.total,
    currency,
    status,
    issuedAt:
      (order as IOrder & { createdAt?: Date }).createdAt ?? new Date(),
    paidAt: status === 'paid' ? new Date() : undefined,
  })

  return invoice.toObject()
}

const getMyInvoice = async (
  userId: string,
  orderId: string
): Promise<IInvoice> => {
  const order = await OrderModel.findOne({ _id: orderId, userId }).lean()
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }
  return ensureInvoice(orderId)
}

const getMyInvoiceById = async (
  userId: string,
  invoiceId: string
): Promise<IInvoice> => {
  const invoice = await InvoiceModel.findOne({ _id: invoiceId, userId })
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found')
  }
  return invoice.toObject()
}

const getAdminInvoice = async (orderId: string): Promise<IInvoice> => {
  return ensureInvoice(orderId)
}

const getMyInvoices = async (
  userId: string,
  filters: { status?: string },
  options: Record<string, unknown>
): Promise<IGenericResponse<IInvoice[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = { userId }
  if (filters.status) {
    query.status = filters.status
  }

  const total = await InvoiceModel.countDocuments(query)
  const result = await InvoiceModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(invoice => invoice.toObject()),
  }
}

const getAdminInvoices = async (
  filters: { status?: string; searchTerm?: string },
  options: Record<string, unknown>
): Promise<IGenericResponse<IInvoice[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = {}
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.searchTerm) {
    const term = new RegExp(filters.searchTerm, 'i')
    query.$or = [{ invoiceNumber: term }, { orderNumber: term }]
  }

  const total = await InvoiceModel.countDocuments(query)
  const result = await InvoiceModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(invoice => invoice.toObject()),
  }
}

const getAdminInvoiceById = async (invoiceId: string): Promise<IInvoice> => {
  const invoice = await InvoiceModel.findById(invoiceId)
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found')
  }
  return invoice.toObject()
}

const getInvoiceViewData = async (
  orderId: string,
  ownerId?: string
): Promise<{
  invoice: IInvoice
  order: IOrder & { deliveryAddress?: IOrder['deliveryAddress'] }
  user: { name?: string; email: string } | null
}> => {
  let order
  if (ownerId) {
    order = await OrderModel.findOne({ _id: orderId, userId: ownerId }).lean()
    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
    }
  } else {
    order = await OrderModel.findById(orderId).lean()
    if (!order) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
    }
  }

  const invoice = await ensureInvoice(orderId)
  const user = await AuthModel.findById(order.userId, 'name email').lean()

  return { invoice, order, user }
}

export const InvoiceService = {
  ensureInvoice,
  getMyInvoice,
  getMyInvoiceById,
  getMyInvoices,
  getAdminInvoice,
  getAdminInvoices,
  getAdminInvoiceById,
  getInvoiceViewData,
}
