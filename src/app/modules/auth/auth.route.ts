import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { AuthController } from './auth.controller'
import { AuthValidation } from './auth.validation'
import { authenticate } from '../../middlewares/auth'

const router = express.Router()

router.post(
  '/auth/register',
  validateRequest(AuthValidation.registerUserZodSchema),
  AuthController.registerUser
)

router.post(
  '/auth/login',
  validateRequest(AuthValidation.loginUserZodSchema),
  AuthController.loginUser
)

router.post(
  '/auth/refresh-token',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken
)

router.post('/auth/logout', authenticate, AuthController.logoutUser)

router.get(
  '/auth/verify-email',
  validateRequest(AuthValidation.verifyEmailZodSchema),
  AuthController.verifyEmail
)

router.post(
  '/auth/forgot-password',
  validateRequest(AuthValidation.forgotPasswordZodSchema),
  AuthController.forgotPassword
)

router.post(
  '/auth/reset-password',
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthController.resetPassword
)

router.post(
  '/auth/change-password',
  validateRequest(AuthValidation.changePasswordZodSchema),
  authenticate,
  AuthController.changePassword
)

router.get('/auth/me', authenticate, AuthController.getProfile)

export const AuthRoute = router
