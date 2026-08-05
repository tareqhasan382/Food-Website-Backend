import { Model, Types } from 'mongoose'
import { IFood } from '../food/food.interface'

export type ICartItem = {
  foodId: Types.ObjectId
  quantity: number
}

export type ICart = {
  _id: string
  userId: Types.ObjectId
  items: ICartItem[]
}

export type ICartModel = Model<ICart, Record<string, unknown>>

export type ICartItemResponse = {
  foodId: IFood
  quantity: number
  lineTotal: number
  itemDiscount: number
}

export type ICartResponse = {
  _id: string
  userId: string
  items: ICartItemResponse[]
  itemCount: number
  subtotal: number
  discount: number
  deliveryCharge: number
  total: number
}
