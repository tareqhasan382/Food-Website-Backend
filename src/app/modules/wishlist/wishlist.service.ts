import httpStatus from 'http-status'
import { Types } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import FoodModel from '../food/food.model'
import WishlistModel from './wishlist.model'
import { IWishlist, IWishlistResponse } from './wishlist.interface'
import { IFood } from '../food/food.interface'
import { CartService } from '../cart/cart.service'

const findFoodOrThrow = async (foodId: string): Promise<IFood> => {
  const food = await FoodModel.findById(foodId)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }
  return food.toObject()
}

const getWishlist = async (userId: string): Promise<IWishlistResponse> => {
  let wishlist = await WishlistModel.findOne({ userId })
  if (!wishlist) {
    wishlist = await WishlistModel.create({ userId, items: [] })
  }
  return buildWishlistResponse(userId, wishlist)
}

const addItem = async (userId: string, foodId: string): Promise<void> => {
  const food = await findFoodOrThrow(foodId)

  const wishlist = await WishlistModel.findOne({ userId })
  if (!wishlist) {
    await WishlistModel.create({ userId, items: [food._id] })
    return
  }

  if (!wishlist.items.some(id => String(id) === String(foodId))) {
    wishlist.items.push(new Types.ObjectId(foodId))
    await wishlist.save()
  }
}

const removeItem = async (userId: string, foodId: string): Promise<void> => {
  await WishlistModel.findOneAndUpdate(
    { userId },
    { $pull: { items: foodId } }
  )
}

const moveToCart = async (userId: string, foodId: string): Promise<void> => {
  await findFoodOrThrow(foodId)
  await CartService.addItemToCart(userId, foodId, 1)
  await WishlistModel.findOneAndUpdate(
    { userId },
    { $pull: { items: foodId } }
  )
}

const buildWishlistResponse = async (
  userId: string,
  wishlist: IWishlist
): Promise<IWishlistResponse> => {
  const foods = await FoodModel.find(
    { _id: { $in: wishlist.items } },
    'name price discountPrice images stock availability'
  )

  return {
    _id: String(wishlist._id),
    userId,
    foods: foods.map(food => food.toObject()),
    totalItems: foods.length,
  }
}

export const WishlistService = {
  getWishlist,
  addItem,
  removeItem,
  moveToCart,
}
