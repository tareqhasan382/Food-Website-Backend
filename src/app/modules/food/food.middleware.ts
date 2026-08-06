import { NextFunction, Request, Response } from 'express'

const toNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const num = Number(value)
  return Number.isNaN(num) ? undefined : num
}

const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  return value === true || value === 'true' || value === '1'
}

const toArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      // fallthrough to comma-separated parsing
    }
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return undefined
}

/**
 * multer parses multipart fields like `ingredients[0]`, `images[2]` into
 * literal keys on req.body (e.g. `'ingredients[0]': 'x'`). Collect those
 * bracket-indexed fields back into an ordered array.
 */
const collectIndexedFields = (
  body: Record<string, unknown>,
  key: string
): string[] => {
  const prefix = `${key}[`
  const entries = Object.entries(body).filter(
    ([name]) => name.startsWith(prefix) && name.endsWith(']')
  )

  const collected: string[] = []
  let hasMatch = false
  for (const [name, value] of entries) {
    const indexStr = name.slice(prefix.length, -1)
    const index = Number(indexStr)
    if (Number.isInteger(index) && index >= 0 && value !== undefined) {
      collected[index] = String(value)
      hasMatch = true
    }
  }
  return hasMatch
    ? collected.filter(item => item !== undefined)
    : []
}

/**
 * Normalizes a food payload coming from multipart/form-data (strings)
 * or JSON into typed fields, merging any Cloudinary-uploaded files
 * with provided image URLs.
 */
export const normalizeFoodBody = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const body = (req.body || {}) as Record<string, unknown>
  const files = req.files as Express.Multer.File[] | undefined
  const uploadedImages = files?.map(file => file.path).filter(Boolean) ?? []

  const bodyImages = toArray(body.images) ?? collectIndexedFields(body, 'images')
  const images = [...bodyImages, ...uploadedImages]

  const bodyIngredients =
    toArray(body.ingredients) ?? collectIndexedFields(body, 'ingredients')

  const normalized: Record<string, unknown> = { ...body }
  if (images.length) {
    normalized.images = images
  }
  if (bodyIngredients && bodyIngredients.length) {
    normalized.ingredients = bodyIngredients
  }
  if (body.price !== undefined) normalized.price = toNumber(body.price)
  if (body.discountPrice !== undefined)
    normalized.discountPrice = toNumber(body.discountPrice)
  if (body.stock !== undefined) normalized.stock = toNumber(body.stock)
  if (body.preparationTime !== undefined)
    normalized.preparationTime = toNumber(body.preparationTime)
  if (body.calories !== undefined) normalized.calories = toNumber(body.calories)
  if (body.rating !== undefined) normalized.rating = toNumber(body.rating)
  if (body.availability !== undefined)
    normalized.availability = toBoolean(body.availability)

  req.body = normalized
  next()
}
