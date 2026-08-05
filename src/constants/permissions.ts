import { UserRole, UserRoles } from './roles'

export enum Permissions {
  // profile
  PROFILE_READ = 'profile:read',
  PROFILE_UPDATE = 'profile:update',
  // orders
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  // coupons
  COUPON_USE = 'coupon:use',
  // reviews
  REVIEW_CREATE = 'review:create',
  REVIEW_READ = 'review:read',
  REVIEW_UPDATE = 'review:update',
  REVIEW_DELETE = 'review:delete',
  // foods
  FOOD_CREATE = 'food:create',
  FOOD_UPDATE = 'food:update',
  FOOD_DELETE = 'food:delete',
  // categories
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  // user management (admin only)
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  // wildcard - grants access to every action
  ALL = '*',
}

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRoles.SUPER_ADMIN]: [Permissions.ALL],
  [UserRoles.ADMIN]: [Permissions.ALL],
  [UserRoles.USER]: [
    Permissions.PROFILE_READ,
    Permissions.PROFILE_UPDATE,
    Permissions.ORDER_READ,
    Permissions.ORDER_CREATE,
    Permissions.COUPON_USE,
    Permissions.REVIEW_READ,
    Permissions.REVIEW_CREATE,
    Permissions.REVIEW_UPDATE,
    Permissions.REVIEW_DELETE,
  ],
}
