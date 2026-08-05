import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import {
  authenticate,
  authorize,
  authorizeRoles,
} from '../../middlewares/auth'
import { Permissions } from '../../../constants/permissions'
import { UserRoles } from '../../../constants/roles'
import { OrderController } from './order.controller'
import { OrderValidation } from './order.validation'

const router = express.Router()

// ===================== User APIs =====================
router.post(
  '/orders',
  authenticate,
  authorize(Permissions.ORDER_CREATE),
  validateRequest(OrderValidation.placeOrderZodSchema),
  OrderController.placeOrder
)

router.get(
  '/orders',
  authenticate,
  authorize(Permissions.ORDER_READ),
  OrderController.getOrderHistory
)

router.get(
  '/orders/:id',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(OrderValidation.orderIdParamsZodSchema),
  OrderController.getOrderById
)

router.post(
  '/orders/:id/cancel',
  authenticate,
  authorize(Permissions.ORDER_READ),
  validateRequest(OrderValidation.orderIdParamsZodSchema),
  validateRequest(OrderValidation.cancelOrderZodSchema),
  OrderController.cancelOrder
)

// ===================== Admin APIs =====================
router.get(
  '/admin/orders',
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
  OrderController.getAdminOrders
)

router.get(
  '/admin/orders/stats',
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
  OrderController.getOrderStats
)

router.get(
  '/admin/orders/:id',
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
  validateRequest(OrderValidation.orderIdParamsZodSchema),
  OrderController.getAdminOrderById
)

router.patch(
  '/admin/orders/:id/status',
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
  validateRequest(OrderValidation.orderIdParamsZodSchema),
  validateRequest(OrderValidation.updateOrderStatusZodSchema),
  OrderController.updateStatus
)

export const OrderRoute = router
