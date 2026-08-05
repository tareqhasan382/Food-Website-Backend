import { z } from 'zod'
import { CouponTypes } from './coupon.interface'

const couponFieldsSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters'),
  type: z.enum(CouponTypes),
  value: z.number().positive('Value must be a positive number'),
  expiryDate: z.union([z.string().min(1), z.date()]),
  usageLimit: z
    .number()
    .int('Usage limit must be an integer')
    .min(1, 'Usage limit must be at least 1'),
  minimumOrder: z.number().min(0, 'Minimum order cannot be negative').optional(),
  isActive: z.boolean().optional(),
})

const createCouponZodSchema = z.object({
  body: couponFieldsSchema.refine(
    data => data.type !== 'percentage' || data.value <= 100,
    { message: 'Percentage coupon value must be at most 100', path: ['value'] }
  ),
})

const updateCouponZodSchema = z.object({
  body: couponFieldsSchema
    .partial()
    .refine(
      data => data.type !== 'percentage' || (data.value ?? 0) <= 100,
      {
        message: 'Percentage coupon value must be at most 100',
        path: ['value'],
      }
    ),
})

const couponIdParamsZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid coupon id'),
  }),
})

const couponCodeZodSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code must be at most 20 characters'),
  }),
})

const validateCouponZodSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(3, 'Code must be at least 3 characters')
      .max(20, 'Code must be at most 20 characters'),
    subtotal: z
      .number()
      .min(0, 'Subtotal cannot be negative')
      .optional(),
  }),
})

export const CouponValidation = {
  createCouponZodSchema,
  updateCouponZodSchema,
  couponIdParamsZodSchema,
  couponCodeZodSchema,
  validateCouponZodSchema,
}
