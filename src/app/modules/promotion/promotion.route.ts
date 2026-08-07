import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import {
  authenticate,
  authorizeRoles,
} from '../../middlewares/auth'
import { UserRoles } from '../../../constants/roles'
import { PromotionController } from './promotion.controller'
import { PromotionValidation } from './promotion.validation'

const router = express.Router()

const adminGuard = [
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
]

// Public
router.get('/promotions', PromotionController.getActivePromotions)
router.get(
  '/promotions/:id',
  validateRequest(PromotionValidation.promotionIdParamsZodSchema),
  PromotionController.getPromotionById
)

// Admin only
router.get(
  '/admin/promotions',
  ...adminGuard,
  PromotionController.getAllPromotions
)

router.post(
  '/admin/promotions',
  ...adminGuard,
  validateRequest(PromotionValidation.createPromotionZodSchema),
  PromotionController.createPromotion
)

router.patch(
  '/admin/promotions/:id',
  ...adminGuard,
  validateRequest(PromotionValidation.promotionIdParamsZodSchema),
  validateRequest(PromotionValidation.updatePromotionZodSchema),
  PromotionController.updatePromotion
)

router.delete(
  '/admin/promotions/:id',
  ...adminGuard,
  validateRequest(PromotionValidation.promotionIdParamsZodSchema),
  PromotionController.deletePromotion
)

export const PromotionRoute = router
