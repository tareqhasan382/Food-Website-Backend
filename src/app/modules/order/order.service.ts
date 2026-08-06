import httpStatus from 'http-status'
import { Types } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interface/common'
import OrderModel from './order.model'
import {
  CANCELABLE_STATUSES,
  IOrder,
  IOrderItem,
  IOrderStatusHistory,
  NEXT_ALLOWED_TRANSITIONS,
  OrderStatus,
  PAID_ORDER_STATUSES,
} from './order.interface'
import { CartService } from '../cart/cart.service'
import CartModel from '../cart/cart.model'
import PaymentModel from '../payment/payment.model'
import { CouponService } from '../coupon/coupon.service'
import AuthModel from '../auth/auth.model'
import { emailService } from '../email/email.service'
import { InvoiceService } from '../invoice/invoice.service'

const generateOrderNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random()
      .toString(36)
      .slice(2)
      .slice(0, 6)
      .toUpperCase()
      .padEnd(6, '0')
    const orderNumber = `INV-${date}-${random}`
    const exists = await OrderModel.exists({ orderNumber })
    if (!exists) {
      return orderNumber
    }
  }
  throw new ApiError(
    httpStatus.INTERNAL_SERVER_ERROR,
    'Failed to generate a unique order number'
  )
}

const placeOrder = async (
  userId: string,
  payload: { paymentId?: string; deliveryAddress?: unknown }
): Promise<IOrder> => {
  if (payload.paymentId) {
    const existing = await OrderModel.findOne({
      paymentId: payload.paymentId,
      userId,
    })
    if (existing) {
      return existing.toObject()
    }
  }

  const cart = await CartService.getCart(userId)
  if (!cart.items.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cart is empty. Add items before placing an order.'
    )
  }

  let paymentId: Types.ObjectId | undefined
  if (payload.paymentId) {
    const payment = await PaymentModel.findOne({
      _id: payload.paymentId,
      userId,
    })
    if (!payment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found')
    }
    if (payment.status !== 'succeeded') {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Payment must be completed before placing an order'
      )
    }
    paymentId = new Types.ObjectId(payment._id)
  }

  const items: IOrderItem[] = cart.items.map(item => ({
    foodId: item.foodId._id as unknown as Types.ObjectId,
    name: item.foodId.name,
    price: item.foodId.price,
    discountPrice: item.foodId.discountPrice,
    quantity: item.quantity,
    image: item.foodId.images?.[0],
    lineTotal: item.lineTotal,
  }))

  const orderNumber = await generateOrderNumber()

  if (cart.couponCode) {
    await CouponService.consumeCoupon(cart.couponCode)
  }

  const order = await OrderModel.create({
    orderNumber,
    userId,
    items,
    subtotal: cart.subtotal,
    discount: cart.discount,
    deliveryCharge: cart.deliveryCharge,
    couponCode: cart.couponCode,
    couponDiscount: cart.couponDiscount ?? 0,
    total: cart.total,
    status: 'pending',
    paymentId,
    deliveryAddress: payload.deliveryAddress,
    statusHistory: [
      { status: 'pending', note: 'Order placed', changedAt: new Date() },
    ],
  })

  await CartModel.findOneAndUpdate(
    { userId },
    {
      $set: { items: [], couponDiscount: 0 },
      $unset: { couponCode: 1 },
    }
  )

  const user = await AuthModel.findById(userId, 'name email')
  if (user) {
    await emailService.sendOrderPlacedEmail(user.email, {
      name: user.name,
      orderNumber,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryCharge: cart.deliveryCharge,
      couponDiscount: cart.couponDiscount ?? 0,
      total: cart.total,
    })
  }

  await InvoiceService.ensureInvoice(order._id.toString())

  return order.toObject()
}

const getOrderHistory = async (
  userId: string,
  filters: { status?: string },
  options: Record<string, unknown>
): Promise<IGenericResponse<IOrder[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = { userId }
  if (filters.status) {
    query.status = filters.status
  }

  const total = await OrderModel.countDocuments(query)
  const result = await OrderModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(order => order.toObject()),
  }
}

const getOrderById = async (
  userId: string,
  orderId: string
): Promise<IOrder> => {
  const order = await OrderModel.findOne({ _id: orderId, userId })
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }
  return order.toObject()
}

const cancelOrder = async (
  userId: string,
  orderId: string,
  note?: string
): Promise<IOrder> => {
  const order = await OrderModel.findOne({ _id: orderId, userId })
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }

  if (!CANCELABLE_STATUSES.includes(order.status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Order cannot be cancelled in its current state'
    )
  }

  const historyEntry: IOrderStatusHistory = {
    status: 'cancelled',
    note: note || 'Order cancelled by user',
    changedBy: new Types.ObjectId(userId),
    changedAt: new Date(),
  }

  order.status = 'cancelled'
  order.statusHistory.push(historyEntry)
  await order.save()

  await InvoiceService.ensureInvoice(order._id.toString())

  return order.toObject()
}

const updateStatus = async (
  adminId: string,
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<IOrder> => {
  const order = await OrderModel.findById(orderId)
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }

  const allowedTransitions = NEXT_ALLOWED_TRANSITIONS[order.status]
  if (!allowedTransitions.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot change order status from '${order.status}' to '${status}'`
    )
  }

  const historyEntry: IOrderStatusHistory = {
    status,
    note,
    changedBy: new Types.ObjectId(adminId),
    changedAt: new Date(),
  }

  order.status = status
  order.statusHistory.push(historyEntry)
  await order.save()

  if (status === 'delivered') {
    const user = await AuthModel.findById(order.userId, 'name email')
    if (user) {
      await emailService.sendOrderDeliveredEmail(user.email, {
        name: user.name,
        orderNumber: order.orderNumber,
        total: order.total,
      })
    }
  }

  await InvoiceService.ensureInvoice(order._id.toString())

  return order.toObject()
}

const getAdminOrders = async (
  filters: { status?: string; searchTerm?: string },
  options: Record<string, unknown>
): Promise<IGenericResponse<IOrder[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = {}
  if (filters.status) {
    query.status = filters.status
  }
  if (filters.searchTerm) {
    query.orderNumber = { $regex: new RegExp(filters.searchTerm, 'i') }
  }

  const total = await OrderModel.countDocuments(query)
  const result = await OrderModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(order => order.toObject()),
  }
}

const getAdminOrderById = async (orderId: string): Promise<IOrder> => {
  const order = await OrderModel.findById(orderId)
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found')
  }
  return order.toObject()
}

const getOrderStats = async (): Promise<{
  totalOrders: number
  revenue: number
  statusCounts: Record<OrderStatus, number>
}> => {
  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    preparing: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
  }

  const counts = await OrderModel.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  counts.forEach((entry: { _id: OrderStatus; count: number }) => {
    if (statusCounts[entry._id] !== undefined) {
      statusCounts[entry._id] = entry.count
    }
  })

  const totalOrders = await OrderModel.countDocuments()

  const revenueResult = await OrderModel.aggregate([
    { $match: { status: { $in: PAID_ORDER_STATUSES } } },
    { $group: { _id: null, revenue: { $sum: '$total' } } },
  ])
  const revenue = revenueResult[0]?.revenue ?? 0

  return { totalOrders, revenue, statusCounts }
}

export const OrderService = {
  placeOrder,
  getOrderHistory,
  getOrderById,
  cancelOrder,
  updateStatus,
  getAdminOrders,
  getAdminOrderById,
  getOrderStats,
}
