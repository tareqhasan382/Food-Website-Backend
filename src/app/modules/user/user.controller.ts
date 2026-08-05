import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { UserService } from './user.service'
import { IUser } from '../auth/auth.interface'
import { IGenericResponse } from '../../../interface/common'

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query)

  sendResponse<IGenericResponse<IUser[]>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully!',
    data: result,
  })
})

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await UserService.getUserById(id)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully!',
    data: result,
  })
})

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await UserService.updateUserRole(id, req.body.role)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User role updated successfully!',
    data: result,
  })
})

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  await UserService.deleteUser(id)

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully!',
    data: null,
  })
})

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user?.userId as string)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully!',
    data: result,
  })
})

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(
    req.user?.userId as string,
    req.body
  )

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully!',
    data: result,
  })
})

export const UserController = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getMyProfile,
  updateMyProfile,
}
