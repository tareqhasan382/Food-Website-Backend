import { IPaginationOptions } from '../app/modules/food/food.interface'

type IReturned = {
  page: number
  limit: number
  skip: number
}

export const paginationHelper = (
  options: IPaginationOptions | Record<string, unknown>
): IReturned => {
  const page = Number(options?.page) || 1
  const limit = Number(options?.limit) || 10
  const skip = (page - 1) * limit

  return { page, limit, skip }
}
