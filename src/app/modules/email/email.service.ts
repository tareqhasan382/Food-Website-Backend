import nodemailer, { Transporter } from 'nodemailer'
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

let transporter: Transporter | null = null

const createTransporter = (): Transporter | null => { 
  if (!config.smtp.host || !config.smtp.user) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
    })
  }
  return transporter
}

const sendMail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!config.smtp.host || !config.smtp.user) {
    console.warn('SMTP is not configured. Skipping email notification.')
    return
  }
  const smtp = createTransporter()
  if (!smtp) return
  await smtp.sendMail({
    from: config.smtp.from || config.smtp.user,
    to,
    subject,
    html,
  })
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
