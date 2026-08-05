import { ICoupon } from './coupon.interface'

const round2 = (value: number): number => Math.round(value * 100) / 100

export const calculateCouponDiscount = (
  coupon: ICoupon,
  subtotal: number
): number => {
  if (subtotal <= 0) return 0
  if (coupon.type === 'percentage') {
    return round2(subtotal * (coupon.value / 100))
  }
  return round2(Math.min(coupon.value, subtotal))
}

export type CouponValidationState =
  | { valid: true; coupon: ICoupon; discount: number }
  | { valid: false; message: string }

export const validateCouponAgainstSubtotal = (
  coupon: ICoupon,
  subtotal: number
): CouponValidationState => {
  if (!coupon.isActive) {
    return { valid: false, message: 'Coupon is not active' }
  }
  if (new Date(coupon.expiryDate) < new Date()) {
    return { valid: false, message: 'Coupon has expired' }
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit has been reached' }
  }
  if (subtotal < coupon.minimumOrder) {
    return {
      valid: false,
      message: `A minimum order of ${coupon.minimumOrder} is required to use this coupon`,
    }
  }
  return {
    valid: true,
    coupon,
    discount: calculateCouponDiscount(coupon, subtotal),
  }
}
