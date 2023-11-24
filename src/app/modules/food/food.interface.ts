import { Model } from 'mongoose'

export type IFood = {
  _id?: string
  name: string
  Image: string
  category: string
  price: number
}

export type IFoodModel = Model<IFood, Record<string, unknown>>

export type ITrips = {
  title: string
  description: string
  imageSrc: string
  category: string
  roomCount: number
  bathroomCount: number
  guestCount: number
  locationValue: string
  price: number
  userId: string
}

export type IFoodFiltersRequest = {
  searchTerm?: string
}
export const FoodSearchAbleFields = ['category']

export const FoodFilterAbleFileds = [
  'searchTerm',
  'title',
  'category',
  'price',
  'sortBy',
  'sortOrder',
  'minPrice',
  'maxPrice',
]
export type IFoodFilters = {
  searchTerm?: string
  category?: string
}
