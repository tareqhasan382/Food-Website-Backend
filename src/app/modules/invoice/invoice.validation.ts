import { z } from 'zod'

const orderIdParamsZodSchema = z.object({
  params: z.object({
    orderId: z.string().length(24, 'Invalid order id'),
  }),
})

const invoiceIdParamsZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid invoice id'),
  }),
})

export const InvoiceValidation = {
  orderIdParamsZodSchema,
  invoiceIdParamsZodSchema,
}
