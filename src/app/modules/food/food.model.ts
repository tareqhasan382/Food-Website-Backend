import { Schema, model } from 'mongoose'
import { FoodCategories, IFood, IFoodModel } from './food.interface'

const foodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: String, enum: FoodCategories, required: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, min: 0, default: 0 },
    ingredients: [{ type: String, trim: true }],
    preparationTime: { type: Number, min: 0 },
    calories: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
)

foodSchema.index({ name: 'text', description: 'text', category: 'text' })
foodSchema.index({ category: 1 })
foodSchema.index({ price: 1 })

const FoodModel = model<IFood, IFoodModel>('food', foodSchema)
export default FoodModel
