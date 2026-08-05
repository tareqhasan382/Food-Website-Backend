import httpStatus from 'http-status'
import ApiError from '../../../errors/ApiError'
import { slugify } from '../../../helpers/slugify'
import { deleteImagesFromCloudinary } from '../../../shared/cloudinaryUpload'
import CategoryModel from './category.model'
import {
  ICategory,
  ICategoryTree,
  ICreateCategory,
  IUpdateCategory,
} from './category.interface'

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const generateUniqueSlug = async (
  name: string,
  excludeId?: string
): Promise<string> => {
  const baseSlug = slugify(name) || 'category'
  let slug = baseSlug
  let counter = 1
  while (await CategoryModel.exists({ slug, _id: { $ne: excludeId } })) {
    slug = `${baseSlug}-${counter}`
    counter += 1
  }
  return slug
}

const isNameTaken = async (
  name: string,
  excludeId?: string
): Promise<boolean> => {
  const existing = await CategoryModel.findOne({
    name: { $regex: `^${escapeRegExp(name)}$`, $options: 'i' },
    _id: { $ne: excludeId },
  })
  return Boolean(existing)
}

const validateParent = async (
  parent: string | null | undefined,
  excludeId?: string
): Promise<void> => {
  if (!parent) return
  if (excludeId && parent === excludeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category cannot be its own parent')
  }
  const parentCategory = await CategoryModel.findById(parent)
  if (!parentCategory) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parent category does not exist')
  }
  if (excludeId) {
    const descendants = await getAllDescendantIds(excludeId)
    if (descendants.includes(parent)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot set a descendant category as parent (would create a cycle)'
      )
    }
  }
}

const getAllDescendantIds = async (id: string): Promise<string[]> => {
  const descendants: string[] = []
  const queue: string[] = [id]
  while (queue.length) {
    const current = queue.shift() as string
    const children = await CategoryModel.find({ parent: current }, { _id: 1 })
    for (const child of children) {
      descendants.push(String(child._id))
      queue.push(String(child._id))
    }
  }
  return descendants
}

const buildSubTree = (
  categories: ICategory[],
  parentId: string | null
): ICategoryTree[] => {
  return categories
    .filter(category => String(category.parent || '') === String(parentId || ''))
    .map(category => ({
      ...category,
      children: buildSubTree(categories, category._id),
    }))
}

const createCategory = async (payload: ICreateCategory): Promise<ICategory> => {
  if (await isNameTaken(payload.name)) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Category with this name already exists'
    )
  }

  await validateParent(payload.parent)

  const category = await CategoryModel.create({
    ...payload,
    slug: await generateUniqueSlug(payload.name),
  })

  return category.toObject()
}

const updateCategory = async (
  id: string,
  payload: IUpdateCategory
): Promise<ICategory> => {
  const existingCategory = await CategoryModel.findById(id)
  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist')
  }

  if (payload.name && payload.name !== existingCategory.name) {
    if (await isNameTaken(payload.name, id)) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Category with this name already exists'
      )
    }
  }

  if (payload.parent !== undefined) {
    await validateParent(payload.parent, id)
  }

  const updateData: Record<string, unknown> = { ...payload }
  if (payload.name && payload.name !== existingCategory.name) {
    updateData.slug = await generateUniqueSlug(payload.name, id)
  }
  if (payload.image && payload.image !== existingCategory.image) {
    if (existingCategory.image) {
      await deleteImagesFromCloudinary([existingCategory.image])
    }
  }

  const category = await CategoryModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist')
  }
  return category.toObject()
}

const deleteCategory = async (id: string): Promise<ICategory> => {
  const category = await CategoryModel.findById(id)
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist')
  }

  const childCount = await CategoryModel.countDocuments({ parent: id })
  if (childCount) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Cannot delete a category that has child categories'
    )
  }

  if (category.image) {
    await deleteImagesFromCloudinary([category.image])
  }

  await CategoryModel.findByIdAndDelete(id)
  return category.toObject()
}

const getAllCategories = async (flat = false): Promise<ICategory[]> => {
  const categories = await CategoryModel.find({}).sort({ name: 1 })
  const plain = categories.map(category => category.toObject())

  if (flat) return plain
  return buildSubTree(plain, null)
}

const getCategory = async (id: string): Promise<ICategoryTree> => {
  const category = await CategoryModel.findById(id)
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category does not exist')
  }

  const categories = await CategoryModel.find({})
  const plain = categories.map(item => item.toObject())
  const children = buildSubTree(plain, category._id)

  return { ...category.toObject(), children }
}

export const CategoryService = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
}
