import { z } from 'zod'
import { FoodCategories } from './food.interface'

const createFoodZodSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
      description: z
        .string({ required_error: 'Description is required' })
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be at most 2000 characters'),
      price: z
        .number({ required_error: 'Price is required' })
        .positive('Price must be greater than 0'),
      discountPrice: z.number().nonnegative().optional(),
      category: z.enum(FoodCategories, {
        errorMap: () => ({
          message: `Category must be one of: ${FoodCategories.join(', ')}`,
        }),
      }),
      images: z
        .array(z.string().url('Each image must be a valid url'))
        .min(1, 'At least one image is required')
        .max(10, 'At most 10 images are allowed'),
      stock: z
        .number({ required_error: 'Stock is required' })
        .int('Stock must be an integer')
        .nonnegative('Stock cannot be negative'),
      ingredients: z.array(z.string()).optional(),
      preparationTime: z.number().int().positive().optional(),
      calories: z.number().nonnegative().optional(),
      rating: z.number().min(0).max(5).optional(),
      availability: z.boolean().optional(),
    })
    .refine(data => data.discountPrice === undefined || data.discountPrice < data.price, {
      message: 'Discount price must be less than the regular price',
      path: ['discountPrice'],
    }),
})

const updateFoodZodSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters')
        .optional(),
      description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be at most 2000 characters')
        .optional(),
      price: z.number().positive('Price must be greater than 0').optional(),
      discountPrice: z.number().nonnegative().optional(),
      category: z.enum(FoodCategories).optional(),
      images: z
        .array(z.string().url('Each image must be a valid url'))
        .min(1, 'At least one image is required')
        .max(10, 'At most 10 images are allowed')
        .optional(),
      stock: z.number().int().nonnegative().optional(),
      ingredients: z.array(z.string()).optional(),
      preparationTime: z.number().int().positive().optional(),
      calories: z.number().nonnegative().optional(),
      rating: z.number().min(0).max(5).optional(),
      availability: z.boolean().optional(),
    })
    .superRefine(data => {
      if (
        data.discountPrice !== undefined &&
        data.price !== undefined &&
        data.discountPrice >= data.price
      ) {
        return { message: 'Discount price must be less than the regular price' }
      }
    }),
})

const foodIdZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid food id'),
  }),
})

export const FoodValidation = {
  createFoodZodSchema,
  updateFoodZodSchema,
  foodIdZodSchema,
}
