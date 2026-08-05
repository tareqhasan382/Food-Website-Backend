export enum UserRoles {
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
  USER = 'user',
}

export type UserRole = `${UserRoles}`
