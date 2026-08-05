import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { CouponService } from './coupon.service'
import {
  CouponFilterableFields,
  CouponPaginationFields,
  ICoupon,
} from './coupon.interface'

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCoupon(req.body)

  sendResponse<ICoupon>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Coupon created successfully!',
    data: result,
  })
})

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, CouponFilterableFields)
  const paginationOptions = pick(req.query, CouponPaginationFields)
  const result = await CouponService.getAllCoupons(filters, paginationOptions)

  sendResponse<ICoupon[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupons fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getCouponById = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getCouponById(req.params.id)

  sendResponse<ICoupon>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon fetched successfully!',
    data: result,
  })
})

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.updateCoupon(req.params.id, req.body)

  sendResponse<ICoupon>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon updated successfully!',
    data: result,
  })
})

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  await CouponService.deleteCoupon(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon deleted successfully!',
  })
})

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.validateCoupon(
    req.user?.userId as string,
    req.body.code,
    req.body?.subtotal
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon is valid!',
    data: result,
  })
})

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.applyCoupon(
    req.user?.userId as string,
    req.body.code
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon applied successfully!',
    data: result,
  })
})

const removeCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.removeCoupon(
    req.user?.userId as string
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon removed successfully!',
    data: result,
  })
})

export const CouponController = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  removeCoupon,
}
