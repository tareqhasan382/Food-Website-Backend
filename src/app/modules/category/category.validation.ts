import { z } from 'zod'

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(1, 'Category name cannot be empty')
      .max(100, 'Category name must be at most 100 characters'),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),
    image: z.string().optional(),
    parent: z.string().length(24, 'Invalid parent category id').nullable().optional(),
    isActive: z.boolean().optional(),
  }),
})

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name cannot be empty')
      .max(100, 'Category name must be at most 100 characters')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description must be at most 1000 characters')
      .optional(),
    image: z.string().optional(),
    parent: z.string().length(24, 'Invalid parent category id').nullable().optional(),
    isActive: z.boolean().optional(),
  }),
})

const categoryIdZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid category id'),
  }),
})

export const CategoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
  categoryIdZodSchema,
}
