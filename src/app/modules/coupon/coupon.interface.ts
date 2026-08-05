import { Model } from 'mongoose'

export const CouponTypes = ['percentage', 'fixed'] as const

export type CouponType = (typeof CouponTypes)[number]

export type ICoupon = {
  _id: string
  code: string
  type: CouponType
  value: number
  expiryDate: Date
  usageLimit: number
  usedCount: number
  minimumOrder: number
  isActive: boolean
}

export type ICouponModel = Model<ICoupon, Record<string, unknown>>

export const CouponFilterableFields = ['code', 'type', 'isActive', 'searchTerm']
export const CouponPaginationFields = ['page', 'limit', 'sortBy', 'sortOrder']
