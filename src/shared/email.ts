import nodemailer, { Transporter } from 'nodemailer'
import config from '../config'

const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })
}

const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  })
}

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `${config.client_url}/verify-email?token=${token}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #333;">Verify your email address</h2>
      <p style="color: #555;">Hi there,</p>
      <p style="color: #555;">Thanks for signing up. Please click the button below to verify your email address. This link will expire in 24 hours.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
      </p>
      <p style="color: #777; font-size: 13px;">Or copy and paste this link into your browser:</p>
      <p style="color: #777; font-size: 13px; word-break: break-all;">${verifyUrl}</p>
      <p style="color: #777; font-size: 13px;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  `
  await sendEmail(to, 'Verify your email address', html)
}

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const resetUrl = `${config.client_url}/reset-password?token=${token}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #333;">Reset your password</h2>
      <p style="color: #555;">Hi there,</p>
      <p style="color: #555;">We received a request to reset your password. Please click the button below to choose a new password. This link will expire in 10 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </p>
      <p style="color: #777; font-size: 13px;">Or copy and paste this link into your browser:</p>
      <p style="color: #777; font-size: 13px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #777; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `
  await sendEmail(to, 'Reset your password', html)
}

export const emailService = {
  sendVerificationEmail,
  sendResetPasswordEmail,
}
