import { z } from 'zod'

const createPromotionZodSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(2, 'Title must be at least 2 characters')
      .max(120, 'Title must be at most 120 characters'),
    subtitle: z.string().max(300).optional(),
    image: z.string().url('Invalid image url').optional(),
    badge: z.string().max(30).optional(),
    validUntil: z.string().max(60).optional(),
    isActive: z.boolean().optional(),
  }),
})

const updatePromotionZodSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(2, 'Title must be at least 2 characters')
      .max(120, 'Title must be at most 120 characters')
      .optional(),
    subtitle: z.string().max(300).optional(),
    image: z.string().url('Invalid image url').optional(),
    badge: z.string().max(30).optional(),
    validUntil: z.string().max(60).optional(),
    isActive: z.boolean().optional(),
  }),
})

const promotionIdParamsZodSchema = z.object({
  params: z.object({
    id: z
      .string({ required_error: 'Promotion id is required' })
      .length(24, 'Invalid promotion id'),
  }),
})

export const PromotionValidation = {
  createPromotionZodSchema,
  updatePromotionZodSchema,
  promotionIdParamsZodSchema,
}
