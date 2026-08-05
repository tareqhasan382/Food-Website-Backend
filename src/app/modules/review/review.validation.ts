import { z } from 'zod'

const createReviewZodSchema = z.object({
  body: z.object({
    foodId: z
      .string({ required_error: 'Food id is required' })
      .length(24, 'Invalid food id'),
    rating: z
      .number({ required_error: 'Rating is required' })
      .int('Rating must be an integer')
      .min(1, 'Rating must be between 1 and 5')
      .max(5, 'Rating must be between 1 and 5'),
    comment: z.string().max(1000).optional(),
  }),
})

const updateReviewZodSchema = z.object({
  body: z
    .object({
      rating: z
        .number()
        .int('Rating must be an integer')
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5')
        .optional(),
      comment: z.string().max(1000).optional(),
    })
    .refine(data => data.rating !== undefined || data.comment !== undefined, {
      message: 'Provide rating or comment to update',
      path: ['body'],
    }),
})

const reviewIdParamsZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid review id'),
  }),
})

const foodIdParamsZodSchema = z.object({
  params: z.object({
    foodId: z.string().length(24, 'Invalid food id'),
  }),
})

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
  reviewIdParamsZodSchema,
  foodIdParamsZodSchema,
}
