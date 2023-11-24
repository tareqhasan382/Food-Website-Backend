/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status'
import jwt, { Secret } from 'jsonwebtoken'
import ApiError from '../../../errors/ApiError'
import { ILoginUser, ILoginUserResponse, IUser } from './auth.interface'
import AdminModel from './auth.model'
import config from '../../../config'
import AuthModel from './auth.model'

const createUser = async (user: IUser): Promise<IUser | null> => {
  const createdUser = await AdminModel.create(user)
  // jodi user create na hoy
  if (!createdUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Field to create User!')
  }
  return createdUser
}
///auth/login
const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email } = payload
  // check exist user
  const isUserExist = await AuthModel.findOne(
    { email },
    { email: 1, password: 1, role: 1 }
  )

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  // check match password

  // create jwt token
  const accessToken = jwt.sign(
    { userId: isUserExist._id, role: isUserExist.role },
    config.jwt.secret as Secret,
    { expiresIn: '1d' }
  )
  //console.log('access token : ', accessToken)
  const refreshToken = jwt.sign(
    { userId: isUserExist._id, role: isUserExist.role },
    config.jwt.refresh_secret as Secret,
    { expiresIn: '365d' }
  )
  return {
    accessToken,
    refreshToken,
  }
}

export const AuthService = {
  createUser,
  loginUser,
}
