import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { WishlistService } from './wishlist.service'
import { IWishlistResponse } from './wishlist.interface'

const getUserId = (req: Request): string => req.user?.userId as string

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
  const result = await WishlistService.getWishlist(getUserId(req))

  sendResponse<IWishlistResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wishlist fetched successfully!',
    data: result,
  })
})

const addItem = catchAsync(async (req: Request, res: Response) => {
  await WishlistService.addItem(getUserId(req), req.body.foodId)
  const result = await WishlistService.getWishlist(getUserId(req))

  sendResponse<IWishlistResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item added to wishlist successfully!',
    data: result,
  })
})

const removeItem = catchAsync(async (req: Request, res: Response) => {
  await WishlistService.removeItem(getUserId(req), req.params.foodId)
  const result = await WishlistService.getWishlist(getUserId(req))

  sendResponse<IWishlistResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item removed from wishlist successfully!',
    data: result,
  })
})

const moveToCart = catchAsync(async (req: Request, res: Response) => {
  await WishlistService.moveToCart(getUserId(req), req.params.foodId)
  const result = await WishlistService.getWishlist(getUserId(req))

  sendResponse<IWishlistResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Item moved to cart successfully!',
    data: result,
  })
})

export const WishlistController = {
  getMyWishlist,
  addItem,
  removeItem,
  moveToCart,
}
