import { Schema, model } from 'mongoose'
import {
  IInvoice,
  IInvoiceModel,
  InvoiceStatuses,
} from './invoice.interface'

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'order',
      required: true,
      unique: true,
    },
    orderNumber: { type: String, required: true, trim: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
      index: true,
    },
    items: [
      {
        foodId: { type: Schema.Types.ObjectId, ref: 'food', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    deliveryCharge: { type: Number, required: true, default: 0, min: 0 },
    couponCode: { type: String, trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, required: true, default: 'usd' },
    status: {
      type: String,
      enum: InvoiceStatuses,
      required: true,
      default: 'pending',
    },
    issuedAt: { type: Date, required: true, default: Date.now },
    paidAt: { type: Date },
  },
  { timestamps: true }
)

invoiceSchema.index({ status: 1, createdAt: -1 })
invoiceSchema.index({ createdAt: -1 })

const InvoiceModel = model<IInvoice, IInvoiceModel>('invoice', invoiceSchema)

export default InvoiceModel
