import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { authenticate, authorize, authorizeRoles } from '../../middlewares/auth'
import { Permissions } from '../../../constants/permissions'
import { UserRoles } from '../../../constants/roles'
import { UserController } from './user.controller'
import { UserValidation } from './user.validation'

const router = express.Router()

// ===================== User-only APIs =====================
router.get(
  '/users/me',
  authenticate,
  authorize(Permissions.PROFILE_READ),
  UserController.getMyProfile
)

router.put(
  '/users/me',
  authenticate,
  authorize(Permissions.PROFILE_UPDATE),
  validateRequest(UserValidation.updateProfileZodSchema),
  UserController.updateMyProfile
)

// ===================== Admin-only APIs =====================
router.get(
  '/admin/users',
  authenticate,
  authorize(Permissions.USER_READ),
  UserController.getAllUsers
)

router.get(
  '/admin/users/:id',
  authenticate,
  authorize(Permissions.USER_READ),
  validateRequest(UserValidation.userIdZodSchema),
  UserController.getUserById
)

router.patch(
  '/admin/users/:id/role',
  authenticate,
  authorize(Permissions.USER_UPDATE),
  validateRequest(UserValidation.userIdZodSchema),
  validateRequest(UserValidation.updateRoleZodSchema),
  UserController.updateUserRole
)

router.delete(
  '/admin/users/:id',
  authenticate,
  authorize(Permissions.USER_DELETE),
  validateRequest(UserValidation.userIdZodSchema),
  UserController.deleteUser
)

// Role-based demo: only admins (and superAdmins) can access
router.get(
  '/admin/stats',
  authenticate,
  authorizeRoles(UserRoles.ADMIN, UserRoles.SUPER_ADMIN),
  UserController.getAllUsers
)

export const UserRoute = router
