import { Schema, model } from 'mongoose'
import { ICategory, ICategoryModel } from './category.interface'

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, trim: true },
    image: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'category', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Case-insensitive uniqueness for category names
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
)
categorySchema.index({ parent: 1 })

const CategoryModel = model<ICategory, ICategoryModel>(
  'category',
  categorySchema
)

export default CategoryModel
