import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import {
  authenticate,
  authorize,
  authorizeRoles,
} from '../../middlewares/auth'
import { Permissions } from '../../../constants/permissions'
import { UserRoles } from '../../../constants/roles'
import { InvoiceController } from './invoice.controller'
import { InvoiceValidation } from './invoice.validation'

const router = express.Router()

const adminGuard = [
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
]

// ===================== User APIs =====================
router.get(
  '/orders/:orderId/invoice',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(InvoiceValidation.orderIdParamsZodSchema),
  InvoiceController.getInvoice
)

router.get(
  '/orders/:orderId/invoice/view',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(InvoiceValidation.orderIdParamsZodSchema),
  InvoiceController.viewInvoice
)

router.get(
  '/orders/:orderId/invoice/download',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(InvoiceValidation.orderIdParamsZodSchema),
  InvoiceController.downloadInvoice
)

router.get(
  '/invoices',
  authenticate,
  authorize(Permissions.ORDER_READ),
  InvoiceController.getMyInvoices
)

router.get(
  '/invoices/:id',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(InvoiceValidation.invoiceIdParamsZodSchema),
  InvoiceController.getMyInvoiceById
)

// ===================== Admin APIs =====================
router.get(
  '/admin/orders/:orderId/invoice',
  ...adminGuard,
  validateRequest(InvoiceValidation.orderIdParamsZodSchema),
  InvoiceController.getAdminInvoice
)

router.get(
  '/admin/invoices',
  ...adminGuard,
  InvoiceController.getAdminInvoices
)

router.get(
  '/admin/invoices/:id',
  ...adminGuard,
  validateRequest(InvoiceValidation.invoiceIdParamsZodSchema),
  InvoiceController.getAdminInvoiceById
)

export const InvoiceRoute = router
