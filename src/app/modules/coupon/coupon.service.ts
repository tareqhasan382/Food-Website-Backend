import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { IGenericResponse } from '../../../interface/common'
import CouponModel from './coupon.model'
import { ICoupon } from './coupon.interface'
import { validateCouponAgainstSubtotal } from './coupon.utils'
import { CartService } from '../cart/cart.service'
import CartModel from '../cart/cart.model'

const normalizeCode = (code: string): string => code.trim().toUpperCase()

const createCoupon = async (
  payload: Record<string, unknown>
): Promise<ICoupon> => {
  const code = normalizeCode(payload.code as string)
  const expiryDate = new Date(payload.expiryDate as string)
  if (Number.isNaN(expiryDate.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid expiry date')
  }

  const exists = await CouponModel.findOne({ code })
  if (exists) {
    throw new ApiError(httpStatus.CONFLICT, 'Coupon code already exists')
  }

  try {
    const coupon = await CouponModel.create({
      ...payload,
      code,
      expiryDate,
    })
    return coupon.toObject()
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, 'Coupon code already exists')
    }
    throw error
  }
}

const getAllCoupons = async (
  filters: {
    code?: string
    type?: string
    isActive?: string
    searchTerm?: string
  },
  options: Record<string, unknown>
): Promise<IGenericResponse<ICoupon[]>> => {
  const { page, limit, skip } = paginationHelper(options)

  const query: Record<string, unknown> = {}
  if (filters.code) {
    query.code = { $regex: new RegExp(normalizeCode(filters.code), 'i') }
  }
  if (filters.searchTerm) {
    query.code = { $regex: new RegExp(filters.searchTerm, 'i') }
  }
  if (filters.type) {
    query.type = filters.type
  }
  if (filters.isActive === 'true') {
    query.isActive = true
  } else if (filters.isActive === 'false') {
    query.isActive = false
  }

  const total = await CouponModel.countDocuments(query)
  const result = await CouponModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(coupon => coupon.toObject()),
  }
}

const getCouponById = async (id: string): Promise<ICoupon> => {
  const coupon = await CouponModel.findById(id)
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found')
  }
  return coupon.toObject()
}

const updateCoupon = async (
  id: string,
  payload: Record<string, unknown>
): Promise<ICoupon> => {
  const data: Record<string, unknown> = { ...payload }
  if (data.code) {
    data.code = normalizeCode(data.code as string)
  }
  if (data.expiryDate) {
    const expiryDate = new Date(data.expiryDate as string)
    if (Number.isNaN(expiryDate.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid expiry date')
    }
    data.expiryDate = expiryDate
  }

  try {
    const coupon = await CouponModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
    if (!coupon) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found')
    }
    return coupon.toObject()
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new ApiError(httpStatus.CONFLICT, 'Coupon code already exists')
    }
    throw error
  }
}

const deleteCoupon = async (id: string): Promise<void> => {
  const coupon = await CouponModel.findByIdAndDelete(id)
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found')
  }
}

const findCouponByCode = async (code: string): Promise<ICoupon> => {
  const coupon = await CouponModel.findOne({ code: normalizeCode(code) })
  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid coupon code')
  }
  return coupon.toObject()
}

const validateCoupon = async (
  userId: string,
  code: string,
  subtotal?: number
): Promise<{ coupon: ICoupon; discount: number }> => {
  let effectiveSubtotal = subtotal
  if (effectiveSubtotal === undefined) {
    const cart = await CartService.getCart(userId)
    effectiveSubtotal = cart.subtotal
  }
  const coupon = await findCouponByCode(code)
  const state = validateCouponAgainstSubtotal(coupon, effectiveSubtotal)
  if (!state.valid) {
    throw new ApiError(httpStatus.BAD_REQUEST, state.message)
  }
  return { coupon, discount: state.discount }
}

const applyCoupon = async (
  userId: string,
  code: string
): Promise<ReturnType<typeof CartService.getCart>> => {
  const cart = await CartService.getCart(userId)
  const { coupon, discount } = await validateCoupon(userId, code, cart.subtotal)

  await CartModel.findOneAndUpdate(
    { userId },
    { $set: { couponCode: coupon.code, couponDiscount: discount } }
  )

  return CartService.getCart(userId)
}

const removeCoupon = async (
  userId: string
): Promise<ReturnType<typeof CartService.getCart>> => {
  await CartModel.findOneAndUpdate(
    { userId },
    { $unset: { couponCode: 1 }, $set: { couponDiscount: 0 } }
  )
  return CartService.getCart(userId)
}

const consumeCoupon = async (code: string): Promise<void> => {
  const updated = await CouponModel.findOneAndUpdate(
    { code: normalizeCode(code), $expr: { $lt: ['$usedCount', '$usageLimit'] } },
    { $inc: { usedCount: 1 } },
    { new: true }
  )
  if (!updated) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Coupon usage limit has been reached'
    )
  }
}

export const CouponService = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  removeCoupon,
  consumeCoupon,
}
