/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { IFood } from './food.interface'
import FoodModel from './food.model'
import { IGenericResponse } from '../../../interface/common'
import { SortOrder } from 'mongoose'

const createFood = async (payload: IFood): Promise<IFood | null> => {
  const createdUser = await FoodModel.create(payload)
  if (!createdUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Field to create Gellery!')
  }
  return createdUser
}
const getFoods = async (payload: any): Promise<IGenericResponse<IFood[]>> => {
  const { page, limit, search, filterField, sortOrder, sortField } = payload
  // console.log('payload:', payload)
  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    // sort: sortOrder ? { [sortOrder as string]: 1 } : {},
    sort: sortOrder
      ? { [sortField as string]: parseInt(sortOrder as string) }
      : {},
  } as {
    page: number
    limit: number
    //sort: { [key: string]: SortOrder | { $meta: 'textScore' } }
    sort: { [key: string]: SortOrder }
  }

  const query: any = {}

  if (search) {
    query.category = { $regex: new RegExp(search as string, 'i') }
  }

  if (filterField) {
    query.category = filterField
    // Add more fields to filter as needed
  }

  const count = await FoodModel.countDocuments(query)
  const result = await FoodModel.find(query)
    .sort(options.sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)

  return {
    meta: {
      total: count,
      page: options.page,
      limit: options.limit,
    },
    data: result,
  }
}

// =====================================
const getFood = async (userId: string): Promise<IFood[] | null> => {
  const isUserExist = await FoodModel.find({ userId: userId })

  return isUserExist
}
const updateFood = async (userId: string): Promise<IFood[] | null> => {
  const isUserExist = await FoodModel.find({ userId: userId })

  return isUserExist
}
const deleteFood = async (payload: string): Promise<IFood | null> => {
  const isUserExist = await FoodModel.findByIdAndDelete(payload)

  return isUserExist
}
export const FoodService = {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
}
