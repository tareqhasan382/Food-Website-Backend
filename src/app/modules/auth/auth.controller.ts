/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { Request, Response } from 'express'
import config from '../../../config'
import { AuthService } from './auth.service'
import { ILoginUserResponse, IUser } from './auth.interface'
import AuthModel from './auth.model'
import bcrypt from 'bcrypt'
const createUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body
 // console.log('pyload:', data)
  const result = await AuthService.createUser(data)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully!',
    data: result,
  })
})
///admin/login
const LoginUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body
  // console.log('data:', data)
  const isUserExist = await AuthModel.findOne({ email: data.email }).select(
    'password'
  )
  // console.log('isUserExist:', isUserExist)
  if (!isUserExist) {
    //throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
    return res.json({
      statusCode: httpStatus.NOT_FOUND,
      message: 'User does`t exist',
    })
  }
  const isMatchPassword = await bcrypt.compare(
    data.password,
    isUserExist?.password
  )
  if (!isMatchPassword) {
    return res.json({
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Password is incorrect',
    })
  }
  const result = await AuthService.loginUser(data)
  const { refreshToken, ...others } = result
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production' ? true : false,
    httpOnly: true,
  }

  res.cookie('refreshToken', refreshToken, cookieOptions)

  sendResponse<ILoginUserResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: others,
  })
})

export const AuthController = {
  createUser,
  LoginUser,
}
