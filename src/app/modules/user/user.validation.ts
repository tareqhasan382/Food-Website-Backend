import { z } from 'zod'
import { UserRoles } from '../../../constants/roles'

const updateProfileZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters')
      .optional(),
    profileImg: z.string().url('Invalid image url').optional(),
  }),
})

// Role assignment is locked down: only downgrading a user to 'user' is allowed.
// Promoting anyone to admin/superAdmin via the API is disabled.
const updateRoleZodSchema = z.object({
  body: z.object({
    role: z.literal(UserRoles.USER, {
      errorMap: () => ({ message: 'Role cannot be changed' }),
    }),
  }),
})

const userIdZodSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'User id is required' }).length(24, 'Invalid user id'),
  }),
})

export const UserValidation = {
  updateProfileZodSchema,
  updateRoleZodSchema,
  userIdZodSchema,
}
