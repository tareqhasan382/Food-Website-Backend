import { z } from 'zod'

const registerUserZodSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
    profileImg: z.string().optional(),
  }),
})

const loginUserZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z.string({ required_error: 'Password is required' }),
  }),
})

const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required' }),
  }),
})

const verifyEmailZodSchema = z.object({
  query: z.object({
    token: z.string({ required_error: 'Verification token is required' }),
  }),
})

const forgotPasswordZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
  }),
})

const resetPasswordZodSchema = z.object({
  query: z.object({
    token: z.string({ required_error: 'Reset token is required' }),
  }),
  body: z.object({
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
  }),
})

const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
  }),
})

export const AuthValidation = {
  registerUserZodSchema,
  loginUserZodSchema,
  refreshTokenZodSchema,
  verifyEmailZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema,
  changePasswordZodSchema,
}
