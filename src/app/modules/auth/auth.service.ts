import httpStatus from 'http-status'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { Secret } from 'jsonwebtoken'
import ApiError from '../../../errors/ApiError'
import config from '../../../config'
import { jwtHelpers } from '../../../helpers/jwtHelpers'
import { emailService } from '../email/email.service'
import { AuthRepository } from './auth.repository'
import {
  IChangePassword,
  IJwtPayload,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IUser,
} from './auth.interface'

const createVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

const createTokens = (
  payload: IJwtPayload
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwtHelpers.createToken(
    payload,
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )
  const refreshToken = jwtHelpers.createToken(
    payload,
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  )
  return { accessToken, refreshToken }
}

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, Number(config.bycrypt_salt_rounds))
}

const registerUser = async (
  payload: Pick<IUser, 'name' | 'email' | 'password' | 'profileImg'>
): Promise<IUser> => {
  const existingUser = await AuthRepository.findOne({ email: payload.email })
  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, 'User already exists')
  }

  const verificationToken = createVerificationToken()
  const user = await AuthRepository.createUser({
    ...payload,
    emailVerified: false,
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  await emailService.sendVerificationEmail(user.email, {
    verifyUrl: `${config.client_url}/verify-email?token=${verificationToken}`,
  })
  await emailService.sendWelcomeEmail(user.email, { name: user.name })

  const safeUser: Partial<IUser> = { ...user }
  delete safeUser.password
  delete safeUser.verificationToken
  delete safeUser.verificationTokenExpires
  return safeUser as IUser
}

const loginUser = async (
  payload: ILoginUser
): Promise<ILoginUserResponse> => {
  const user = await AuthRepository.findOne(
    { email: payload.email },
    { email: 1, password: 1, role: 1, emailVerified: 1 }
  )

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  const isPasswordMatched = await AuthRepository.isPasswordMatched(
    payload.password,
    user.password
  )
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect')
  }

  if (!user.emailVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Please verify your email before logging in'
    )
  }

  const jwtPayload: IJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  }

  const { accessToken, refreshToken } = createTokens(jwtPayload)
  await AuthRepository.findOneAndUpdate(
    { _id: user._id },
    { refreshToken }
  )

  return { accessToken, refreshToken }
}

const refreshToken = async (
  token: string
): Promise<IRefreshTokenResponse> => {
  let verifiedToken: IJwtPayload
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    ) as IJwtPayload
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
  }

  const user = await AuthRepository.findById(verifiedToken.userId)
  if (!user || user.refreshToken !== token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token')
  }

  const { accessToken, refreshToken: newRefreshToken } = createTokens({
    userId: user._id,
    email: user.email,
    role: user.role,
  })

  await AuthRepository.findOneAndUpdate(
    { _id: user._id },
    { refreshToken: newRefreshToken }
  )

  return { accessToken, refreshToken: newRefreshToken }
}

const logoutUser = async (userId: string): Promise<void> => {
  await AuthRepository.findOneAndUpdate(
    { _id: userId },
    { refreshToken: '' }
  )
}

const verifyEmail = async (token: string): Promise<IUser> => {
  const user = await AuthRepository.findOne({
    verificationToken: token,
  })

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification token')
  }

  if (
    !user.verificationTokenExpires ||
    user.verificationTokenExpires.getTime() < Date.now()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Verification token has expired')
  }

  if (user.emailVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already verified')
  }

  const updatedUser = await AuthRepository.findOneAndUpdate(
    { _id: user._id },
    {
      emailVerified: true,
      $unset: { verificationToken: 1, verificationTokenExpires: 1 },
    }
  )

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  const safeUser: Partial<IUser> = { ...updatedUser }
  delete safeUser.password
  delete safeUser.refreshToken
  delete safeUser.verificationToken
  delete safeUser.verificationTokenExpires
  delete safeUser.passwordResetToken
  delete safeUser.passwordResetExpires
  return safeUser as IUser
}

const forgotPassword = async (email: string): Promise<void> => {
  const user = await AuthRepository.findOne({ email })
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  const passwordResetToken = createVerificationToken()
  await AuthRepository.findOneAndUpdate(
    { _id: user._id },
    {
      passwordResetToken,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
    }
  )

  await emailService.sendResetPasswordEmail(email, {
    resetUrl: `${config.client_url}/reset-password?token=${passwordResetToken}`,
  })
}

const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const user = await AuthRepository.findOne({ passwordResetToken: token })
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid reset token')
  }

  if (
    !user.passwordResetExpires ||
    user.passwordResetExpires.getTime() < Date.now()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Reset token has expired')
  }

  const hashedPassword = await hashPassword(newPassword)
  await AuthRepository.findOneAndUpdate(
    { _id: user._id },
    {
      password: hashedPassword,
      $unset: { passwordResetToken: 1, passwordResetExpires: 1 },
      refreshToken: '',
    }
  )

  await emailService.sendPasswordChangedEmail(user.email, { name: user.name })
}

const changePassword = async (
  userId: string,
  payload: IChangePassword
): Promise<void> => {
  const user = await AuthRepository.findById(userId, {
    password: 1,
    name: 1,
    email: 1,
  })
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  const isPasswordMatched = await AuthRepository.isPasswordMatched(
    payload.oldPassword,
    user.password
  )
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect')
  }

  const hashedPassword = await hashPassword(payload.newPassword)
  await AuthRepository.findOneAndUpdate(
    { _id: userId },
    { password: hashedPassword, refreshToken: '' }
  )

  await emailService.sendPasswordChangedEmail(user.email, {
    name: user.name,
  })
}

const getProfile = async (userId: string): Promise<IUser | null> => {
  const user = await AuthRepository.findById(userId, {
    password: 0,
    refreshToken: 0,
    verificationToken: 0,
    verificationTokenExpires: 0,
    passwordResetToken: 0,
    passwordResetExpires: 0,
  })
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  return user
}

export const AuthService = {
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
