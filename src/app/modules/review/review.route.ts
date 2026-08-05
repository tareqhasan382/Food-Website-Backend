import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { authenticate, authorize } from '../../middlewares/auth'
import { Permissions } from '../../../constants/permissions'
import { ReviewController } from './review.controller'
import { ReviewValidation } from './review.validation'

const router = express.Router()

router.get(
  '/foods/:foodId/reviews',
  validateRequest(ReviewValidation.foodIdParamsZodSchema),
  ReviewController.getFoodReviews
)

router.get(
  '/reviews/mine',
  authenticate,
  authorize(Permissions.REVIEW_READ),
  ReviewController.getMyReviews
)

router.post(
  '/reviews',
  authenticate,
  authorize(Permissions.REVIEW_CREATE),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
)

router.patch(
  '/reviews/:id',
  authenticate,
  authorize(Permissions.REVIEW_UPDATE),
  validateRequest(ReviewValidation.reviewIdParamsZodSchema),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
)

router.delete(
  '/reviews/:id',
  authenticate,
  authorize(Permissions.REVIEW_DELETE),
  validateRequest(ReviewValidation.reviewIdParamsZodSchema),
  ReviewController.deleteReview
)

export const ReviewRoute = router
