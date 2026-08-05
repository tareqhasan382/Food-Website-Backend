import { z } from 'zod'

const verifyPaymentZodSchema = z.object({
  body: z
    .object({
      paymentId: z.string().length(24, 'Invalid payment id').optional(),
      paymentIntentId: z.string().optional(),
    })
    .refine(data => data.paymentId || data.paymentIntentId, {
      message: 'Provide either paymentId or paymentIntentId',
      path: ['body'],
    }),
})

const paymentIdParamsZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid payment id'),
  }),
})

const refundZodSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
})

export const PaymentValidation = {
  verifyPaymentZodSchema,
  paymentIdParamsZodSchema,
  refundZodSchema,
}
