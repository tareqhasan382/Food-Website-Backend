import { Model, Types } from 'mongoose'

export const OrderStatuses = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const

export type OrderStatus = (typeof OrderStatuses)[number]

export const NEXT_ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
}

export const PAID_ORDER_STATUSES: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
]

export const CANCELABLE_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
]

export type IOrderItem = {
  foodId: Types.ObjectId
  name: string
  price: number
  discountPrice?: number
  quantity: number
  image?: string
  lineTotal: number
}

export type IOrderStatusHistory = {
  status: OrderStatus
  note?: string
  changedBy?: Types.ObjectId
  changedAt: Date
}

export type IDeliveryAddress = {
  fullName?: string
  phone?: string
  address?: string
  city?: string
}

export type IOrder = {
  _id: string
  orderNumber: string
  userId: Types.ObjectId
  items: IOrderItem[]
  subtotal: number
  discount: number
  deliveryCharge: number
  couponCode?: string
  couponDiscount?: number
  total: number
  status: OrderStatus
  paymentId?: Types.ObjectId
  deliveryAddress?: IDeliveryAddress
  statusHistory: IOrderStatusHistory[]
}

export type IOrderModel = Model<IOrder, Record<string, unknown>>

export const OrderFilterableFields = ['status', 'searchTerm']
export const OrderPaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']
