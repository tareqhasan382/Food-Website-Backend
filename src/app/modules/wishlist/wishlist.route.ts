import express from 'express'
import { authenticate } from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { WishlistController } from './wishlist.controller'
import { WishlistValidation } from './wishlist.validation'

const router = express.Router()

router.get('/wishlist', authenticate, WishlistController.getMyWishlist)

router.post(
  '/wishlist/items',
  authenticate,
  validateRequest(WishlistValidation.addItemZodSchema),
  WishlistController.addItem
)

router.delete(
  '/wishlist/items/:foodId',
  authenticate,
  validateRequest(WishlistValidation.foodIdParamsZodSchema),
  WishlistController.removeItem
)

router.post(
  '/wishlist/items/:foodId/move-to-cart',
  authenticate,
  validateRequest(WishlistValidation.foodIdParamsZodSchema),
  WishlistController.moveToCart
)

export const WishlistRoute = router
