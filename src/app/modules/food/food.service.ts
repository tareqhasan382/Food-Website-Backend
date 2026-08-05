import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { IGenericResponse } from '../../../interface/common'
import { paginationHelper } from '../../../helpers/paginationHelper'
import { deleteImagesFromCloudinary } from '../../../shared/cloudinaryUpload'
import FoodModel from './food.model'
import {
  IFood,
  IFoodFilters,
  ICreateFood,
  IUpdateFood,
  IPaginationOptions,
  FoodSearchableFields,
  FoodSortBy,
} from './food.interface'

const POPULAR_RATING_THRESHOLD = 4
const LATEST_DAYS = 30

const asNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

const asBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  return value === true || value === 'true' || value === '1'
}

const buildSort = (
  sortBy: FoodSortBy | undefined,
  sortOrder: string | undefined
): Record<string, 1 | -1> => {
  const key = sortBy || 'newest'
  if (key === 'price') {
    return { price: sortOrder === 'desc' ? -1 : 1 }
  }
  if (key === 'rating') {
    return { rating: sortOrder === 'asc' ? 1 : -1 }
  }
  if (key === 'oldest') {
    return { createdAt: 1 }
  }
  return { createdAt: -1 }
}

const createFood = async (payload: ICreateFood): Promise<IFood> => {
  const food = await FoodModel.create(payload)
  return food.toObject()
}

const getFood = async (id: string): Promise<IFood> => {
  const food = await FoodModel.findById(id)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }
  return food.toObject()
}

const updateFood = async (
  id: string,
  payload: IUpdateFood
): Promise<IFood> => {
  const existingFood = await FoodModel.findById(id)
  if (!existingFood) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }

  // Clean up images that are no longer referenced
  if (payload.images && Array.isArray(payload.images)) {
    const removedImages = existingFood.images.filter(
      image => !payload.images?.includes(image)
    )
    if (removedImages.length) {
      await deleteImagesFromCloudinary(removedImages)
    }
  }

  const food = await FoodModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })

  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }
  return food.toObject()
}

const deleteFood = async (id: string): Promise<IFood> => {
  const food = await FoodModel.findByIdAndDelete(id)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }

  // Best-effort cleanup of Cloudinary images
  if (food.images?.length) {
    await deleteImagesFromCloudinary(food.images)
  }

  return food.toObject()
}

const getAllFoods = async (
  filters: IFoodFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IFood[]>> => {
  const { page, limit, skip } = paginationHelper(paginationOptions)

  const { searchTerm, category } = filters
  const minPrice = asNumber(filters.minPrice)
  const maxPrice = asNumber(filters.maxPrice)
  const minRating = asNumber(filters.minRating)
  const minStock = asNumber(filters.minStock)
  const minPrepTime = asNumber(filters.minPrepTime)
  const maxPrepTime = asNumber(filters.maxPrepTime)
  const availability = asBoolean(filters.availability)
  const popular = asBoolean(filters.popular)
  const latest = asBoolean(filters.latest)

  const andConditions: Record<string, unknown>[] = []

  if (searchTerm) {
    andConditions.push({
      $or: FoodSearchableFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    })
  }

  if (category) {
    andConditions.push({ category })
  }
  if (minPrice !== undefined) {
    andConditions.push({ price: { $gte: minPrice } })
  }
  if (maxPrice !== undefined) {
    andConditions.push({ price: { $lte: maxPrice } })
  }
  if (minRating !== undefined) {
    andConditions.push({ rating: { $gte: minRating } })
  }
  if (minStock !== undefined) {
    andConditions.push({ stock: { $gte: minStock } })
  }
  if (minPrepTime !== undefined) {
    andConditions.push({ preparationTime: { $gte: minPrepTime } })
  }
  if (maxPrepTime !== undefined) {
    andConditions.push({ preparationTime: { $lte: maxPrepTime } })
  }
  if (availability !== undefined) {
    andConditions.push({ availability })
  }
  if (popular) {
    andConditions.push({ rating: { $gte: POPULAR_RATING_THRESHOLD } })
  }
  if (latest) {
    andConditions.push({
      createdAt: { $gte: new Date(Date.now() - LATEST_DAYS * 24 * 60 * 60 * 1000) },
    })
  }

  const query = andConditions.length ? { $and: andConditions } : {}

  const total = await FoodModel.countDocuments(query)
  const sort = buildSort(paginationOptions.sortBy, paginationOptions.sortOrder)
  const result = await FoodModel.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: result.map(food => food.toObject()),
  }
}

export const FoodService = {
  createFood,
  getFood,
  updateFood,
  deleteFood,
  getAllFoods,
}
