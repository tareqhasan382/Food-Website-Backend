import httpStatus from 'http-status'
import { Types } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helpers/paginationHelper'
import ReviewModel from './review.model'
import {
  IReview,
  IReviewWithFood,
  IReviewWithUser,
} from './review.interface'
import FoodModel from '../food/food.model'
import AuthModel from '../auth/auth.model'
import OrderModel from '../order/order.model'

const recalculateFoodRating = async (foodId: string): Promise<void> => {
  const result = await ReviewModel.aggregate([
    { $match: { foodId: new Types.ObjectId(foodId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])

  const entry = result[0]
  const count = entry?.count ?? 0
  const averageRating = count
    ? Math.round((entry.average as number) * 10) / 10
    : 0

  const update: Record<string, unknown> = {
    averageRating,
    ratingCount: count,
  }
  if (count > 0) {
    update.rating = averageRating
  }

  await FoodModel.findByIdAndUpdate(foodId, { $set: update })
}

const createReview = async (
  userId: string,
  payload: { foodId: string; rating: number; comment?: string }
): Promise<IReview> => {
  const food = await FoodModel.findById(payload.foodId)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }

  const user = await AuthModel.findById(userId)
  if (!user?.emailVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only verified users can write reviews'
    )
  }

  const purchased = await OrderModel.findOne({
    userId,
    status: 'delivered',
    'items.foodId': payload.foodId,
  })
  if (!purchased) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only verified buyers who received this item can write a review'
    )
  }

  const existing = await ReviewModel.findOne({
    foodId: payload.foodId,
    userId,
  })
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You have already reviewed this food'
    )
  }

  try {
    const review = await ReviewModel.create({
      foodId: payload.foodId,
      userId,
      rating: payload.rating,
      comment: payload.comment,
    })
    await recalculateFoodRating(payload.foodId)
    return review.toObject()
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'You have already reviewed this food'
      )
    }
    throw err
  }
}

const updateReview = async (
  userId: string,
  reviewId: string,
  payload: { rating?: number; comment?: string }
): Promise<IReview> => {
  const review = await ReviewModel.findOne({ _id: reviewId, userId })
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found')
  }

  if (payload.rating !== undefined) {
    review.rating = payload.rating
  }
  if (payload.comment !== undefined) {
    review.comment = payload.comment
  }

  await review.save()
  await recalculateFoodRating(String(review.foodId))

  return review.toObject()
}

const deleteReview = async (userId: string, reviewId: string): Promise<void> => {
  const review = await ReviewModel.findOne({ _id: reviewId, userId })
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found')
  }

  const foodId = String(review.foodId)
  await review.deleteOne()
  await recalculateFoodRating(foodId)
}

const getFoodReviews = async (
  foodId: string,
  options: Record<string, unknown>
): Promise<{
  meta: { page: number; limit: number; total: number; totalPages: number }
  summary: { averageRating: number; ratingCount: number }
  data: IReviewWithUser[]
}> => {
  const food = await FoodModel.findById(foodId)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }

  const { page, limit, skip } = paginationHelper(options)
  const total = await ReviewModel.countDocuments({ foodId })
  const docs = await ReviewModel.find({ foodId })
    .populate('userId', 'name profileImg')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const data: IReviewWithUser[] = docs.map(doc => {
    const user = doc.userId as unknown as {
      _id: string
      name: string
      profileImg?: string
    }
    return {
      _id: String(doc._id),
      foodId: String(doc.foodId),
      user: {
        _id: String(user._id),
        name: user.name,
        profileImg: user.profileImg,
      },
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    }
  })

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      averageRating: food.averageRating ?? 0,
      ratingCount: food.ratingCount ?? 0,
    },
    data,
  }
}

const getMyReviews = async (
  userId: string,
  options: Record<string, unknown>
): Promise<{
  meta: { page: number; limit: number; total: number; totalPages: number }
  data: IReviewWithFood[]
}> => {
  const { page, limit, skip } = paginationHelper(options)
  const total = await ReviewModel.countDocuments({ userId })
  const docs = await ReviewModel.find({ userId })
    .populate('foodId', 'name images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const data: IReviewWithFood[] = docs.map(doc => {
    const food = doc.foodId as unknown as {
      _id: string
      name: string
      images?: string[]
    }
    return {
      _id: String(doc._id),
      userId: String(doc.userId),
      food: {
        _id: String(food._id),
        name: food.name,
        image: food.images?.[0],
      },
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
    }
  })

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data,
  }
}

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getFoodReviews,
  getMyReviews,
}
