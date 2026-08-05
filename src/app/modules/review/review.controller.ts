import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { ReviewService } from './review.service'
import {
  IReview,
  IReviewWithFood,
  IReviewWithUser,
  ReviewPaginationFields,
} from './review.interface'

const getUserId = (req: Request): string => req.user?.userId as string

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(getUserId(req), {
    foodId: req.body.foodId,
    rating: req.body.rating,
    comment: req.body?.comment,
  })

  sendResponse<IReview>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review added successfully!',
    data: result,
  })
})

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReview(getUserId(req), req.params.id, {
    rating: req.body?.rating,
    comment: req.body?.comment,
  })

  sendResponse<IReview>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully!',
    data: result,
  })
})

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(getUserId(req), req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully!',
  })
})

const getFoodReviews = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, ReviewPaginationFields)
  const result = await ReviewService.getFoodReviews(
    req.params.foodId,
    paginationOptions
  )

  sendResponse<{ summary: { averageRating: number; ratingCount: number }; reviews: IReviewWithUser[] }>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews fetched successfully!',
    meta: result.meta,
    data: { summary: result.summary, reviews: result.data },
  })
})

const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, ReviewPaginationFields)
  const result = await ReviewService.getMyReviews(getUserId(req), paginationOptions)

  sendResponse<IReviewWithFood[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My reviews fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

export const ReviewController = {
  createReview,
  updateReview,
  deleteReview,
  getFoodReviews,
  getMyReviews,
}
