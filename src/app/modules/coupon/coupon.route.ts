import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import {
  authenticate,
  authorize,
  authorizeRoles,
} from '../../middlewares/auth'
import { Permissions } from '../../../constants/permissions'
import { UserRoles } from '../../../constants/roles'
import { CouponController } from './coupon.controller'
import { CouponValidation } from './coupon.validation'

const router = express.Router()

const adminGuard = [
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
]

// ===================== User APIs =====================
router.post(
  '/coupons/validate',
  authenticate,
  authorize(Permissions.COUPON_USE),
  validateRequest(CouponValidation.validateCouponZodSchema),
  CouponController.validateCoupon
)

router.post(
  '/coupons/apply',
  authenticate,
  authorize(Permissions.COUPON_USE),
  validateRequest(CouponValidation.couponCodeZodSchema),
  CouponController.applyCoupon
)

router.delete(
  '/coupons/applied',
  authenticate,
  authorize(Permissions.COUPON_USE),
  CouponController.removeCoupon
)

// ===================== Admin APIs =====================
router.post(
  '/admin/coupons',
  ...adminGuard,
  validateRequest(CouponValidation.createCouponZodSchema),
  CouponController.createCoupon
)

router.get(
  '/admin/coupons',
  ...adminGuard,
  CouponController.getAllCoupons
)

router.get(
  '/admin/coupons/:id',
  ...adminGuard,
  validateRequest(CouponValidation.couponIdParamsZodSchema),
  CouponController.getCouponById
)

router.patch(
  '/admin/coupons/:id',
  ...adminGuard,
  validateRequest(CouponValidation.couponIdParamsZodSchema),
  validateRequest(CouponValidation.updateCouponZodSchema),
  CouponController.updateCoupon
)

router.delete(
  '/admin/coupons/:id',
  ...adminGuard,
  validateRequest(CouponValidation.couponIdParamsZodSchema),
  CouponController.deleteCoupon
)

export const CouponRoute = router
