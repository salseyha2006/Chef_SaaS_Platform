# Chef SaaS Platform — Backend API

Backend service for **Chef SaaS Platform**. Covers Epics 1–9 (re-verified against updated User Stories with new scenarios) plus the original Epic 10–12 build. See `PROJECT_CONTEXT.md` for a full architecture reference.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets, SMTP, Cloudinary, ADMIN_SECRET, etc.
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Health check: `GET http://localhost:5000/api/v1/health`

Run the unit-conversion self-test:
```bash
node src/utils/unitConversion.js
```

## What's new in this version (Epic 1–9 re-verification)

- **i18n**: `Chef.language`, stable error `code`/`params` for Frontend translation, bilingual OTP/receipt emails, Khmer PDF font (Kantumruy Pro)
- **Auth**: hashed+crypto-random OTP, resend-OTP endpoint, login lockout bug fix, session invalidation on password reset, email-verification gate on login, backend-validated avatar upload (multer → Cloudinary)
- **Copy-on-Write catalog** (Epic 3/7/8 refactor): `Unit`/`Category`/`Ingredient` are read-only global presets; chefs own `ChefUnit`/`ChefCategory`/`ChefIngredient` copies they can freely edit; `Category`/`ChefCategory` now support a Sub-category hierarchy (`parentId`)
- **Subscription** (Epic 4/5): `trialUsed` flag, recommended-plan flag, resume endpoint, saved payment methods (tokenized), payment-gateway abstraction layer, cron idempotency + bounded auto-retry + graceful lockout, subscription-gating middleware wired onto every mutating route
- **Billing** (Epic 6): paginated/filterable transaction history, invoice guarded to successful transactions, billing-info snapshot on invoices, full refund flow (request → admin stub approve/reject → gateway refund → subscription sync)
- **Dishes** (Epic 9): optional per-ingredient unit override converted via `unitConversion.js`, `pricingType` (`PER_TABLE` / `FIXED`, consumed starting Epic 11), transactional create/update/duplicate, restore endpoint, opt-in optimistic locking, `dishViewMode` synced across devices

## Known stubs / deferred work

- ABA PayWay is **mocked** (`src/services/abaPayway.service.js`) — no real credentials yet; payment confirmation is synchronous, not webhook-based (documented in `subscription.service.js`)
- `/admin/*` refund approval uses a **shared-secret header** (`ADMIN_SECRET`), not real admin accounts — replace before production
- `Dish.pricingType = FIXED` is stored but not yet consumed by the Event shopping-list multiplier (Epic 11 scope)

See `PROJECT_CONTEXT.md` for the full architecture/pattern reference and `API_CONTRACT.md` (provided separately) for the endpoint-by-endpoint contract.
