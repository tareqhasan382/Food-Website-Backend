import { Model, Types } from 'mongoose'

export type ICategory = {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Types.ObjectId | null
  isActive: boolean
}

export type ICategoryModel = Model<ICategory, Record<string, unknown>>

export type ICreateCategory = {
  name: string
  description?: string
  image?: string
  parent?: string | null
  isActive?: boolean
}

export type IUpdateCategory = Partial<Omit<ICreateCategory, 'name'>> & {
  name?: string
}

export type ICategoryTree = ICategory & {
  children: ICategoryTree[]
}
