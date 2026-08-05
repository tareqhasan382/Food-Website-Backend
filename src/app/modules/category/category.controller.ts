import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { CategoryService } from './category.service'
import { ICategory, ICategoryTree, ICreateCategory, IUpdateCategory } from './category.interface'

const normalizePayload = (req: Request): Record<string, unknown> => {
  const body = { ...req.body } as Record<string, unknown>
  if (req.file?.path) {
    body.image = req.file.path
  }
  if (body.parent === '' || body.parent === 'null') {
    body.parent = null
  }
  if (body.isActive !== undefined) {
    body.isActive = body.isActive === true || body.isActive === 'true'
  }
  return body
}

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(
    normalizePayload(req) as ICreateCategory
  )

  sendResponse<ICategory>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully!',
    data: result,
  })
})

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateCategory(
    req.params.id,
    normalizePayload(req) as IUpdateCategory
  )

  sendResponse<ICategory>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully!',
    data: result,
  })
})

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategory(req.params.id)

  sendResponse<ICategory>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully!',
    data: result,
  })
})

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const flat = req.query.flat === 'true'
  const result = await CategoryService.getAllCategories(flat)

  sendResponse<ICategory[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully!',
    data: result,
  })
})

const getCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategory(req.params.id)

  sendResponse<ICategoryTree>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category fetched successfully!',
    data: result,
  })
})

export const CategoryController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
}
