import express from 'express'
import { authenticate } from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { CartController } from './cart.controller'
import { CartValidation } from './cart.validation'

const router = express.Router()

router.get('/cart', authenticate, CartController.getMyCart)

router.post(
  '/cart/items',
  authenticate,
  validateRequest(CartValidation.addItemZodSchema),
  CartController.addItem
)

router.patch(
  '/cart/items/:foodId',
  authenticate,
  validateRequest(CartValidation.foodIdParamsZodSchema),
  validateRequest(CartValidation.updateQuantityZodSchema),
  CartController.updateQuantity
)

router.delete(
  '/cart/items/:foodId',
  authenticate,
  validateRequest(CartValidation.foodIdParamsZodSchema),
  CartController.removeItem
)

router.delete('/cart', authenticate, CartController.clearCart)

export const CartRoute = router
