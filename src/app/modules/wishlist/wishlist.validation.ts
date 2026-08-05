import { z } from 'zod'

const addItemZodSchema = z.object({
  body: z.object({
    foodId: z
      .string({ required_error: 'Food id is required' })
      .length(24, 'Invalid food id'),
  }),
})

const foodIdParamsZodSchema = z.object({
  params: z.object({
    foodId: z.string().length(24, 'Invalid food id'),
  }),
})

export const WishlistValidation = {
  addItemZodSchema,
  foodIdParamsZodSchema,
}
