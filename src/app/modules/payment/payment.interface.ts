import { Model, Types } from 'mongoose'

export const PaymentStatuses = [
  'pending',
  'requires_payment_method',
  'requires_action',
  'processing',
  'succeeded',
  'failed',
  'canceled',
  'refunded',
  'partially_refunded',
] as const

export type PaymentStatus = (typeof PaymentStatuses)[number]

export type IPaymentRefund = {
  refundId: string
  amount: number
  status: string
  reason?: string
  createdAt: Date
}

export type IPayment = {
  _id: string
  userId: Types.ObjectId
  paymentIntentId: string
  transactionId: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: string
  failureReason?: string
  failureCode?: string
  paidAt?: Date
  metadata?: Record<string, unknown>
  refunds: IPaymentRefund[]
}

export type IPaymentModel = Model<IPayment, Record<string, unknown>>

export const PaymentFilterableFields = ['status']
export const PaymentPaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']
