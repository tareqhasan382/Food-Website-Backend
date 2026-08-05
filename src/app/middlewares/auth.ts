import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'
import ApiError from '../../errors/ApiError'
import config from '../../config'
import { jwtHelpers } from '../../helpers/jwtHelpers'
import { IJwtPayload } from '../modules/auth/auth.interface'
import { Permissions, RolePermissions } from '../../constants/permissions'
import { UserRole } from '../../constants/roles'

/**
 * Authentication: verifies the access token and attaches the decoded
 * user payload (userId, email, role) to `req.user`.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization

    if (!token || !token.startsWith('Bearer ')) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized to access this route'
      )
    }

    const accessToken = token.split(' ')[1]

    let verifiedUser: IJwtPayload
    try {
      verifiedUser = jwtHelpers.verifyToken(
        accessToken,
        config.jwt.secret as Secret
      ) as IJwtPayload
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Invalid or expired access token'
      )
    }

    req.user = {
      userId: verifiedUser.userId,
      email: verifiedUser.email,
      role: verifiedUser.role,
    }

    next()
  } catch (error) {
    next(error)
  }
}

const hasPermission = (
  role: UserRole,
  requiredPermissions: string[]
): boolean => {
  const rolePermissions = RolePermissions[role] ?? []
  if (rolePermissions.includes(Permissions.ALL)) {
    return true
  }
  return requiredPermissions.every(permission =>
    rolePermissions.includes(permission)
  )
}

/**
 * Authorization: permission-based check. Must be used after `authenticate`.
 * e.g. authenticate(), authorize(Permissions.USER_READ)
 */
export const authorize =
  (...requiredPermissions: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const role = req.user?.role as UserRole | undefined
      if (!role) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required')
      }
      if (!hasPermission(role, requiredPermissions)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action'
        )
      }
      next()
    } catch (error) {
      next(error)
    }
  }

/**
 * Authorization: role-based check. Must be used after `authenticate`.
 * e.g. authenticate(), authorizeRoles(UserRoles.ADMIN)
 */
export const authorizeRoles =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const role = req.user?.role as UserRole | undefined
      if (!role) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required')
      }
      if (!allowedRoles.includes(role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You do not have permission to access this resource'
        )
      }
      next()
    } catch (error) {
      next(error)
    }
  }
