import { Schema, model } from 'mongoose'
import {
  IPayment,
  IPaymentModel,
  PaymentStatuses,
} from './payment.interface'

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
      index: true,
    },
    paymentIntentId: { type: String, required: true, unique: true },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'usd' },
    status: {
      type: String,
      enum: PaymentStatuses,
      required: true,
      default: 'pending',
    },
    paymentMethod: { type: String },
    failureReason: { type: String },
    failureCode: { type: String },
    paidAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
    refunds: [
      {
        refundId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const PaymentModel = model<IPayment, IPaymentModel>('payment', paymentSchema)

export default PaymentModel
