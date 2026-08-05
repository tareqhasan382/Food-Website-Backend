import { Model, Types } from 'mongoose'

export const InvoiceStatuses = [
  'paid',
  'pending',
  'cancelled',
  'refunded',
] as const

export type InvoiceStatus = (typeof InvoiceStatuses)[number]

export type IInvoiceItem = {
  foodId: Types.ObjectId
  name: string
  price: number
  quantity: number
  lineTotal: number
}

export type IInvoice = {
  _id: string
  invoiceNumber: string
  orderId: Types.ObjectId
  orderNumber: string
  userId: Types.ObjectId
  items: IInvoiceItem[]
  subtotal: number
  discount: number
  deliveryCharge: number
  couponCode?: string
  couponDiscount?: number
  total: number
  currency: string
  status: InvoiceStatus
  issuedAt: Date
  paidAt?: Date
}

export type IInvoiceModel = Model<IInvoice, Record<string, unknown>>

export const InvoiceFilterableFields = ['status', 'searchTerm']
export const InvoicePaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']
