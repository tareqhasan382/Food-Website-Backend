import { z } from 'zod'

const daysQueryZodSchema = z.object({
  query: z.object({
    days: z.coerce
      .number()
      .int('Days must be an integer')
      .min(1, 'Days must be at least 1')
      .max(365, 'Days must be at most 365')
      .optional(),
  }),
})

const monthsQueryZodSchema = z.object({
  query: z.object({
    months: z.coerce
      .number()
      .int('Months must be an integer')
      .min(1, 'Months must be at least 1')
      .max(60, 'Months must be at most 60')
      .optional(),
  }),
})

const bestSellingQueryZodSchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(50, 'Limit must be at most 50')
      .optional(),
  }),
})

export const DashboardValidation = {
  daysQueryZodSchema,
  monthsQueryZodSchema,
  bestSellingQueryZodSchema,
}
