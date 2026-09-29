# Chef SaaS Platform — Backend API

Backend service for **Chef SaaS Platform**, a SaaS product that helps chefs (ចុងភៅ) manage ingredient stock, build recipes/dishes with automatic cost calculation, assemble menu sets, and plan catering events with auto-generated shopping lists, purchase tracking, and vendor reports.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (Access + Refresh Token), bcrypt, Google Identity Services |
| File/Image Storage | Cloudinary |
| Payment Gateway | ABA PayWay (mocked — pending real API credentials) |
| Email (OTP) | Nodemailer (SMTP) |
| PDF Generation | pdfkit |
| Excel Generation | exceljs |
| Validation | Zod |
| Scheduled Jobs | node-cron |
| Security | Helmet, CORS, express-rate-limit |

---

## 📁 Project Structure

```
chef-saas-backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js                          # Unit/Category/Ingredient presets (upsert)
├── src/
│   ├── config/
│   │   ├── env.js
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── onboarding.controller.js
│   │   ├── subscription.controller.js
│   │   ├── payment.controller.js
│   │   ├── billing.controller.js
│   │   ├── unit.controller.js
│   │   ├── category.controller.js
│   │   ├── ingredient.controller.js
│   │   ├── dish.controller.js
│   │   ├── menuSet.controller.js
│   │   ├── event.controller.js
│   │   ├── vendorPreset.controller.js
│   │   ├── report.controller.js
│   │   ├── dashboard.controller.js
│   │   └── procurement.controller.js
│   ├── jobs/
│   │   └── subscription.cron.js         # daily renewal / graceful lockout
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── requireActiveSubscription.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── onboarding.routes.js
│   │   ├── subscription.routes.js
│   │   ├── billing.routes.js
│   │   ├── unit.routes.js
│   │   ├── category.routes.js
│   │   ├── ingredient.routes.js
│   │   ├── dish.routes.js
│   │   ├── menuSet.routes.js
│   │   ├── event.routes.js
│   │   ├── vendorPreset.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   ├── email.service.js
│   │   ├── abaPayway.service.js         # mock — swap in real API later
│   │   ├── subscription.service.js
│   │   ├── costing.service.js           # dish/menu-set cost recalculation
│   │   └── shoppingList.service.js      # aggregation + purchase status
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── googleAuth.js
│   │   ├── jwt.js
│   │   └── otp.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── billing.validator.js
│   │   ├── catalog.validator.js
│   │   ├── dish.validator.js
│   │   ├── menuSet.validator.js
│   │   ├── event.validator.js
│   │   └── procurement.validator.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Fill in at minimum: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, SMTP credentials, `CLOUDINARY_*` keys, and `ABA_PAYWAY_*` keys (once available).

### 3. Generate Prisma Client & run migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start the server
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Health check: `GET http://localhost:5000/api/v1/health`

---

## 🔑 Environment Variables

See `.env.example` for the full list. Key groups:

- **Server:** `NODE_ENV`, `PORT`, `API_BASE_URL`, `FRONTEND_URL`
- **Database:** `DATABASE_URL`
- **JWT:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- **Google Identity Services:** `GOOGLE_CLIENT_ID` (frontend sends `id_token`, backend verifies only)
- **Cloudinary:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Email (OTP):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- **ABA PayWay:** `ABA_PAYWAY_MERCHANT_ID`, `ABA_PAYWAY_API_KEY`, `ABA_PAYWAY_BASE_URL`

---

## 📐 Architecture Conventions

- **Response envelope:** every endpoint returns `{ success, message, data }` via `ApiResponse`.
- **Error handling:** all errors thrown as `ApiError`, caught centrally by `errorHandler` (also maps Prisma error codes `P2002`, `P2025`).
- **Async routes:** every controller wrapped in `asyncHandler` — no manual try/catch needed.
- **Validation:** every request body validated with a Zod schema via `validate()` middleware.
- **Auth:** short-lived JWT access token (Bearer header) + long-lived refresh token (httpOnly cookie + DB row for revocation).
- **Subscription gating:** `requireActiveSubscription` middleware (US-17) available to protect premium routes — blocks access without deleting data when expired.
- **Payment gateway:** `abaPayway.service.js` is currently a **mock** with the correct function signatures (`charge`, `verifyTransaction`) — swap in real ABA PayWay calls once credentials/docs are available; no controller/route changes needed.
- **Scheduled jobs:** `node-cron` runs daily to auto-charge renewals (US-19) and gracefully lock out expired subscriptions (US-17).
- **Per-chef preset state:** Global catalogs (`Unit`, `Category`, `Ingredient`) are shared, but each chef's selection/checkbox state is tracked separately via pivot tables (`ChefUnitPreference`, `ChefCategoryPreference`, `ChefIngredient`) — unchecking never deletes global or historical data (soft delete).
- **Dynamic costing:** `Dish.totalCost` and `MenuSet.totalCost` are cached fields, auto-recalculated via `costing.service.js` whenever an ingredient price, dish recipe, or menu set composition changes.
- **Shopping list aggregation:** `shoppingList.service.js` groups ingredients by name across all dishes/menu sets in an event, sums quantities, and multiplies by table count; purchase checkboxes (Epic 12) are merged in as a separate layer so toggling a checkbox never affects the underlying calculation.
- **Report business rule:** PDF purchasing reports show ingredient name + quantity only (price hidden — business secret); Excel exports show full detail (dish, ingredient, quantity, unit price, total) for accounting.
- **i18n:** handled entirely on the Frontend — backend does not localize responses.

---

## ✅ Progress — All 12 Epics

| Epic | Status | Key Endpoints / Notes |
|---|---|---|
| **Epic 1** — System Foundation | ✅ Done | Project scaffold, error handling, response envelope, security middlewares |
| **Epic 2** — Authentication & Profile | ✅ Done | `/auth/register`, `/auth/google`, `/auth/login`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`, `/auth/profile`, `/auth/logout`, `/auth/refresh-token`, `/auth/me` |
| **Epic 3** — Onboarding & Data Setup | ✅ Done | `/onboarding/complete`; Unit/Category/Ingredient presets via `prisma/seed.js` (upsert) |
| **Epic 4** — Subscription & Plan Management | ✅ Done | `/subscription/plans`, `/subscription/me`, `/subscription/upgrade`, `/subscription/cancel`; auto free trial on register |
| **Epic 5** — Payment Processing | ✅ Done | ABA PayWay (mocked), `/subscription/payments/:id/retry`, auto-charge via cron |
| **Epic 6** — Billing & Transaction History | ✅ Done | `/billing/transactions`, `/billing/transactions/:id`, `/billing/transactions/:id/invoice`, `/billing/info`, `/billing/transactions/:id/refund-request` |
| **Epic 7** — Unit & Category Configuration | ✅ Done | `/units`, `/units/:id/select`, `/units/:id/deselect`, `/categories` (+ select/deselect) |
| **Epic 8** — Ingredient Management | ✅ Done | `/ingredients/presets`, `/ingredients/import`, `/ingredients/my-stock` (+ update/archive/delete) |
| **Epic 9** — Dish & Recipe Management | ✅ Done | `/dishes` (CRUD), `/dishes/:id/duplicate`, `/dishes/:id/archive`; auto cost breakdown & dynamic costing |
| **Epic 10** — Menu Set Management | ✅ Done | `/menu-sets` (CRUD), auto total cost from member dishes |
| **Epic 11** — Event Management, Cost Calc & Dashboard | ✅ Done | `/events` (CRUD, clone, add items), `/events/:id/cost-calculation`, `/vendor-presets`, `/events/:id/reports/pdf` (hide price), `/events/:id/reports/excel` (full detail), `/dashboard` |
| **Epic 12** — Procurement & Purchase Tracking | ✅ Done | `/events/:id/shopping-list` (with progress %), `/events/:id/shopping-list/:ingredientId/toggle-purchased` |

**🎉 All 12 Epics (US-01 to US-60) implemented.**

---

## 📄 API Documentation

Endpoint-by-endpoint documentation (request/response examples) has been written per Epic:
- Epic 2 — Authentication & Profile (`/api/v1/auth/*`)
- Epic 3 — Onboarding & Data Setup (`/api/v1/onboarding/*`)
- Epic 4-6 — Subscription, Payment & Billing (`/api/v1/subscription/*`, `/api/v1/billing/*`)
- Epic 7-8 — Unit/Category/Ingredient (`/api/v1/units/*`, `/api/v1/categories/*`, `/api/v1/ingredients/*`)
- Epic 9-10 — Dish & Menu Set (`/api/v1/dishes/*`, `/api/v1/menu-sets/*`)
- Epic 11 — Event, Vendor Preset, Reports & Dashboard (`/api/v1/events/*`, `/api/v1/vendor-presets/*`, `/api/v1/dashboard`)
- Epic 12 — Procurement (`/api/v1/events/:id/shopping-list*`)

---

## ⚠️ Known Assumptions / Follow-ups

- **ABA PayWay:** currently mocked in `abaPayway.service.js` — replace `charge()` and `verifyTransaction()` with real API calls once merchant credentials and docs are available.
- **Dish/Chef images:** backend accepts a Cloudinary URL string only — the Frontend uploads directly to Cloudinary (unsigned preset) and sends the resulting URL.
- **Cost formula:** `Dish Ingredient Cost = quantityUsed × ChefIngredient.purchasePrice`, assuming `quantityUsed` is recorded in the same unit the chef set when importing the ingredient (Epic 8).
- **Vendor Presets** group global `Ingredient` records (not per-chef stock items), since a vendor grouping should be reusable across events even as prices change.
- **Dashboard metrics** currently include: upcoming events, active dish/menu-set counts, this month's spending, and subscription status — extend `dashboard.controller.js` if the Frontend needs additional metrics.

---

## 🔀 Git Convention

- Commit style: [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat(auth): add google login`, `fix(subscription): correct renewal cron timing`
- Branch per Epic: `feature/epic-2-auth`, `feature/epic-9-dish`, `feature/epic-12-procurement`, etc.
