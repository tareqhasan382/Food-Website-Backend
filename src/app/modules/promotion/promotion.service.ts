import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import PromotionModel from './promotion.model'
import {
  ICreatePromotion,
  IPromotion,
  IUpdatePromotion,
} from './promotion.interface'

const createPromotion = async (
  payload: ICreatePromotion
): Promise<IPromotion> => {
  const promotion = await PromotionModel.create(payload)
  return promotion.toObject()
}

const getActivePromotions = async (): Promise<IPromotion[]> => {
  const result = await PromotionModel.find({ isActive: true }).sort({
    createdAt: -1,
  })
  return result.map(promotion => promotion.toObject())
}

const getAllPromotions = async (): Promise<IPromotion[]> => {
  const result = await PromotionModel.find().sort({ createdAt: -1 })
  return result.map(promotion => promotion.toObject())
}

const getPromotionById = async (id: string): Promise<IPromotion> => {
  const promotion = await PromotionModel.findById(id)
  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promotion does not exist')
  }
  return promotion.toObject()
}

const updatePromotion = async (
  id: string,
  payload: IUpdatePromotion
): Promise<IPromotion> => {
  const promotion = await PromotionModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promotion does not exist')
  }
  return promotion.toObject()
}

const deletePromotion = async (id: string): Promise<void> => {
  const promotion = await PromotionModel.findByIdAndDelete(id)
  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Promotion does not exist')
  }
}

export const PromotionService = {
  createPromotion,
  getActivePromotions,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
}
