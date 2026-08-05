import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { pick } from '../../../helpers/pick'
import { InvoiceService } from './invoice.service'
import { renderInvoiceHtml } from './invoice.templates'
import {
  IInvoice,
  InvoiceFilterableFields,
  InvoicePaginationFields,
} from './invoice.interface'

const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.getMyInvoice(
    req.user?.userId as string,
    req.params.orderId
  )

  sendResponse<IInvoice>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice fetched successfully!',
    data: result,
  })
})

const getMyInvoices = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, InvoiceFilterableFields)
  const paginationOptions = pick(req.query, InvoicePaginationFields)
  const result = await InvoiceService.getMyInvoices(
    req.user?.userId as string,
    filters,
    paginationOptions
  )

  sendResponse<IInvoice[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getMyInvoiceById = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.getMyInvoiceById(
    req.user?.userId as string,
    req.params.id
  )

  sendResponse<IInvoice>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice fetched successfully!',
    data: result,
  })
})

const viewInvoice = catchAsync(async (req: Request, res: Response) => {
  const data = await InvoiceService.getInvoiceViewData(
    req.params.orderId,
    req.user?.userId
  )

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(renderInvoiceHtml(data))
})

const downloadInvoice = catchAsync(async (req: Request, res: Response) => {
  const data = await InvoiceService.getInvoiceViewData(
    req.params.orderId,
    req.user?.userId
  )

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="invoice-${data.invoice.invoiceNumber}.html"`
  )
  res.send(renderInvoiceHtml(data))
})

const getAdminInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await InvoiceService.getAdminInvoice(req.params.orderId)

  sendResponse<IInvoice>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice fetched successfully!',
    data: result,
  })
})

const getAdminInvoices = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, InvoiceFilterableFields)
  const paginationOptions = pick(req.query, InvoicePaginationFields)
  const result = await InvoiceService.getAdminInvoices(
    filters,
    paginationOptions
  )

  sendResponse<IInvoice[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices fetched successfully!',
    meta: result.meta,
    data: result.data,
  })
})

const getAdminInvoiceById = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InvoiceService.getAdminInvoiceById(req.params.id)

    sendResponse<IInvoice>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Invoice fetched successfully!',
      data: result,
    })
  }
)

export const InvoiceController = {
  getInvoice,
  getMyInvoices,
  getMyInvoiceById,
  viewInvoice,
  downloadInvoice,
  getAdminInvoice,
  getAdminInvoices,
  getAdminInvoiceById,
}
