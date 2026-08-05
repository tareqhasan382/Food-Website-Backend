export type WelcomeEmailData = {
  name: string
}

export type VerifyEmailData = {
  name?: string
  verifyUrl: string
}

export type ResetPasswordEmailData = {
  name?: string
  resetUrl: string
}

export type PasswordChangedEmailData = {
  name?: string
}

export type OrderItemEmailData = {
  name: string
  quantity: number
  lineTotal: number
}

export type OrderPlacedEmailData = {
  name?: string
  orderNumber: string
  placedAt?: string | Date
  items: OrderItemEmailData[]
  subtotal: number
  discount: number
  deliveryCharge: number
  couponDiscount: number
  total: number
  currency?: string
}

export type OrderDeliveredEmailData = {
  name?: string
  orderNumber: string
  total: number
  currency?: string
}

export type PaymentSuccessEmailData = {
  name?: string
  amount: number
  currency: string
  transactionId?: string
  paidAt?: string | Date
}

export type EmailTemplateResult = {
  subject: string
  html: string
}
