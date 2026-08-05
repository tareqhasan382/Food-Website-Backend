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

const updateRoleZodSchema = z.object({
  body: z.object({
    role: z.enum([UserRoles.ADMIN, UserRoles.USER], {
      errorMap: () => ({ message: 'Role must be admin or user' }),
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
