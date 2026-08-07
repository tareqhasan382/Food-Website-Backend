import rateLimit from 'express-rate-limit'
import config from '../../config'
import ApiError from '../../errors/ApiError'

// General API limiter applied to every route. The Stripe webhook is excluded
// so Stripe can deliver events without being throttled.
export const apiRateLimiter = rateLimit({
  windowMs: config.rate_limit.window_minutes * 60 * 1000,
  limit: config.rate_limit.api_max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: req => req.originalUrl.includes('/payments/webhook'),
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests, please try again later.'))
  },
})

// Stricter limiter for sensitive auth endpoints (login, register, password
// reset, token refresh) to slow down brute-force / credential-stuffing attacks.
export const authRateLimiter = rateLimit({
  windowMs: config.rate_limit.window_minutes * 60 * 1000,
  limit: config.rate_limit.auth_max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many attempts, please try again later.'))
  },
})
