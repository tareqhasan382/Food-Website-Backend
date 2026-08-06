import { Model } from 'mongoose'

export type IUser = {
  _id: string
  name: string
  email: string
  password: string
  role: 'admin' | 'user' | 'superAdmin'
  profileImg?: string
  emailVerified: boolean
  verificationToken?: string
  verificationTokenExpires?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  refreshToken?: string
}

export type IUserModel = Model<IUser, Record<string, unknown>> & {
  isPasswordMatched: (
    givenPassword: string,
    hashedPassword: string
  ) => Promise<boolean>
}

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
  refreshToken?: string
}

export type IChangePassword = {
  oldPassword: string
  newPassword: string
}

export type IJwtPayload = {
  userId: string
  email: string
  role: string
}
