import express from 'express'
import { authenticate, authorize } from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { Permissions } from '../../../constants/permissions'
import { categoryImageUpload } from '../../../shared/cloudinaryUpload'
import { CategoryController } from './category.controller'
import { CategoryValidation } from './category.validation'

const router = express.Router()

// Public
router.get('/categories', CategoryController.getAllCategories)
router.get(
  '/categories/:id',
  validateRequest(CategoryValidation.categoryIdZodSchema),
  CategoryController.getCategory
)

// Admin only
router.post(
  '/categories',
  authenticate,
  authorize(Permissions.CATEGORY_CREATE),
  categoryImageUpload,
  validateRequest(CategoryValidation.createCategoryZodSchema),
  CategoryController.createCategory
)

router.patch(
  '/categories/:id',
  authenticate,
  authorize(Permissions.CATEGORY_UPDATE),
  validateRequest(CategoryValidation.categoryIdZodSchema),
  categoryImageUpload,
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory
)

router.delete(
  '/categories/:id',
  authenticate,
  authorize(Permissions.CATEGORY_DELETE),
  validateRequest(CategoryValidation.categoryIdZodSchema),
  CategoryController.deleteCategory
)

export const CategoryRoute = router
