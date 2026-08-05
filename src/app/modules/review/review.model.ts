import { Schema, model } from 'mongoose'
import { IReview, IReviewModel } from './review.interface'

const reviewSchema = new Schema<IReview>(
  {
    foodId: {
      type: Schema.Types.ObjectId,
      ref: 'food',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
)

reviewSchema.index({ foodId: 1, userId: 1 }, { unique: true })

const ReviewModel = model<IReview, IReviewModel>('review', reviewSchema)

export default ReviewModel
