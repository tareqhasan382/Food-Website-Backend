import express from 'express'
import { authenticate, authorize } from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { Permissions } from '../../../constants/permissions'
import { foodImagesUpload } from '../../../shared/cloudinaryUpload'
import { FoodController } from './food.controller'
import { FoodValidation } from './food.validation'
import { normalizeFoodBody } from './food.middleware'

const router = express.Router()

// Public
router.get('/foods', FoodController.getFoods)
router.get(
  '/foods/:id',
  validateRequest(FoodValidation.foodIdZodSchema),
  FoodController.getFood
)

// Admin only
router.post(
  '/foods',
  authenticate,
  authorize(Permissions.FOOD_CREATE),
  foodImagesUpload,
  normalizeFoodBody,
  validateRequest(FoodValidation.createFoodZodSchema),
  FoodController.createFood
)

router.patch(
  '/foods/:id',
  authenticate,
  authorize(Permissions.FOOD_UPDATE),
  validateRequest(FoodValidation.foodIdZodSchema),
  foodImagesUpload,
  normalizeFoodBody,
  validateRequest(FoodValidation.updateFoodZodSchema),
  FoodController.updateFood
)

router.delete(
  '/foods/:id',
  authenticate,
  authorize(Permissions.FOOD_DELETE),
  validateRequest(FoodValidation.foodIdZodSchema),
  FoodController.deleteFood
)

export const FoodRoute = router
