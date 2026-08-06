import { Model } from 'mongoose'

export type FoodCategory = string

export const FoodSearchableFields = ['name', 'description', 'category']
export const FoodFilterableFields = [
  'searchTerm',
  'category',
  'minPrice',
  'maxPrice',
  'minRating',
  'minStock',
  'minPrepTime',
  'maxPrepTime',
  'availability',
  'popular',
  'latest',
]
export const FoodPaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']

export type FoodSortBy = 'price' | 'rating' | 'newest' | 'oldest'

export type IFood = {
  _id: string
  name: string
  description: string
  price: number
  discountPrice?: number
  category: FoodCategory
  images: string[]
  stock: number
  ingredients: string[]
  preparationTime: number
  calories: number
  rating: number
  averageRating?: number
  ratingCount?: number
  availability: boolean
}

export type IFoodModel = Model<IFood, Record<string, unknown>>

export type IFoodFilters = {
  searchTerm?: string
  category?: FoodCategory
  minPrice?: number
  maxPrice?: number
  minRating?: number
  minStock?: number
  minPrepTime?: number
  maxPrepTime?: number
  availability?: boolean
  popular?: boolean
  latest?: boolean
}

export type IPaginationOptions = {
  page?: number
  limit?: number
  sortBy?: FoodSortBy
  sortOrder?: 'asc' | 'desc'
}

export type ICreateFood = Omit<IFood, '_id'>

export type IUpdateFood = Partial<Omit<IFood, '_id'>>
