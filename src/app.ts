import express, { Application, NextFunction, Request, Response } from 'express'
const app: Application = express()
import cors from 'cors'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import httpStatus from 'http-status'
//import ApiError from './errors/ApiError'
import { AuthRoute } from './app/modules/auth/auth.route'
import cookieParser from 'cookie-parser'
import { FoodRoute } from './app/modules/food/food.route'
import { UserRoute } from './app/modules/user/user.route'
import { CategoryRoute } from './app/modules/category/category.route'
import { CartRoute } from './app/modules/cart/cart.route'
import { WishlistRoute } from './app/modules/wishlist/wishlist.route'
import { PaymentRoute } from './app/modules/payment/payment.route'
import { OrderRoute } from './app/modules/order/order.route'
import { ReviewRoute } from './app/modules/review/review.route'
import { DashboardRoute } from './app/modules/dashboard/dashboard.route'
import { CouponRoute } from './app/modules/coupon/coupon.route'
import { InvoiceRoute } from './app/modules/invoice/invoice.route'

const corsOptions = {
  origin: [
    'http://localhost:5173'
  ],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
// app.use(cors(corsOptions))
app.use(cookieParser())
// Stripe webhook needs the raw body before the JSON parser consumes it
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' })
)
//parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Applications route

app.use('/api/v1', AuthRoute)
app.use('/api/v1', FoodRoute)
app.use('/api/v1', UserRoute)
app.use('/api/v1', CategoryRoute)
app.use('/api/v1', CartRoute)
app.use('/api/v1', WishlistRoute)
app.use('/api/v1', PaymentRoute)
app.use('/api/v1', OrderRoute)
app.use('/api/v1', ReviewRoute)
app.use('/api/v1', DashboardRoute)
app.use('/api/v1', CouponRoute)
app.use('/api/v1', InvoiceRoute)
//Testing Route
// app.get('/', async (req: Request, res: Response, next: NextFunction) => {
//   throw new Error('Testing Error log')
// })

//  global error handling || next => Error 4 parameter ||
app.use(globalErrorHandler)

// route not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.BAD_REQUEST).json({
    success: false,
    messase: 'Not Found',
    errorMessage: [
      {
        path: req.originalUrl,
        message: 'API NOT FOUND!',
      },
    ],
  })
  next()
})

export default app
