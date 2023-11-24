import { Model } from 'mongoose'

export type IUser = {
  _id: string
  password: string
  role?: 'user'
  name: string
  email: string
}

export type IUserModel = Model<IUser, Record<string, unknown>>

export type ILoginUser = {
  email: string
  password: string
}

export type ILoginUserResponse = {
  accessToken: string
  refreshToken?: string
}

export type IRefreshTokenResponse = {
  accessToken: string
}
