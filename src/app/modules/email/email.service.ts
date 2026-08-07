import { Resend } from 'resend'
import config from '../../../config'
import {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  passwordChangedTemplate,
  orderPlacedTemplate,
  orderDeliveredTemplate,
  paymentSuccessTemplate,
} from './email.templates'
import {
  OrderDeliveredEmailData,
  OrderPlacedEmailData,
  PasswordChangedEmailData,
  PaymentSuccessEmailData,
  ResetPasswordEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from './email.interface'

const createResend = (): Resend | null => {
  if (!config.resend.api_key) return null
  return new Resend(config.resend.api_key)
}

const sendMail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!config.resend.api_key) {
    console.warn('Resend is not configured. Skipping email notification.')
    return
  }
  const resend = createResend()
  if (!resend) return
  const { error } = await resend.emails.send({
    from: config.resend.from,
    to,
    subject,
    html,
  })
  if (error) throw new Error(error.message)
}

// Never break the primary flow (registration, order, payment) on mail failure.
const safeSend = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await sendMail(to, subject, html)
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error)
  }
}

export const emailService = {
  sendWelcomeEmail: (to: string, data: WelcomeEmailData): Promise<void> => {
    const { subject, html } = welcomeTemplate(data)
    return safeSend(to, subject, html)
  },
  sendVerificationEmail: (
    to: string,
    data: VerifyEmailData
  ): Promise<void> => {
    const { subject, html } = verifyEmailTemplate(data)
    return safeSend(to, subject, html)
  },
  sendResetPasswordEmail: (
    to: string,
    data: ResetPasswordEmailData
  ): Promise<void> => {
    const { subject, html } = resetPasswordTemplate(data)
    return safeSend(to, subject, html)
  },
  sendPasswordChangedEmail: (
    to: string,
    data: PasswordChangedEmailData
  ): Promise<void> => {
    const { subject, html } = passwordChangedTemplate(data)
    return safeSend(to, subject, html)
  },
  sendOrderPlacedEmail: (
    to: string,
    data: OrderPlacedEmailData
  ): Promise<void> => {
    const { subject, html } = orderPlacedTemplate(data)
    return safeSend(to, subject, html)
  },
  sendOrderDeliveredEmail: (
    to: string,
    data: OrderDeliveredEmailData
  ): Promise<void> => {
    const { subject, html } = orderDeliveredTemplate(data)
    return safeSend(to, subject, html)
  },
  sendPaymentSuccessEmail: (
    to: string,
    data: PaymentSuccessEmailData
  ): Promise<void> => {
    const { subject, html } = paymentSuccessTemplate(data)
    return safeSend(to, subject, html)
  },
}
