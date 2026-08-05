import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { OrderService } from './order.service'
import {
  IOrder,
  OrderFilterableFields,
  OrderPaginationFields,
} from './order.interface'

const getUserId = (req: Request): string => req.user?.userId as string

const placeOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.placeOrder(getUserId(req), {
    paymentId: req.body?.paymentId,
    deliveryAddress: req.body?.deliveryAddress,
  })

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order placed successfully!',
    data: result,
  })
})

const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.cancelOrder(
    getUserId(req),
    req.params.id,
    req.body?.note
  )

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order cancelled successfully!',
    data: result,
  })
})

const getOrderHistory = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, OrderFilterableFields)
  const paginationOptions = pick(req.query, OrderPaginationFields)
  const result = await OrderService.getOrderHistory(
    getUserId(req),
    filters,
    paginationOptions
  )

  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order history fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderById(getUserId(req), req.params.id)

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order fetched successfully!',
    data: result,
  })
})

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateStatus(
    getUserId(req),
    req.params.id,
    req.body.status,
    req.body?.note
  )

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully!',
    data: result,
  })
})

const getAdminOrders = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, OrderFilterableFields)
  const paginationOptions = pick(req.query, OrderPaginationFields)
  const result = await OrderService.getAdminOrders(filters, paginationOptions)

  sendResponse<IOrder[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Orders fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getOrderStats = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderStats()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order stats fetched successfully!',
    data: result,
  })
})

const getAdminOrderById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAdminOrderById(req.params.id)

  sendResponse<IOrder>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order fetched successfully!',
    data: result,
  })
})

export const OrderController = {
  placeOrder,
  cancelOrder,
  getOrderHistory,
  getOrderById,
  updateStatus,
  getAdminOrders,
  getOrderStats,
  getAdminOrderById,
}
