import express, { Application, NextFunction, Request, Response } from 'express'
const app: Application = express()
import cors from 'cors'
import globalErrorHandler from './app/middlewares/globalErrorHandler'
import httpStatus from 'http-status'
//import ApiError from './errors/ApiError'
import { AuthRoute } from './app/modules/auth/auth.route'
import cookieParser from 'cookie-parser'
import { FoodRoute } from './app/modules/food/food.route'

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://food-website-henna.vercel.app',
    'https://full-stack-food-website.vercel.app',
  ],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
// app.use(cors(corsOptions))
app.use(cookieParser())
//parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Applications route

app.use('/api/v1', AuthRoute)
app.use('/api/v1', FoodRoute)
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
