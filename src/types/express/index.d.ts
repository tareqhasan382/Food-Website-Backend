import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user?: JwtPayload & {
        userId?: string
        email?: string
        role?: string
      }
    }
  }
}

export {}
