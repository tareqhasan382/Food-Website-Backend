import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { FoodService } from './food.service'
import {
  IFood,
  IFoodFilters,
  IPaginationOptions,
  FoodFilterableFields,
  FoodPaginationFields,
} from './food.interface'

const createFood = catchAsync(async (req: Request, res: Response) => {
  const result = await FoodService.createFood(req.body)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Food created successfully!',
    data: result,
  })
})

const getFood = catchAsync(async (req: Request, res: Response) => {
  const result = await FoodService.getFood(req.params.id)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Food fetched successfully!',
    data: result,
  })
})

const updateFood = catchAsync(async (req: Request, res: Response) => {
  const result = await FoodService.updateFood(req.params.id, req.body)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Food updated successfully!',
    data: result,
  })
})

const deleteFood = catchAsync(async (req: Request, res: Response) => {
  const result = await FoodService.deleteFood(req.params.id)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Food deleted successfully!',
    data: result,
  })
})

const getFoods = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, FoodFilterableFields) as unknown as IFoodFilters
  const paginationOptions = pick(
    req.query,
    FoodPaginationFields
  ) as unknown as IPaginationOptions

  const result = await FoodService.getAllFoods(filters, paginationOptions)

  sendResponse<IFood[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Foods fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

export const FoodController = {
  createFood,
  getFood,
  updateFood,
  deleteFood,
  getFoods,
}
