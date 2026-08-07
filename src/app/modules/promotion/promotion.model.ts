import { Schema, model } from 'mongoose'
import { IPromotion, IPromotionModel } from './promotion.interface'

const promotionSchema = new Schema<IPromotion>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String },
    badge: { type: String, trim: true },
    validUntil: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

promotionSchema.index({ isActive: 1, createdAt: -1 })

const PromotionModel = model<IPromotion, IPromotionModel>(
  'promotion',
  promotionSchema
)

export default PromotionModel
