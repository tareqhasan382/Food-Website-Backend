import { Schema, model } from 'mongoose'
import { IFood, IFoodModel } from './food.interface'

const foodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    Image: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
)

const FoodModel = model<IFood, IFoodModel>('food', foodSchema)
export default FoodModel

// name: string
// image: string
// category: string
// price: 
