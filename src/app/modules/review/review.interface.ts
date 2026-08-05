import { Model, Types } from 'mongoose'

export type IReview = {
  _id: string
  foodId: Types.ObjectId
  userId: Types.ObjectId
  rating: number
  comment?: string
  createdAt?: Date
  updatedAt?: Date
}

export type IReviewModel = Model<IReview, Record<string, unknown>>

export type IReviewWithUser = {
  _id: string
  foodId: string
  user: {
    _id: string
    name: string
    profileImg?: string
  }
  rating: number
  comment?: string
  createdAt?: Date
}

export type IReviewWithFood = {
  _id: string
  userId: string
  food: {
    _id: string
    name: string
    image?: string
  }
  rating: number
  comment?: string
  createdAt?: Date
}

export const ReviewPaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']
