/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import jwt, { Secret } from 'jsonwebtoken'
import config from '../../config'

export const authVerify =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization

      if (!token) {
        return res
          .status(httpStatus.UNAUTHORIZED)
          .json('You Are Not Authorized')
        //throw new ApiError(httpStatus.UNAUTHORIZED, 'You Are Not Authorized')
      }

      //2 verify token
      // verify token
      let vefifiedUser = null
      vefifiedUser = jwt.verify(token, config.jwt.secret as Secret)
      req.user = vefifiedUser // role , userId
      const { role }: any = vefifiedUser
      // role authorise
      if (requiredRoles.length && !requiredRoles.includes(role)) {
        return res.status(httpStatus.FORBIDDEN).json('Forbidden')
        //  throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
