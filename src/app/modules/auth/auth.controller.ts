import { Request, Response } from 'express'
import httpStatus from 'http-status'
import config from '../../../config'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { AuthService } from './auth.service'
import { ILoginUserResponse, IRefreshTokenResponse, IUser } from './auth.interface'

const cookieOptions = {
  secure: config.env === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully. Please verify your email!',
    data: result,
  })
})

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken, ...others } = await AuthService.loginUser(req.body)

  res.cookie('refreshToken', refreshToken, cookieOptions)

  sendResponse<Partial<ILoginUserResponse>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: others,
  })
})

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies
  const result = await AuthService.refreshToken(refreshToken)

  res.cookie('refreshToken', refreshToken, cookieOptions)

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token refreshed successfully!',
    data: result,
  })
})

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string
  await AuthService.logoutUser(userId)

  res.clearCookie('refreshToken', { httpOnly: true, secure: config.env === 'production' })

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged out successfully!',
    data: null,
  })
})

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string
  const result = await AuthService.verifyEmail(token)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email verified successfully!',
    data: result,
  })
})

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body.email)

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset link sent to your email!',
    data: null,
  })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.query.token as string
  await AuthService.resetPassword(token, req.body.password)

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully!',
    data: null,
  })
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string
  await AuthService.changePassword(userId, req.body)

  sendResponse<null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully!',
    data: null,
  })
})

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string
  const result = await AuthService.getProfile(userId)

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully!',
    data: result,
  })
})

export const AuthController = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
}
