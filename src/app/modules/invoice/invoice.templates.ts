import { IInvoice } from './invoice.interface'
import { IDeliveryAddress } from '../order/order.interface'

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: '$',
  bdt: '\u09F3',
  eur: '\u20AC',
  gbp: '\u00A3',
  inr: '\u20B9',
  cad: 'C$',
  aud: 'A$',
}

const money = (amount: number, currency: string): string => {
  const symbol = CURRENCY_SYMBOLS[currency.toLowerCase()] ?? `$`
  return `${symbol}${amount.toFixed(2)}`
}

const formatDate = (value?: string | Date): string =>
  value
    ? new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : ''

const escapeHtml = (value?: string): string =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export type InvoiceViewData = {
  invoice: IInvoice
  order: { deliveryAddress?: IDeliveryAddress }
  user: { name?: string; email: string } | null
}

export const renderInvoiceHtml = ({
  invoice,
  order,
  user,
}: InvoiceViewData): string => {
  const currency = invoice.currency || 'usd'

  const totalRows = [
    { label: 'Subtotal', value: money(invoice.subtotal, currency) },
  ]
  if (invoice.discount > 0) {
    totalRows.push({
      label: 'Item discount',
      value: `-${money(invoice.discount, currency)}`,
    })
  }
  if (invoice.couponDiscount && invoice.couponDiscount > 0) {
    totalRows.push({
      label: `Coupon${invoice.couponCode ? ` (${invoice.couponCode})` : ''}`,
      value: `-${money(invoice.couponDiscount, currency)}`,
    })
  }
  totalRows.push({
    label: 'Delivery charge',
    value: money(invoice.deliveryCharge, currency),
  })
  totalRows.push({ label: 'Total', value: money(invoice.total, currency) })

  const address = order.deliveryAddress
  const addressLines = [
    address?.fullName,
    address?.address,
    address?.city,
    address?.phone,
  ].filter(Boolean)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; margin: 0; padding: 32px; background: #f3f4f6; }
  .sheet { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  header { background: #1f2937; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
  .brand { font-size: 22px; font-weight: 700; }
  .brand span { color: #f59e0b; }
  .status { font-size: 13px; padding: 6px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }
  .status-paid { background: #d1fae5; color: #065f46; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-cancelled { background: #fee2e2; color: #991b1b; }
  .status-refunded { background: #e0e7ff; color: #3730a3; }
  main { padding: 24px 32px 32px; }
  .meta { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 24px; }
  .meta h2 { margin: 0 0 4px; font-size: 18px; }
  .meta p { margin: 2px 0; font-size: 13px; color: #6b7280; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
  th { text-align: left; padding: 10px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
  th.num, td.num { text-align: right; }
  td { padding: 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
  .totals { width: 260px; margin-left: auto; }
  .totals td { padding: 6px 10px; border: none; }
  .totals .grand { font-size: 16px; font-weight: 700; border-top: 2px solid #e5e7eb; }
  footer { padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: none; border-radius: 0; max-width: none; }
  }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      <div class="brand">Food<span>App</span></div>
      <span class="status status-${invoice.status}">${invoice.status}</span>
    </header>
    <main>
      <div class="meta">
        <div>
          <div class="label">Billed to</div>
          <h2>${escapeHtml(user?.name)}</h2>
          <p>${escapeHtml(user?.email)}</p>
          ${
            addressLines.length
              ? addressLines
                  .map(line => `<p>${escapeHtml(line)}</p>`)
                  .join('')
              : '<p>—</p>'
          }
        </div>
        <div>
          <div class="label">Invoice</div>
          <p><strong># ${escapeHtml(invoice.invoiceNumber)}</strong></p>
          <p>Order: ${escapeHtml(invoice.orderNumber)}</p>
          <p>Issued: ${formatDate(invoice.issuedAt)}</p>
          ${
            invoice.paidAt
              ? `<p>Paid: ${formatDate(invoice.paidAt)}</p>`
              : ''
          }
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="num">Unit price</th>
            <th class="num">Qty</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              item => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td class="num">${money(item.price, currency)}</td>
              <td class="num">${item.quantity}</td>
              <td class="num">${money(item.lineTotal, currency)}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>

      <table class="totals">
        ${totalRows
          .map(
            (row, index) => `
          <tr${index === totalRows.length - 1 ? ' class="grand"' : ''}>
            <td>${row.label}</td>
            <td class="num">${row.value}</td>
          </tr>`
          )
          .join('')}
      </table>
    </main>
    <footer>
      Thank you for ordering with Food App. For questions about this invoice, contact support@foodapp.example.
    </footer>
  </div>
</body>
</html>`
}
