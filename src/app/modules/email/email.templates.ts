import {
  EmailTemplateResult,
  OrderDeliveredEmailData,
  OrderPlacedEmailData,
  PasswordChangedEmailData,
  PaymentSuccessEmailData,
  ResetPasswordEmailData,
  VerifyEmailData,
  WelcomeEmailData,
} from './email.interface'

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  bdt: '\u09F3',
  eur: '\u20AC',
  gbp: '\u00A3',
  inr: '\u20B9',
  cad: 'C$',
  aud: 'A$',
}

const escapeHtml = (value?: string): string =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const money = (amount: number, currency?: string): string => {
  const symbol = currency
    ? CURRENCY_SYMBOLS[currency.toLowerCase()] ??
      `${currency.toUpperCase()} `
    : '$'
  return `${symbol}${amount.toFixed(2)}`
}

const formatDateTime = (value?: string | Date): string =>
  value
    ? new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

const layout = (body: string): string => `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:540px;margin:24px auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #eee;">
        <div style="background:#1f2937;padding:20px 28px;">
          <span style="color:#f59e0b;font-size:22px;font-weight:bold;">Food<span style="color:#ffffff;">App</span></span>
        </div>
        <div style="padding:28px;color:#374151;line-height:1.6;font-size:14px;">
          ${body}
        </div>
        <div style="background:#faf9f6;padding:16px 28px;color:#9ca3af;font-size:12px;text-align:center;">
          Food App &middot; Delicious food, delivered fresh.
        </div>
      </div>
    </body>
  </html>
`

const actionButton = (url: string, label: string): string => `
  <p style="margin:28px 0;text-align:center;">
    <a href="${url}" style="background:#f59e0b;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-size:14px;font-weight:bold;">${label}</a>
  </p>
`

const heading = (title: string): string =>
  `<h2 style="margin-top:0;color:#111827;">${title}</h2>`

const greeting = (name?: string): string =>
  `<p style="margin:0;">Hi${name ? ' ' + escapeHtml(name) : ''},</p>`

const orderItemsTable = (
  items: OrderPlacedEmailData['items']
): string => `
  <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px;color:#374151;">
    <tr>
      <th style="text-align:left;padding:8px 10px;background:#f9fafb;">Item</th>
      <th style="text-align:center;padding:8px;background:#f9fafb;">Qty</th>
      <th style="text-align:right;padding:8px 10px;background:#f9fafb;">Amount</th>
    </tr>
    ${items
      .map(
        item => `
      <tr>
        <td style="padding:8px 10px;border-top:1px solid #eee;">${escapeHtml(item.name)}</td>
        <td style="text-align:center;padding:8px;border-top:1px solid #eee;">${item.quantity}</td>
        <td style="text-align:right;padding:8px 10px;border-top:1px solid #eee;">${money(item.lineTotal)}</td>
      </tr>`
      )
      .join('')}
  </table>
`

const summaryRow = (label: string, value: string, bold = false): string => `
  <tr>
    <td style="padding:4px 10px;color:#6b7280;${bold ? 'font-weight:bold;' : ''}">${label}</td>
    <td style="padding:4px 10px;text-align:right;${bold ? 'font-weight:bold;' : ''}">${value}</td>
  </tr>
`

const summaryTable = (
  rows: { label: string; value: string; bold?: boolean }[]
): string => `
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;">
    ${rows.map(row => summaryRow(row.label, row.value, row.bold)).join('')}
  </table>
`

export const welcomeTemplate = (
  data: WelcomeEmailData
): EmailTemplateResult => ({
  subject: 'Welcome to Food App!',
  html: layout(`
    ${heading('Welcome!')}
    ${greeting(data.name)}
    <p>Thanks for joining Food App. Your account is ready and you can start exploring our menu, applying coupons and getting delicious food delivered to your door.</p>
    <p>To get started, verify your email address using the link we just sent you, then place your first order.</p>
    <p>We are excited to have you on board.</p>
  `),
})

export const verifyEmailTemplate = (
  data: VerifyEmailData
): EmailTemplateResult => ({
  subject: 'Verify your email address',
  html: layout(`
    ${heading('Verify your email address')}
    ${greeting(data.name)}
    <p>Thanks for signing up. Please confirm your email address to activate your account. This link will expire in 24 hours.</p>
    ${actionButton(data.verifyUrl, 'Verify Email')}
    <p style="color:#6b7280;font-size:13px;">Or copy and paste this link into your browser:</p>
    <p style="color:#6b7280;font-size:13px;word-break:break-all;">${data.verifyUrl}</p>
    <p>If you did not create an account, you can safely ignore this email.</p>
  `),
})

export const resetPasswordTemplate = (
  data: ResetPasswordEmailData
): EmailTemplateResult => ({
  subject: 'Reset your password',
  html: layout(`
    ${heading('Reset your password')}
    ${greeting(data.name)}
    <p>We received a request to reset your password. Please click the button below to choose a new password. This link will expire in 10 minutes.</p>
    ${actionButton(data.resetUrl, 'Reset Password')}
    <p style="color:#6b7280;font-size:13px;">Or copy and paste this link into your browser:</p>
    <p style="color:#6b7280;font-size:13px;word-break:break-all;">${data.resetUrl}</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `),
})

export const passwordChangedTemplate = (
  data: PasswordChangedEmailData
): EmailTemplateResult => ({
  subject: 'Your password has been changed',
  html: layout(`
    ${heading('Password changed')}
    ${greeting(data.name)}
    <p>Your Food App password was successfully changed.</p>
    <p>If you did not make this change, please reset your password immediately and contact support.</p>
  `),
})

export const orderPlacedTemplate = (
  data: OrderPlacedEmailData
): EmailTemplateResult => {
  const rows: { label: string; value: string; bold?: boolean }[] = [
    { label: 'Subtotal', value: money(data.subtotal, data.currency) },
  ]
  if (data.discount > 0) {
    rows.push({
      label: 'Discount',
      value: `-${money(data.discount, data.currency)}`,
    })
  }
  if (data.couponDiscount > 0) {
    rows.push({
      label: 'Coupon discount',
      value: `-${money(data.couponDiscount, data.currency)}`,
    })
  }
  rows.push({
    label: 'Delivery',
    value: money(data.deliveryCharge, data.currency),
  })
  rows.push({
    label: 'Total',
    value: money(data.total, data.currency),
    bold: true,
  })

  return {
    subject: `Order ${data.orderNumber} placed successfully`,
    html: layout(`
      ${heading('Order confirmed!')}
      ${greeting(data.name)}
      <p>Thank you for your order. We have received it and our team is preparing your food.</p>
      <p>
        <strong>Order number:</strong> ${escapeHtml(data.orderNumber)}<br/>
        <strong>Placed on:</strong> ${formatDateTime(data.placedAt)}
      </p>
      ${orderItemsTable(data.items)}
      ${summaryTable(rows)}
      <p>We will email you again once your order is out for delivery.</p>
    `),
  }
}

export const orderDeliveredTemplate = (
  data: OrderDeliveredEmailData
): EmailTemplateResult => ({
  subject: `Order ${data.orderNumber} has been delivered`,
  html: layout(`
    ${heading('Your order has arrived!')}
    ${greeting(data.name)}
    <p>Great news — your order <strong>${escapeHtml(data.orderNumber)}</strong> has been delivered. Enjoy your meal!</p>
    <p><strong>Total paid:</strong> ${money(data.total, data.currency)}</p>
    <p>We would love to hear what you think. Leave a review for the items you ordered so other foodies can find their favorites too.</p>
  `),
})

export const paymentSuccessTemplate = (
  data: PaymentSuccessEmailData
): EmailTemplateResult => ({
  subject: 'Payment successful',
  html: layout(`
    ${heading('Payment received')}
    ${greeting(data.name)}
    <p>Your payment of <strong>${money(
      data.amount / 100,
      data.currency
    )}</strong> was successful.</p>
    <p>
      <strong>Transaction ID:</strong> ${escapeHtml(data.transactionId ?? 'N/A')}<br/>
      <strong>Paid on:</strong> ${formatDateTime(data.paidAt)}
    </p>
    <p>Thank you for your purchase. Your order is being prepared.</p>
  `),
})
