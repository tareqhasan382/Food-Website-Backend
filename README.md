# Food Ordering REST API

A production-ready Food Ordering backend built with **Node.js, Express.js, TypeScript, MongoDB, and Mongoose**.

Modular architecture with a strict layered split (Route → Controller → Service → Model/Repository), centralized error handling, Zod validation, JWT auth with refresh tokens, and RBAC.

## Features

- **Authentication** — JWT access tokens, refresh-token rotation, email verification, forgot/reset password, change password
- **RBAC** — role (admin / user / superAdmin) + permission-based authorization
- **Food CRUD** — search (text), filters (category, price, availability), pagination
- **Category CRUD**
- **Cart** — add/update/remove/clear items, live coupon validation
- **Wishlist** — add/remove/move-to-cart
- **Stripe Payments** — payment intents, verify, refunds, signed webhooks
- **Coupon System** — percentage/fixed coupons, usage limits, min-order, atomic consume
- **Order Management** — status machine with enforced transitions, cancellation
- **Review & Rating** — per-food reviews, average rating, admin moderation not required
- **Cloudinary Upload** — image upload for foods and categories
- **Email Notifications** — Nodemailer + reusable HTML templates (welcome, verify, reset, password-changed, order placed/delivered, payment success)
- **Invoice** — auto-generated printable invoice per order (JSON + HTML view/download), status synced with order/payment lifecycle
- **Dashboard Analytics** — revenue, sales (daily/monthly), charts, best-selling foods, single-scan `$facet` pipelines

## Tech Stack

| Area          | Choice                                   |
| ------------- | ---------------------------------------- |
| Runtime       | Node.js + TypeScript                     |
| Framework     | Express.js                               |
| Database      | MongoDB (Mongoose ODM)                   |
| Validation    | Zod                                       |
| Auth          | jsonwebtoken, bcrypt                      |
| Payments      | Stripe                                    |
| Uploads       | Cloudinary (multer)                      |
| Emails        | Nodemailer                               |
| Error handling| Centralized `globalErrorHandler` + `ApiError` |

## Architecture

```
src/
├── app/
│   ├── middlewares/        # authenticate, authorize, authorizeRoles, validateRequest, globalErrorHandler
│   └── modules/            # auth, food, category, cart, wishlist, order, payment, coupon, review,
│                           #   invoice, dashboard, email, user, profile
│       └── <module>/
│           ├── <module>.route.ts       # Express routes + middleware wiring
│           ├── <module>.controller.ts  # HTTP layer (req/res)
│           ├── <module>.service.ts     # business logic
│           ├── <module>.repository.ts  # data-access (optional)
│           ├── <module>.model.ts       # Mongoose schema + indexes
│           ├── <module>.interface.ts   # types + constants
│           └── <module>.validation.ts  # Zod schemas
├── config/                 # env config
├── constants/              # roles, permissions
├── errors/                 # ApiError, Zod error formatter
├── helpers/                # jwt, pagination, pick, slugify
├── interface/              # shared generics
├── shared/                 # catchAsync, sendResponse, stripe, cloudinaryUpload, logger
├── app.ts                  # express app
└── server.ts               # entry point
```

Layers communicate one-way: **Route → Controller → Service → Repository/Model**. Services never touch `req`/`res`.

## Getting Started

### 1. Environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, Stripe keys, Resend (`RESEND_API_KEY`), and Cloudinary keys.

### 2. Install & run

```bash
npm install
npm run dev          # ts-node-dev with watch
npm run build        # tsc -> dist/
npm start            # node dist/server.js
```

### 3. Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start dev server with hot reload     |
| `npm run build`    | Compile TypeScript to `dist/`        |
| `npm start`        | Run compiled server                  |
| `npm run lint`     | ESLint (auto-fix)                    |
| `npm run lint:check` | ESLint (report only)               |

## Authentication

```
POST /api/v1/auth/register        { name, email, password }
POST /api/v1/auth/login           { email, password }        -> { accessToken, refreshToken }
POST /api/v1/auth/refresh-token   { refreshToken }            -> { accessToken }
POST /api/v1/auth/logout          (authenticated)
GET  /api/v1/auth/verify-email?token=...
POST /api/v1/auth/forgot-password { email }
POST /api/v1/auth/reset-password?token=...   { password }
POST /api/v1/auth/change-password (authenticated) { oldPassword, newPassword }
GET  /api/v1/auth/me              (authenticated)
```

Send authenticated requests with `Authorization: Bearer <accessToken>`.

**RBAC:** `admin` and `superAdmin` hold `*`. `user` holds `order:*`, `review:*`, `coupon:use`, `profile:*`. Admin-only routes are also guarded by `authorizeRoles`.

## API Reference

Public / User endpoints (all prefixed `/api/v1`):

| Method | Endpoint                         | Access       | Description                          |
| ------ | -------------------------------- | ------------ | ------------------------------------ |
| GET    | `/foods`                         | public       | Search, filter, paginate foods       |
| GET    | `/foods/:id`                     | public       | Food details                         |
| GET    | `/categories`                    | public       | List categories                      |
| GET    | `/categories/:id`                | public       | Category details                     |
| GET    | `/foods/:foodId/reviews`         | public       | Reviews for a food                   |
| GET    | `/cart`                          | user         | Cart with live coupon state          |
| POST   | `/cart/items`                    | user         | Add item                             |
| PATCH  | `/cart/items/:itemId`            | user         | Update quantity                      |
| DELETE | `/cart/items/:itemId`            | user         | Remove item                          |
| DELETE | `/cart`                          | user         | Clear cart                           |
| GET    | `/wishlist`                      | user         | My wishlist                          |
| POST   | `/wishlist/items`                | user         | Add item                             |
| DELETE | `/wishlist/items/:foodId`        | user         | Remove item                          |
| POST   | `/wishlist/items/:foodId/move-to-cart` | user  | Move wishlist item to cart           |
| POST   | `/coupons/validate`              | user         | Validate coupon `{ code, subtotal? }`|
| POST   | `/coupons/apply`                 | user         | Apply coupon to cart                 |
| DELETE | `/coupons/applied`               | user         | Remove applied coupon                |
| POST   | `/payments/create-payment-intent`| user         | Stripe intent for cart total         |
| POST   | `/payments/verify`               | user         | Verify intent, sync status           |
| GET    | `/payments`                      | user         | Payment history                      |
| GET    | `/payments/:id`                  | user         | Payment details                      |
| POST   | `/payments/:id/refund`           | user         | Request refund                       |
| POST   | `/orders`                        | user         | Place order (from cart)              |
| GET    | `/orders`                        | user         | Order history                        |
| GET    | `/orders/:id`                    | user         | Order details                        |
| POST   | `/orders/:id/cancel`             | user         | Cancel order                         |
| GET    | `/orders/:orderId/invoice`       | user         | Get/generate invoice (JSON)          |
| GET    | `/orders/:orderId/invoice/view`  | user         | Printable invoice (HTML)             |
| GET    | `/orders/:orderId/invoice/download` | user     | Download invoice (HTML attachment)   |
| GET    | `/invoices`                      | user         | My invoice history                   |
| GET    | `/invoices/:id`                  | user         | Invoice details                      |
| GET    | `/reviews/mine`                  | user         | My reviews                           |
| POST   | `/reviews`                       | user         | Create review                        |
| PATCH  | `/reviews/:id`                   | user         | Update review                        |
| DELETE | `/reviews/:id`                   | user         | Delete review                        |
| GET    | `/users/me`                      | user         | My profile                           |
| PUT    | `/users/me`                      | user         | Update profile                       |

Admin endpoints (`/api/v1`):

| Method | Endpoint                              | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| POST/PATCH/DELETE | `/foods`, `/foods/:id`  | Food CRUD (with image upload)        |
| POST/PATCH/DELETE | `/categories`, `/categories/:id` | Category CRUD (with image upload) |
| GET    | `/admin/users`, `/admin/users/:id`    | List / view users                    |
| PATCH  | `/admin/users/:id/role`               | Change user role                     |
| DELETE | `/admin/users/:id`                    | Delete user                          |
| GET    | `/admin/orders`                       | All orders                           |
| GET    | `/admin/orders/stats`                 | Order stats + revenue                |
| GET    | `/admin/orders/:id`                   | Order details                        |
| PATCH  | `/admin/orders/:id/status`            | Advance status machine               |
| GET    | `/admin/coupons` (POST/PATCH/DELETE)  | Coupon management                    |
| GET    | `/admin/invoices`                     | All invoices (filter/search)         |
| GET    | `/admin/invoices/:id`                 | Invoice details                      |
| GET    | `/admin/orders/:orderId/invoice`      | Invoice for any order                |
| GET    | `/admin/dashboard/overview`           | KPIs                                 |
| GET    | `/admin/dashboard/sales/daily?days=`  | Daily sales series                   |
| GET    | `/admin/dashboard/sales/monthly?months=` | Monthly sales series             |
| GET    | `/admin/dashboard/charts/revenue?days=`  | Revenue chart                    |
| GET    | `/admin/dashboard/charts/orders?days=`   | Orders chart                     |
| GET    | `/admin/dashboard/charts/users?days=`    | Users chart                      |
| GET    | `/admin/dashboard/best-selling-foods?limit=` | Best sellers                 |

Stripe webhook: `POST /api/v1/payments/webhook` (raw body, signed with `STRIPE_WEBHOOK_SECRET`).

## Order Status Machine

```
pending -> confirmed -> preparing -> out_for_delivery -> delivered
   |          |             |                 |
   +----> cancelled <-------+                 |
                                        (terminal)
```

Illegal transitions are rejected (`400`). Order totals snapshot: `subtotal − discount − couponDiscount + deliveryCharge`.

## Invoice

One invoice is generated per order (`orderId` unique), snapshotting the order at creation and kept in sync via the order/payment lifecycle:

- **status derivation:** `payment succeeded → paid`, `payment refunded → refunded`, `order cancelled → cancelled`, `order delivered (COD) → paid`, else `pending`.
- Invoice number format: `BILL-YYYYMMDD-XXXXXX`.
- HTML invoice is printable/downloadable (`/view`, `/download`) — the same markup used for "Save as PDF".
- Indexed on `invoiceNumber` (unique), `orderId` (unique), `userId`, `status + createdAt`.

## Design Notes

- **Centralized errors** — every thrown `ApiError` (and Zod/unknown errors) is formatted by `globalErrorHandler`; route fallback returns a consistent 404 JSON.
- **Email resilience** — Resend failures are logged and swallowed so order/payment/auth flows never fail because mail is down.
- **Optimized queries** — compound indexes on the hottest paths (`status + createdAt`), `$facet` single-pass dashboards, atomic coupon consumption with `findOneAndUpdate` + `$expr` guard.
- **Security** — bcrypt password hashing, JWT refresh-token rotation, signed webhooks, owner-scoped queries for user data, Zod validation on every body/params/query input.
