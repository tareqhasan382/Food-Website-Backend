import httpStatus from 'http-status'
import { SortOrder } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import { IGenericResponse } from '../../../interface/common'
import AuthModel from '../auth/auth.model'
import { UserRoles } from '../../../constants/roles'
import { IUser } from '../auth/auth.interface'

const SAFE_PROJECTION = {
  password: 0,
  refreshToken: 0,
  verificationToken: 0,
  verificationTokenExpires: 0,
  passwordResetToken: 0,
  passwordResetExpires: 0,
}

const getAllUsers = async (
  payload: { page?: string; limit?: string; searchTerm?: string }
): Promise<IGenericResponse<IUser[]>> => {
  const page = parseInt(payload.page || '1')
  const limit = parseInt(payload.limit || '10')
  const sort: { [key: string]: SortOrder } = { createdAt: -1 }

  const query: { name?: { $regex: RegExp } } = {}
  if (payload.searchTerm) {
    query.name = { $regex: new RegExp(payload.searchTerm, 'i') }
  }

  const count = await AuthModel.countDocuments(query)
  const result = await AuthModel.find(query, SAFE_PROJECTION)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)

  return {
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    data: result.map(user => user.toObject()),
  }
}

const getUserById = async (id: string): Promise<IUser> => {
  const user = await AuthModel.findById(id, SAFE_PROJECTION)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  return user.toObject()
}

const updateUserRole = async (
  id: string,
  role: IUser['role']
): Promise<IUser> => {
  // Locked down: nobody (including admins) can promote anyone to admin/superAdmin.
  if (role === UserRoles.ADMIN || role === UserRoles.SUPER_ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Assigning the admin role is not allowed'
    )
  }

  const user = await AuthModel.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select(SAFE_PROJECTION)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  return user.toObject()
}

const deleteUser = async (id: string): Promise<void> => {
  const user = await AuthModel.findByIdAndDelete(id)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
}

const getMyProfile = async (userId: string): Promise<IUser> => {
  const user = await AuthModel.findById(userId, SAFE_PROJECTION)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  return user.toObject()
}

const updateMyProfile = async (
  userId: string,
  payload: { name?: string; profileImg?: string }
): Promise<IUser> => {
  const user = await AuthModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select(SAFE_PROJECTION)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  return user.toObject()
}

export const UserService = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getMyProfile,
  updateMyProfile,
}
