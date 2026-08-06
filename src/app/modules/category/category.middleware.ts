import { NextFunction, Request, Response } from 'express'

/**
 * Normalizes a category payload coming from multipart/form-data (strings)
 * or JSON into typed fields, merging any Cloudinary-uploaded file with a
 * provided image URL. Runs before zod validation so string booleans/null
 * from multipart do not fail the schema.
 */
export const normalizeCategoryBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const body = (req.body || {}) as Record<string, unknown>

  const normalized: Record<string, unknown> = { ...body }
  if (req.file?.path) {
    normalized.image = req.file.path
  }
  if (normalized.parent === '' || normalized.parent === 'null') {
    normalized.parent = null
  }
  if (normalized.isActive !== undefined) {
    normalized.isActive =
      normalized.isActive === true ||
      normalized.isActive === 'true' ||
      normalized.isActive === '1'
  }

  req.body = normalized
  next()
}
