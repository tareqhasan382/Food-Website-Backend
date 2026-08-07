import dotenv from 'dotenv'
import Path from 'path'
dotenv.config({ path: Path.join(process.cwd(), '.env') })

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bycrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  client_url: process.env.CLIENT_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  resend: {
    api_key: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'food-app/foods',
  },
  delivery: {
    charge: Number(process.env.DELIVERY_CHARGE) || 5,
    free_above: Number(process.env.FREE_DELIVERY_THRESHOLD) || 500,
  },
  rate_limit: {
    window_minutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15,
    api_max: Number(process.env.RATE_LIMIT_API_MAX) || 300,
    auth_max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 20,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY || '',
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
  },
}
