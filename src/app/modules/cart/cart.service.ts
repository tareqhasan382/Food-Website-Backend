import httpStatus from 'http-status'
import { Types } from 'mongoose'
import ApiError from '../../../errors/ApiError'
import config from '../../../config'
import FoodModel from '../food/food.model'
import CartModel from './cart.model'
import { ICart, ICartItemResponse, ICartResponse } from './cart.interface'
import { IFood } from '../food/food.interface'

const findFoodOrThrow = async (foodId: string): Promise<IFood> => {
  const food = await FoodModel.findById(foodId)
  if (!food) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Food does not exist')
  }
  return food.toObject()
}

const assertStock = (food: IFood, quantity: number): void => {
  if (!food.availability) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Food is not available')
  }
  if (quantity > food.stock) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Only ${food.stock} units available in stock`
    )
  }
}

const addItemToCart = async (
  userId: string,
  foodId: string,
  quantity = 1
): Promise<void> => {
  const food = await findFoodOrThrow(foodId)
  assertStock(food, quantity)

  const cart = await CartModel.findOne({ userId })
  if (!cart) {
    await CartModel.create({
      userId,
      items: [{ foodId: new Types.ObjectId(foodId), quantity }],
    })
    return
  }

  const existingItem = cart.items.find(
    item => String(item.foodId) === String(foodId)
  )
  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    assertStock(food, newQuantity)
    existingItem.quantity = newQuantity
  } else {
    cart.items.push({ foodId: new Types.ObjectId(foodId), quantity })
  }
  await cart.save()
}

const getCart = async (userId: string): Promise<ICartResponse> => {
  let cart = await CartModel.findOne({ userId })
  if (!cart) {
    cart = await CartModel.create({ userId, items: [] })
  }
  return buildCartResponse(userId, cart)
}

const updateQuantity = async (
  userId: string,
  foodId: string,
  quantity: number
): Promise<void> => {
  const food = await findFoodOrThrow(foodId)
  assertStock(food, quantity)

  const cart = await CartModel.findOne({ userId })
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart is empty')
  }

  const item = cart.items.find(item => String(item.foodId) === String(foodId))
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found in cart')
  }

  item.quantity = quantity
  await cart.save()
}

const removeItem = async (userId: string, foodId: string): Promise<void> => {
  const cart = await CartModel.findOne({ userId })
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart is empty')
  }

  cart.items = cart.items.filter(
    item => String(item.foodId) !== String(foodId)
  )
  await cart.save()
}

const clearCart = async (userId: string): Promise<void> => {
  const cart = await CartModel.findOne({ userId })
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cart is empty')
  }

  cart.items = []
  await cart.save()
}

const buildCartResponse = async (
  userId: string,
  cart: ICart
): Promise<ICartResponse> => {
  const foodIds = cart.items.map(item => item.foodId)
  const foods = await FoodModel.find(
    { _id: { $in: foodIds } },
    'name price discountPrice images stock availability'
  )
  const foodMap = new Map<string, IFood>()
  foods.forEach(food => foodMap.set(String(food._id), food.toObject()))

  const items: ICartItemResponse[] = []
  let itemCount = 0

  for (const item of cart.items) {
    const food = foodMap.get(String(item.foodId))
    if (!food) continue // orphaned reference (food was deleted)

    const effectivePrice = food.discountPrice ?? food.price
    items.push({
      foodId: food,
      quantity: item.quantity,
      lineTotal: effectivePrice * item.quantity,
      itemDiscount: (food.price - effectivePrice) * item.quantity,
    })
    itemCount += item.quantity
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.foodId.price * item.quantity,
    0
  )
  const discount = items.reduce((sum, item) => sum + item.itemDiscount, 0)
  const afterDiscount = subtotal - discount
  const deliveryCharge =
    items.length === 0 || subtotal >= Number(config.delivery.free_above)
      ? 0
      : Number(config.delivery.charge)
  const total = afterDiscount + deliveryCharge

  return {
    _id: String(cart._id),
    userId,
    items,
    itemCount,
    subtotal,
    discount,
    deliveryCharge,
    total,
  }
}

export const CartService = {
  addItemToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
}
