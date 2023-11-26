/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { Request, Response } from 'express'
import { FoodService } from './food.service'
import { IFood } from './food.interface'

const createFood = catchAsync(async (req: Request, res: Response) => {
  const data = req.body
  //console.log('data:', data)
  const result = await FoodService.createFood(data)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' Food created successfully!',
    data: result,
  })
})
///admin/login
const getFoods = catchAsync(async (req: Request, res: Response) => {
  // console.log('query:', req.query)
  const result = await FoodService.getFoods(req.query)

  res.status(200).json({
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrive successfully !!',
    //data: result,
    meta: result.meta,
    data: result.data,
  })
})
const getFood = catchAsync(async (req: Request, res: Response) => {
  // const id = req.params
  const data: any = req.params
  //console.log('payload:', userId)
  const result = await FoodService.getFood(data?.id)

  sendResponse<IFood[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'data retrive in successfully!',
    data: result,
  })
})
const updateFood = catchAsync(async (req: Request, res: Response) => {
  // const id = req.params
  const data: any = req.params
  //console.log('payload:', userId)
  const result = await FoodService.updateFood(data?.id)

  sendResponse<IFood[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'data updated successfully!',
    data: result,
  })
})
const deleteFood = catchAsync(async (req: Request, res: Response) => {
  // const id = req.params
  const data: any = req.params
  //console.log('payload:', data.id)
  const result = await FoodService.deleteFood(data?.id)

  sendResponse<IFood>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'data deleted successfully!',
    data: result,
  })
})
export const FoodController = {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
}
