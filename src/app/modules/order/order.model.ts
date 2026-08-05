import { Schema, model } from 'mongoose'
import {
  IOrder,
  IOrderModel,
  OrderStatuses,
} from './order.interface'

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
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
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String },
        lineTotal: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    deliveryCharge: { type: Number, required: true, default: 0 },
    couponCode: { type: String, trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: OrderStatuses,
      required: true,
      default: 'pending',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'payment' },
    deliveryAddress: {
      fullName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
    },
    statusHistory: [
      {
        status: { type: String, enum: OrderStatuses, required: true },
        note: { type: String },
        changedBy: { type: Schema.Types.ObjectId, ref: 'auth' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

orderSchema.index({ status: 1, createdAt: -1 })
orderSchema.index({ createdAt: -1 })

const OrderModel = model<IOrder, IOrderModel>('order', orderSchema)

export default OrderModel
