import express from 'express'

import { AuthController } from './auth.controller'

// import { authVerify } from '../../middlewares/auth'

//export const UserValidation = { createUserZodSchema }
const router = express.Router()
// auth/signup
router.post('/auth/login', AuthController.LoginUser),
  router.post('/auth/signup', AuthController.createUser)
export const AuthRoute = router
