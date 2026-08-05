import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { authenticate, authorizeRoles } from '../../middlewares/auth'
import { UserRoles } from '../../../constants/roles'
import { DashboardController } from './dashboard.controller'
import { DashboardValidation } from './dashboard.validation'

const router = express.Router()

const adminGuard = [
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
]

router.get('/admin/dashboard/overview', ...adminGuard, DashboardController.getOverview)

router.get(
  '/admin/dashboard/sales/daily',
  ...adminGuard,
  validateRequest(DashboardValidation.daysQueryZodSchema),
  DashboardController.getDailySales
)

router.get(
  '/admin/dashboard/sales/monthly',
  ...adminGuard,
  validateRequest(DashboardValidation.monthsQueryZodSchema),
  DashboardController.getMonthlySales
)

router.get(
  '/admin/dashboard/charts/revenue',
  ...adminGuard,
  validateRequest(DashboardValidation.daysQueryZodSchema),
  DashboardController.getRevenueChart
)

router.get(
  '/admin/dashboard/charts/orders',
  ...adminGuard,
  validateRequest(DashboardValidation.daysQueryZodSchema),
  DashboardController.getOrdersChart
)

router.get(
  '/admin/dashboard/charts/users',
  ...adminGuard,
  validateRequest(DashboardValidation.daysQueryZodSchema),
  DashboardController.getUsersChart
)

router.get(
  '/admin/dashboard/best-selling-foods',
  ...adminGuard,
  validateRequest(DashboardValidation.bestSellingQueryZodSchema),
  DashboardController.getBestSellingFoods
)

export const DashboardRoute = router
