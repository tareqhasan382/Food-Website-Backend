import { ErrorRequestHandler } from 'express'
import config from '../../config'
import mongoose from 'mongoose'
import ApiError from '../../errors/ApiError'
// import { errorlogger } from '../../shared/logger'
import { ZodError } from 'zod'
import { handleZodError } from '../../errors/handleZodError'

//=================IGenericErrorMessage==============
export type IGenericErrorMessage = {
  path: string | number
  message: string
}

//=======handleValidationError======================
export type IGenericErrorResponse = {
  statusCode: number
  message: string
  errorMessages: IGenericErrorMessage[]
}

export const handleValidationError = (
  error: mongoose.Error.ValidationError
): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = Object.values(error.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el?.path,
        message: el?.message,
      }
    }
  )
  const statusCode = 400
  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  }
}

//====================globalErrorHandler=============
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  config.env === 'development'
    ? console.log('global Error handler', error)
    : console.log('global Error handler', error)

  let statusCode = 500
  let message = 'Something went to wrong!'
  let errorMessages: IGenericErrorMessage[] = []

  if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessages = simplifiedError.errorMessages
  } else if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessages = simplifiedError.errorMessages
  } else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessages = simplifiedError.errorMessages
  } else if (error?.code === 11000) {
    const simplifiedError = handleDuplicateError(error)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorMessages = simplifiedError.errorMessages
  } else if (error?.name === 'MulterError') {
    statusCode = 400
    message = error?.message
    errorMessages = [
      {
        path: '',
        message: error?.message,
      },
    ]
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode
    message = error?.message
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : []
  } else if (error instanceof Error) {
    message = error?.message
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : []
  }

  if (res.headersSent) {
    return next(error)
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env !== 'production' ? error?.stack : undefined,
  })
}

//=======handleCastError======================
export const handleCastError = (
  error: mongoose.Error.CastError
): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = [
    {
      path: error.path,
      message: `Invalid ${error.path}: ${error.value}`,
    },
  ]
  const statusCode = 400
  return {
    statusCode,
    message: 'Cast Error',
    errorMessages: errors,
  }
}

//=======handleDuplicateError======================
export const handleDuplicateError = (
  error: mongoose.mongo.MongoServerError
): IGenericErrorResponse => {
  const value = error?.keyValue ? Object.values(error.keyValue)[0] : 'value'
  const errors: IGenericErrorMessage[] = [
    {
      path: '',
      message: `Duplicate field value: ${value}. Please use another value!`,
    },
  ]
  const statusCode = 400
  return {
    statusCode,
    message: 'Duplicate field value entered',
    errorMessages: errors,
  }
}

export default globalErrorHandler
