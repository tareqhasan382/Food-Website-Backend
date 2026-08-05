import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'
import config from '../../../config'
import { IUser, IUserModel } from './auth.interface'

const authSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'user', 'superAdmin'],
      default: 'user',
    },
    profileImg: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
)

authSchema.index({ role: 1, createdAt: -1 })
authSchema.index({ createdAt: -1 })

authSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bycrypt_salt_rounds)
  )
  next()
})

authSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(givenPassword, hashedPassword)
}

const AuthModel = model<IUser, IUserModel>('auth', authSchema)

export default AuthModel
