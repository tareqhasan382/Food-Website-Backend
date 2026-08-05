import { Model, Types } from 'mongoose'
import { IFood } from '../food/food.interface'

export type IWishlist = {
  _id: string
  userId: Types.ObjectId
  items: Types.ObjectId[]
}

export type IWishlistModel = Model<IWishlist, Record<string, unknown>>

export type IWishlistResponse = {
  _id: string
  userId: string
  foods: IFood[]
  totalItems: number
}
