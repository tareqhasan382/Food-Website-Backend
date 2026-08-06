import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { DashboardService } from './dashboard.service'

const parseQueryNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const getOverview = catchAsync(async (_req: Request, res: Response) => {
  const result = await DashboardService.getOverview()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview fetched successfully!',
    data: result,
  })
})

const getDailySales = catchAsync(async (req: Request, res: Response) => {
  const days = parseQueryNumber(req.query.days, 30)
  const result = await DashboardService.getDailySalesSeries(days)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Daily sales fetched successfully!',
    data: result,
  })
})

const getMonthlySales = catchAsync(async (req: Request, res: Response) => {
  const months = parseQueryNumber(req.query.months, 12)
  const result = await DashboardService.getMonthlySalesSeries(months)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Monthly sales fetched successfully!',
    data: result,
  })
})

const getRevenueChart = catchAsync(async (req: Request, res: Response) => {
  const days = parseQueryNumber(req.query.days, 30)
  const result = await DashboardService.getRevenueChart(days)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Revenue chart fetched successfully!',
    data: result,
  })
})

const getOrdersChart = catchAsync(async (req: Request, res: Response) => {
  const days = parseQueryNumber(req.query.days, 30)
  const result = await DashboardService.getOrdersChart(days)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders chart fetched successfully!',
    data: result,
  })
})

const getUsersChart = catchAsync(async (req: Request, res: Response) => {
  const days = parseQueryNumber(req.query.days, 30)
  const result = await DashboardService.getUsersSeries(days)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users chart fetched successfully!',
    data: result,
  })
})

const getBestSellingFoods = catchAsync(
  async (req: Request, res: Response) => {
    const limit = parseQueryNumber(req.query.limit, 10)
    const result = await DashboardService.getBestSellingFoods(limit)

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Best selling foods fetched successfully!',
      data: result,
    })
  }
)

const getCategorySales = catchAsync(async (req: Request, res: Response) => {
  const daysRaw = Number(req.query.days)
  const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : null
  const limit = parseQueryNumber(req.query.limit, 15)
  const result = await DashboardService.getCategorySales(days, limit)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category sales fetched successfully!',
    data: result,
  })
})

const getCouponUsage = catchAsync(async (req: Request, res: Response) => {
  const daysRaw = Number(req.query.days)
  const days = Number.isFinite(daysRaw) && daysRaw > 0 ? daysRaw : null
  const limit = parseQueryNumber(req.query.limit, 20)
  const result = await DashboardService.getCouponUsage(days, limit)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coupon usage fetched successfully!',
    data: result,
  })
})

export const DashboardController = {
  getOverview,
  getDailySales,
  getMonthlySales,
  getRevenueChart,
  getOrdersChart,
  getUsersChart,
  getBestSellingFoods,
  getCategorySales,
  getCouponUsage,
}
