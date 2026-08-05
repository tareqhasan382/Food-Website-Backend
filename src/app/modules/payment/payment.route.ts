import express from 'express'
import { authenticate } from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { PaymentController } from './payment.controller'
import { PaymentValidation } from './payment.validation'

const router = express.Router()

router.post(
  '/payments/webhook',
  PaymentController.handleWebhook
)

router.post(
  '/payments/create-payment-intent',
  authenticate,
  PaymentController.createPaymentIntent
)

router.post(
  '/payments/verify',
  authenticate,
  validateRequest(PaymentValidation.verifyPaymentZodSchema),
  PaymentController.verifyPayment
)

router.get('/payments', authenticate, PaymentController.getPaymentHistory)

router.get(
  '/payments/:id',
  authenticate,
  validateRequest(PaymentValidation.paymentIdParamsZodSchema),
  PaymentController.getPaymentById
)

router.post(
  '/payments/:id/refund',
  authenticate,
  validateRequest(PaymentValidation.paymentIdParamsZodSchema),
  validateRequest(PaymentValidation.refundZodSchema),
  PaymentController.refundPayment
)

export const PaymentRoute = router
