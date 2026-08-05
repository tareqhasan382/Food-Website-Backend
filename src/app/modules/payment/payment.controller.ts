import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { PaymentService } from './payment.service'
import {
  IPayment,
  PaymentFilterableFields,
  PaymentPaginationFields,
} from './payment.interface'

const getUserId = (req: Request): string => req.user?.userId as string

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentIntent(getUserId(req))

  sendResponse<{ payment: IPayment; clientSecret: string | null }>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment intent created successfully!',
    data: result,
  })
})

const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId, paymentIntentId } = req.body
  const result = await PaymentService.verifyPayment(getUserId(req), {
    paymentId,
    paymentIntentId,
  })

  sendResponse<IPayment>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment verified successfully!',
    data: result,
  })
})

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, PaymentFilterableFields)
  const paginationOptions = pick(req.query, PaymentPaginationFields)
  const result = await PaymentService.getPaymentHistory(
    getUserId(req),
    filters,
    paginationOptions
  )

  sendResponse<IPayment[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentById(
    getUserId(req),
    req.params.id
  )

  sendResponse<IPayment>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment fetched successfully!',
    data: result,
  })
})

const refundPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.refundPayment(
    getUserId(req),
    req.params.id,
    req.body?.reason
  )

  sendResponse<IPayment>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment refunded successfully!',
    data: result,
  })
})

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const eventType = await PaymentService.handleWebhook(
    req.body as Buffer,
    req.headers['stripe-signature'] as string | undefined
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Webhook received: ${eventType}`,
    data: { received: true },
  })
})

export const PaymentController = {
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  refundPayment,
  handleWebhook,
}
