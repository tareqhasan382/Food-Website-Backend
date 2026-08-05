import { FilterQuery, UpdateQuery } from 'mongoose'
import AuthModel from './auth.model'
import { IUser } from './auth.interface'

const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  const user = await AuthModel.create(payload)
  return user.toObject()
}

const findOne = async (
  filter: FilterQuery<IUser>,
  projection?: Record<string, unknown>
): Promise<IUser | null> => {
  const user = await AuthModel.findOne(filter, projection)
  return user ? user.toObject() : null
}

const findById = async (
  id: string,
  projection?: Record<string, unknown>
): Promise<IUser | null> => {
  const user = await AuthModel.findById(id, projection)
  return user ? user.toObject() : null
}

const findOneAndUpdate = async (
  filter: FilterQuery<IUser>,
  update: UpdateQuery<IUser>,
  options?: { new?: boolean; runValidators?: boolean }
): Promise<IUser | null> => {
  const user = await AuthModel.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
    ...options,
  })
  return user ? user.toObject() : null
}

const findOneAndDelete = async (
  filter: FilterQuery<IUser>
): Promise<IUser | null> => {
  const user = await AuthModel.findOneAndDelete(filter)
  return user ? user.toObject() : null
}

const isPasswordMatched = async (
  givenPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await AuthModel.isPasswordMatched(givenPassword, hashedPassword)
}

export const AuthRepository = {
  createUser,
  findOne,
  findById,
  findOneAndUpdate,
  findOneAndDelete,
  isPasswordMatched,
}
