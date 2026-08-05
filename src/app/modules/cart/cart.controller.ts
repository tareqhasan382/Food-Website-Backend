import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { CartService } from './cart.service'
import { ICartResponse } from './cart.interface'

const getUserId = (req: Request): string => req.user?.userId as string

const getMyCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartService.getCart(getUserId(req))

  sendResponse<ICartResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart fetched successfully!',
    data: result,
  })
})

const addItem = catchAsync(async (req: Request, res: Response) => {
  const { foodId, quantity } = req.body
  await CartService.addItemToCart(getUserId(req), foodId, quantity)
  const result = await CartService.getCart(getUserId(req))

  sendResponse<ICartResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item added to cart successfully!',
    data: result,
  })
})

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
  await CartService.updateQuantity(
    getUserId(req),
    req.params.foodId,
    req.body.quantity
  )
  const result = await CartService.getCart(getUserId(req))

  sendResponse<ICartResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart quantity updated successfully!',
    data: result,
  })
})

const removeItem = catchAsync(async (req: Request, res: Response) => {
  await CartService.removeItem(getUserId(req), req.params.foodId)
  const result = await CartService.getCart(getUserId(req))

  sendResponse<ICartResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item removed from cart successfully!',
    data: result,
  })
})

const clearCart = catchAsync(async (req: Request, res: Response) => {
  await CartService.clearCart(getUserId(req))
  const result = await CartService.getCart(getUserId(req))

  sendResponse<ICartResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cart cleared successfully!',
    data: result,
  })
})

export const CartController = {
  getMyCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
}
