import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { PromotionService } from './promotion.service'
import { IPromotion } from './promotion.interface'

const createPromotion = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.createPromotion(req.body)

  sendResponse<IPromotion>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Promotion created successfully!',
    data: result,
  })
})

const getActivePromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getActivePromotions()

  sendResponse<IPromotion[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotions fetched successfully!',
    data: result,
  })
})

const getAllPromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getAllPromotions()

  sendResponse<IPromotion[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotions fetched successfully!',
    data: result,
  })
})

const getPromotionById = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getPromotionById(req.params.id)

  sendResponse<IPromotion>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion fetched successfully!',
    data: result,
  })
})

const updatePromotion = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.updatePromotion(req.params.id, req.body)

  sendResponse<IPromotion>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion updated successfully!',
    data: result,
  })
})

const deletePromotion = catchAsync(async (req: Request, res: Response) => {
  await PromotionService.deletePromotion(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion deleted successfully!',
  })
})

export const PromotionController = {
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
}
