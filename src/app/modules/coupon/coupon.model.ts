import { Schema, model } from 'mongoose'
import {
  CouponTypes,
  ICoupon,
  ICouponModel,
} from './coupon.interface'

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: CouponTypes, required: true },
    value: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, required: true, default: 0, min: 0 },
    minimumOrder: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
)

couponSchema.index({ isActive: 1, expiryDate: 1 })
couponSchema.index({ code: 1 })

const CouponModel = model<ICoupon, ICouponModel>('coupon', couponSchema)

export default CouponModel
