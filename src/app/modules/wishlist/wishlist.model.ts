import { Schema, model } from 'mongoose'
import { IWishlist, IWishlistModel } from './wishlist.interface'

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
      unique: true,
    },
    items: [{ type: Schema.Types.ObjectId, ref: 'food' }],
  },
  { timestamps: true }
)

const WishlistModel = model<IWishlist, IWishlistModel>(
  'wishlist',
  wishlistSchema
)

export default WishlistModel
