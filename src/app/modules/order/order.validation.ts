import { z } from 'zod'
import { OrderStatuses } from './order.interface'

const placeOrderZodSchema = z.object({
  body: z.object({
    paymentId: z.string().length(24, 'Invalid payment id').optional(),
    deliveryAddress: z
      .object({
        fullName: z.string().max(100).optional(),
        phone: z.string().max(30).optional(),
        address: z.string().max(300).optional(),
        city: z.string().max(100).optional(),
      })
      .optional(),
  }),
})

const orderIdParamsZodSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid order id'),
  }),
})

const cancelOrderZodSchema = z.object({
  body: z.object({
    note: z.string().max(300).optional(),
  }),
})

const updateOrderStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(OrderStatuses, {
      required_error: 'Status is required',
    }),
    note: z.string().max(300).optional(),
  }),
})

export const OrderValidation = {
  placeOrderZodSchema,
  orderIdParamsZodSchema,
  cancelOrderZodSchema,
  updateOrderStatusZodSchema,
}
