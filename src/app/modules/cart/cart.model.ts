import { Schema, model } from 'mongoose'
import { ICart, ICartModel } from './cart.interface'

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
      unique: true,
    },
    items: [
      {
        foodId: { type: Schema.Types.ObjectId, ref: 'food', required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    couponCode: { type: String, uppercase: true, trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

const CartModel = model<ICart, ICartModel>('cart', cartSchema)

export default CartModel
