import { Model } from 'mongoose'

export type IPromotion = {
  _id: string
  title: string
  subtitle: string
  image: string
  badge: string
  validUntil: string
  isActive: boolean
}

export type IPromotionModel = Model<IPromotion, Record<string, unknown>>

export type ICreatePromotion = Omit<IPromotion, '_id'>

export type IUpdatePromotion = Partial<Omit<IPromotion, '_id'>>
