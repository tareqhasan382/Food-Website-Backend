import { z } from 'zod'

const addItemZodSchema = z.object({
  body: z.object({
    foodId: z
      .string({ required_error: 'Food id is required' })
      .length(24, 'Invalid food id'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional(),
  }),
})

const updateQuantityZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
  }),
})

const foodIdParamsZodSchema = z.object({
  params: z.object({
    foodId: z.string().length(24, 'Invalid food id'),
  }),
})

export const CartValidation = {
  addItemZodSchema,
  updateQuantityZodSchema,
  foodIdParamsZodSchema,
}
