# PROJECT_CONTEXT.md — Chef SaaS Platform (Backend)


## 1. ទិដ្ឋភាពទូទៅ
- ឈ្មោះ package: `chef-saas-backend` v1.0.0 — "Chef SaaS Platform - Backend API"
- ដំណើរការ: ចុងភៅ (`Chef`) គ្រប់គ្រងគ្រឿងផ្សំ (stock), មុខម្ហូប (`Dish`) + ថ្លៃដើមស្វ័យប្រវត្តិ, `MenuSet`, `Event` (តាមចំនួនតុ), Shopping List, Vendor Preset, របាយការណ៍ PDF/Excel, និងការជាវ (Subscription) ជាមួយ Trial 14 ថ្ងៃ
- API prefix: `/api/v1`
- Module system: CommonJS (`require`) — គ្មាន TypeScript

## API Design Decisions (LOCKED ចាក់សោតាម Code ពិត កុំប្តូរ)
- Success: { success: true, message, data }  (ApiResponse)
- Error: { success: false, message (EN fallback), code, params?, errors? }  (ApiError)
- Frontend បកប្រែតាម `code` + `params`។ Backend មិនអាន Accept-Language ទេ
- Error code: UPPER_SNAKE_CASE ទម្រង់ <DOMAIN>_<REASON> (ឧ. AUTH_OTP_INVALID)
- Validation: Zod ក្នុង validators/, ប្រើ validate(schema) ជាមួយ req.body
- Language: Chef.language, តម្លៃ "km" | "en", default "km"
- Module: CommonJS ។ Controller = asyncHandler + ApiResponse
- Multi-tenancy: រាល់ query ត្រូវមាន chefId, ownership fail = 404 <ENTITY>_NOT_FOUND
- Naming: ឯកសារ <name>.controller.js / .routes.js / .service.js / .validator.js,
  URL kebab-case plural, JSON camelCase

## ច្បាប់សម្រាប់ AI (ត្រូវធ្វើតាមទាំងអស់)
1. User Story ថ្មី = Source of truth។ Code ចាស់អាចខុស។
2. កុំសន្មត់ឯកសារ ឬ Code ដែលមិនបានឃើញ។ បើខ្វះ ត្រូវរាយឈ្មោះឯកសារហើយសួរ។
3. ធ្វើតែ Scope ដែលបានប្រាប់ (១ Epic ឬ ១ Story ក្នុងពេលតែមួយ)។
4. កុំប្តូរ Response/Error format, Error code ដែលមានស្រាប់, Naming ដែលបានចាក់សោ។
5. កុំដំឡើង Library ថ្មី លើកលែងតែសួរខ្ញុំមុន។
6. កុំសរសេរឯកសារឡើងវិញទាំងមូល ផ្តល់តែផ្នែកដែលកែ ជាមួយឈ្មោះឯកសារ និង Function។
7. បើមិនច្បាស់ ត្រូវសួរ កុំទាយ។
8. Migration: ផ្តល់ជំហាន ខ្ញុំរត់ខ្លួនឯង។
9. ចុងបញ្ចប់ត្រូវ Update PROGRESS.md និង API_CONTRACT.md។

## 2. Tech Stack (ពី package.json + Code)
| ផ្នែក | បច្ចេកវិទ្យា | កំណត់ចំណាំ |
|---|---|---|
| Runtime | Node.js | គ្មាន `engines` field ក្នុង package.json |
| Framework | Express `^4.21.0` | |
| Database | PostgreSQL | `datasource db { provider = "postgresql" }` |
| ORM | Prisma `^5.20.0` (`@prisma/client`) | |
| Auth | `jsonwebtoken ^9.0.2`, `bcrypt ^5.1.1` (cost 10), `google-auth-library ^9.14.1` | Google Identity: Frontend ផ្ញើ `idToken`, Backend verify ប៉ុណ្ណោះ |
| Validation | `zod ^3.23.8` | |
| Security | `helmet ^7.1.0`, `cors`, `express-rate-limit ^7.4.0`, `cookie-parser` | |
| Logging | `morgan` | ដំណើរការតែ `NODE_ENV === 'development'` |
| Upload | `multer ^1.4.5-lts.1` (memoryStorage) + `cloudinary ^2.5.0` | ប្រើសម្រាប់ avatar |
| Email | `nodemailer ^6.9.15` (SMTP) | OTP + Receipt + Payment-failed notification, ភាសា km/en |
| PDF | `pdfkit ^0.15.0` + `@fontsource/kantumruy-pro` | Font Khmer |
| Excel | `exceljs ^4.4.0` | |
| Scheduler | `node-cron ^3.0.3` | |
| Payment | ABA PayWay | **Mock** (`Math.random() > 0.1` ជោគជ័យ) |
| Dev | `nodemon`, `prisma` CLI | |

Scripts: `dev` (nodemon src/server.js), `start`, `prisma:generate`, `prisma:migrate` (migrate dev), `prisma:studio`, `prisma:seed` + `"prisma": { "seed": "node prisma/seed.js" }`

## 3. រចនាសម្ព័ន្ធ Folder
```
backend/
├── .env.example  .gitignore  package.json  README.md
├── prisma/
│   ├── schema.prisma
│   └── seed.js                      # upsert Unit / Category / Ingredient presets (មិន seed Plan)
└── src/
    ├── server.js                    # validateEnv → prisma.$connect → cron → listen → graceful shutdown
    ├── app.js                       # middleware chain + mount /api/v1
    ├── config/        cloudinary.js  db.js (PrismaClient singleton)  env.js
    ├── controllers/   auth, billing, category, dashboard, dish, event, ingredient, menuSet,
    │                  onboarding, payment, paymentMethod, procurement, report,
    │                  subscription, unit, vendorPreset   (*.controller.js — 16 files)
    ├── jobs/          subscription.cron.js
    ├── middlewares/   auth.middleware.js, errorHandler.js, notFound.js, rateLimiters.js,
    │                  requireActiveSubscription.js, upload.js, validate.js
    ├── routes/        index.js + auth, billing, category, dashboard, dish, event, ingredient,
    │                  menuSet, onboarding, paymentMethod, subscription, unit, vendorPreset (*.routes.js)
    ├── services/      abaPayway, costing, email, payment, pdf, shoppingList, subscription, upload (*.service.js)
    ├── utils/         ApiError, ApiResponse, asyncHandler, googleAuth, jwt, otp, otpHash
    └── validators/    auth, billing, catalog, dish, event, menuSet, procurement (*.validator.js)
```
Controller ដែលគ្មាន route file ផ្ទាល់ខ្លួន: `payment` (mount ក្នុង `subscription.routes.js`), `report` និង `procurement` (mount ក្នុង `event.routes.js`)។ `paymentMethod.routes.js` ត្រូវបាន mount ក្រោម `/billing/payment-methods` ដោយ `billing.routes.js`។

## 4. Bootstrap & Middleware Order
`server.js`: `validateEnv()` → `require('./app')` → `prisma.$connect()` → `startSubscriptionCron()` → `app.listen(env.port)`; SIGTERM/SIGINT → `server.close` → `prisma.$disconnect`។

`app.js` (តាមលំដាប់): `helmet()` → `cors({ origin: env.frontendUrl, credentials: true })` → `express.json({ limit: '10mb' })` → `express.urlencoded({ extended: true })` → `cookieParser()` → `morgan('dev')` (dev តែប៉ុណ្ណោះ) → `globalLimiter` (300 req / 15 នាទី) → `/api/v1` routes → `notFound` → `errorHandler`។

## 5. Environment Variables
- `validateEnv()` តម្រូវតែ 3: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `config/env.js` បង្ហាញ: `NODE_ENV`, `PORT`(5000), `API_BASE_URL`, `FRONTEND_URL`(http://localhost:5173), `JWT_ACCESS_EXPIRES_IN`(15m), `JWT_REFRESH_EXPIRES_IN`(7d), `CLOUDINARY_*`
- អានផ្ទាល់ពី `process.env` (មិនកាត់ `env.js`): `GOOGLE_CLIENT_ID` (utils/googleAuth.js), `SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM` (services/email.service.js), `NODE_ENV` (errorHandler, auth.controller)
- មានក្នុង `.env.example` ប៉ុន្តែគ្មាន file ណាអាន: `ABA_PAYWAY_MERCHANT_ID`, `ABA_PAYWAY_API_KEY`, `ABA_PAYWAY_BASE_URL`

## 6. Patterns ដែលប្រើជាក់ស្តែង

### 6.1 Request pipeline (ក្នុង routes)
មិនប្រើ `router.use(requireAuth)` — រាល់ route សរសេរ middleware ផ្ទាល់ខ្លួន។ លំដាប់ធម្មតា:
```
[rateLimiter] → requireAuth → [requireActiveSubscription] → [validate(zodSchema)] → controller
```
- Route សរសេរ (POST/PATCH/DELETE) នៃ catalog/dish/menu-set/event/vendor-preset ប្រើ `requireActiveSubscription`
- Route អាន (GET), Export (PDF/Excel), `/auth/*`, `/billing/*`, `/subscription/*`, `/onboarding/*` មិនត្រូវបាន gate (comment ក្នុង event.routes.js: "Exports stay available even when expired")

### 6.2 Controller / Service
- Controller = arrow function ហ៊ុមដោយ `asyncHandler`, ទាញ `chefId = req.chef.id`, ហៅ `prisma` ផ្ទាល់ពី `config/db`, បញ្ចប់ដោយ `new ApiResponse(status, data, message).send(res)`
- Service ប្រើសម្រាប់ logic ដែលចែករំលែក/ខាងក្រៅ:
  - `costing.service` — recalc `Dish.totalCost` / `MenuSet.totalCost` (cache field)
  - `shoppingList.service` — aggregate គ្រឿងផ្សំតាម `chefIngredientId` × `tableCount`, បូក purchase status
  - `subscription.service` — `startTrialForChef` (14 ថ្ងៃ, guard `trialUsed`), `chargeSubscription` (គាំទ្រ `savedPaymentMethodId` + idempotency key), `getSubscriptionEndDate`
  - `payment.service` — gateway abstraction (`PROVIDERS = { ABA_PAYWAY }`), `abaPayway.service` = mock
  - `email.service`, `pdf.service`, `upload.service` (Cloudinary, `chef-saas/avatars`)
- Service ដែល throw `ApiError` ផ្ទាល់: `subscription.service`, `payment.service`

### 6.3 Response format (ជោគជ័យ)
```json
{ "success": true, "message": "…", "data": <object | array | null> }
```
បង្កើតដោយ `ApiResponse` (`statusCode` មិនត្រូវបានដាក់ក្នុង body)។ Endpoint ទាញយកឯកសារ (invoice PDF, report PDF/Excel) ឆ្លើយជា binary មិនមាន envelope។

### 6.4 Error format
```json
{ "success": false, "message": "English fallback", "code": "UPPER_SNAKE_CODE",
  "params": { }, "errors": [ ] }
```
- `params`, `errors` លេចតែពេលមាន (`errors` លេចតែពេលមិនទទេ)
- `message` ជាអង់គ្លេស; Frontend ត្រូវបកប្រែតាម `code` (comment ក្នុង ApiError.js)
- Factory: `ApiError.badRequest/unauthorized/forbidden/notFound/conflict/internal(message, [errors], { code, params })`
- Default code តាម status: 400 BAD_REQUEST, 401 UNAUTHORIZED, 403 FORBIDDEN, 404 NOT_FOUND, 409 CONFLICT, 500 INTERNAL_ERROR, ផ្សេងទៀត `ERROR`
- `errorHandler` map: Prisma `P2002`→409 `DUPLICATE_VALUE`, `P2003`→400 `INVALID_REFERENCE`, `P2025`→404 `RECORD_NOT_FOUND`, `entity.parse.failed`→400 `INVALID_JSON`, `entity.too.large`→413 `PAYLOAD_TOO_LARGE`; status ≥500 → `console.error`, ហើយក្នុង production ជំនួសដោយ `Internal server error`
- Validation error (`VALIDATION_FAILED`, 400): `errors[] = { field, message, code, params? }` — `code` map ពី Zod issue (`VALIDATION_REQUIRED`, `_INVALID_TYPE`, `_INVALID_EMAIL`, `_INVALID_ID` (uuid), `_INVALID_URL`, `_INVALID_DATETIME`, `_INVALID_FORMAT`, `_TOO_SHORT/_TOO_LONG`, `_LENGTH_EXACT`, `_ARRAY_MIN/_MAX`, `_TOO_SMALL/_TOO_BIG`, `_INVALID_OPTION`, `_INVALID`)
- `validate(schema)` ពិនិត្យ **`req.body` តែមួយ**, ជោគជ័យ → `req.body = result.data` (Zod strip key ដែលមិនស្គាល់)

### 6.5 Auth middleware & Token
- `requireAuth` (`middlewares/auth.middleware.js`): អាន `Authorization: Bearer <token>` → `verifyAccessToken` → `req.chef = { id, email }`
  - Code: `AUTH_ACCESS_TOKEN_MISSING` / `AUTH_ACCESS_TOKEN_EXPIRED` / `AUTH_ACCESS_TOKEN_INVALID` (401)
- Access token payload `{ id, email }`, អាយុ `JWT_ACCESS_EXPIRES_IN`
- Refresh token payload `{ id }`; រក្សាក្នុងតារាង `refresh_tokens` + cookie `refreshToken` (`httpOnly`, `secure` ក្នុង production, `sameSite: 'strict'`, maxAge 7 ថ្ងៃ)
- `/auth/refresh-token` ពិនិត្យ JWT + DB row + `expiresAt`, ចេញតែ access token ថ្មី (មិន rotate refresh)
- `/auth/logout` លុប row តាម token + `clearCookie`; `reset-password` លុប refresh token ទាំងអស់របស់ chef
- Email verification / Reset: OTP 6 ខ្ទង់ (`crypto.randomInt`), រក្សាជា SHA-256 hash, ផុតកំណត់ 10 នាទី, ផ្ញើ email បែប fire-and-forget
- Resend OTP: អតិបរមា 3 ដង / 10 នាទី / account
- Login lock: ខុស 5 ដង → ចាក់សោ 15 នាទី; login ត្រូវ `isEmailVerified`
- Google: `verifyIdToken` → រក `googleId` ឬ `email`; chef ថ្មី → `authProvider: 'GOOGLE'`, `isEmailVerified: true`, ចាប់ផ្តើម trial
- `requireActiveSubscription`: អាន `subscription` តាម `chefId`; អនុញ្ញាតតែ `status ∈ {TRIALING, ACTIVE}` និង `endDate > now`; បើមិនដូច្នេះ 403 `SUBSCRIPTION_NOT_FOUND` / `SUBSCRIPTION_EXPIRED`

### 6.6 Rate limiting
`buildLimiter({windowMs, max, code})` → 429 ApiError + `params.minutes`: global 300/15នាទី (`RATE_LIMITED`), register 5/ម៉ោង (`AUTH_REGISTER_RATE_LIMITED`), login 10/15នាទី (`AUTH_LOGIN_RATE_LIMITED`), resend-otp 10/15នាទី (`AUTH_RESEND_RATE_LIMITED`)

### 6.7 Multi-tenancy / Ownership
រាល់ទិន្នន័យអ្នកប្រើមាន `chefId`។ Pattern ដដែលៗ: `findUnique({ where: { id } })` → `if (!row || row.chefId !== chefId) throw ApiError.notFound(..., { code: '<ENTITY>_NOT_FOUND' })` (404 មិនបង្ហាញថា record មានរបស់អ្នកដទៃ)។ សម្រាប់ list: `where: { chefId, ... }`។

### 6.8 Copy-on-Write Presets & Soft delete
- Global catalog (`Unit`, `Category`, `Ingredient`) អានតែប៉ុណ្ណោះ (seed) → chef "import" ចម្លងទៅ `ChefUnit` / `ChefCategory` / `ChefIngredient` (`source: PRESET|CUSTOM`, `sourcePresetId`)
- Unit/Category/ChefIngredient: soft delete ដោយ `isActive=false` (`/archive`); Dish/MenuSet: `isArchived=true`
- Hard delete ត្រូវបានការពារ: ingredient (ប្រើក្នុង `DishIngredient` → 409 `INGREDIENT_IN_USE`), dish (ប្រើក្នុង `MenuSetDish` → 409 `DISH_IN_USE`)

### 6.9 Costing
`Dish.totalCost = Σ(quantityUsed × ChefIngredient.purchasePrice)`; `MenuSet.totalCost = Σ dish.totalCost`; recalc ពេលបង្កើត/កែ Dish, កែ `purchasePrice`, កែ MenuSet។ Shopping list: `totalQuantity = quantityPerTable × event.tableCount`, `totalPrice` ចុះ 2 ខ្ទង់។ (`conversionRate` នៃ Unit ត្រូវបានរក្សា ប៉ុន្តែមិនត្រូវបានប្រើក្នុងការគណនា។)

### 6.10 ឯកសារ (PDF / Excel / Avatar)
- PDF purchasing list (`POST /events/:eventId/reports/pdf`): ឈ្មោះ + បរិមាណតែប៉ុណ្ណោះ (មិនបង្ហាញតម្លៃ), អាចផ្ញើ `items` override; ភាសាតាម `chef.language`
- Excel (`GET …/reports/excel`): 2 sheets — `Dish Detail`, `Shopping List Summary` (មានតម្លៃពេញ)
- Invoice PDF + Receipt email (PDF attach) ភាសា km/en, generate on-demand ពី `Transaction` (មិនរក្សា File អចិន្ត្រៃយ៍)
- Avatar: multer memory, ≤5MB, `jpeg|png|webp`, field `avatar`, Cloudinary 512×512 fill/face

### 6.11 Cron (`jobs/subscription.cron.js`)
រត់រាល់ថ្ងៃ `10 0 * * *` (`processExpiredSubscriptions`): រក `Subscription` ដែល `endDate <= now` និង `status ∈ {ACTIVE, TRIALING, PAST_DUE}`។

**Path A — Auto-renew ((`autoRenew === true` និង `status !== 'TRIALING'`))** ហៅ `handleAutoRenewal(sub)`:
1. **Idempotency claim**: `updateMany({ where: { id, OR: [{renewalLockedAt: null}, {renewalLockedAt: {lt: staleThreshold(10 នាទី)}}] }, data: { renewalLockedAt: now } })`; បើ `count === 0` (process ផ្សេងកំពុងធ្វើរួច) → `return` ភ្លាម (skip)
2. រក `SavedPaymentMethod` ដែល `isDefault: true` របស់ chef នោះ — **បើគ្មាន Default Card** → បរាជ័យភ្លាម (`failureReason: 'No saved payment method on file'`, គ្មាន `Transaction` row បង្កើត ព្រោះគ្មាន Payment Method ត្រូវសរសេរភ្ជាប់)
3. **បើមាន Default Card**: ហៅ `chargeSubscription({ chef, plan, paymentMethod: defaultMethod.provider, savedPaymentMethodId: defaultMethod.id, subscriptionId, idempotencyKey: \`${sub.id}-${sub.endDate.toISOString()}\` })`
4. **ជោគជ័យ**: `status: 'ACTIVE'`, `endDate` ថ្មី (`getSubscriptionEndDate`), **`retryCount: 0`** (reset), `renewalLockedAt: null` → ផ្ញើ Receipt Email (PDF ភ្ជាប់, fire-and-forget)
5. **បរាជ័យ**: `newRetryCount = sub.retryCount + 1`; បើ `newRetryCount >= MAX_AUTO_RETRY_ATTEMPTS (3)` → `status: 'EXPIRED'` (Graceful Lockout); ផ្សេងទៀត → `status: 'PAST_DUE'`; ទាំងពីរករណី `retryCount: newRetryCount`, `renewalLockedAt: null` → ផ្ញើ Payment-Failed Notification Email (Retry ដង/Final Attempt តាម `isFinalAttempt`, fire-and-forget)

**Path B — Trial ចប់ ឬ Chef បានបោះបង់ Auto-renew ( `!autoRenew || status === 'TRIALING'`)**: `status: 'EXPIRED'` ភ្លាមៗ (គ្មាន Retry, គ្មាន Claim, ព្រោះមិនមាន Charge ត្រូវព្យាយាម — data មិនត្រូវបានលុប)

**MAX_AUTO_RETRY_ATTEMPTS = 3** (Constant ក្នុង File, មិនទាន់ជា Env Var — "Configurable" តាម Technical Note US-20 មានន័យត្រឹមតែផ្លាស់ប្តូរ Constant នេះក្នុង Code)។

### 6.12 Naming Conventions (ពី Code)
- ឯកសារ: `<name>.controller.js`, `<name>.routes.js`, `<name>.service.js`, `<name>.validator.js`; ឈ្មោះ camelCase (`menuSet`, `vendorPreset`, `paymentMethod`)
- Function controller: verb + noun (`getMyUnits`, `createDish`, `archiveMenuSet`, `togglePurchased`)
- Zod schema: `<action><Entity>Schema` (`createDishSchema`, `updateEventSchema`)
- Error code: `UPPER_SNAKE_CASE`, ភាគច្រើន `<DOMAIN>_<REASON>` (`AUTH_OTP_INVALID`, `DISH_NOT_FOUND`)
- URL: kebab-case, plural សម្រាប់ resource (`/menu-sets`, `/vendor-presets`); JSON field camelCase
- HTTP verb: `GET` អាន, `POST` បង្កើត/action (`/import`, `/clone`, `/duplicate`, `/upgrade`, `/cancel`, `/resume`), `PATCH` កែ/archive/toggle, `DELETE` លុបពិត
- Prisma: model PascalCase, `@@map("snake_case_plural")`, id `String @default(uuid())`, field camelCase
- Comment ក្នុង Code យោង User Story (`// US-nn`)

## 7. Data Model សង្ខេប (`schema.prisma`)
Enums: `AuthProvider`(LOCAL, GOOGLE), `SubscriptionStatus`(TRIALING, ACTIVE, PAST_DUE, CANCELED, EXPIRED), `TransactionStatus`(PENDING, SUCCESS, FAILED, REFUNDED), `PaymentMethod`(ABA_PAYWAY, VISA_MASTERCARD, WING), `RefundStatus`(REQUESTED, APPROVED, REJECTED), `PresetSource`(PRESET, CUSTOM)

Models: `Chef` (`trialUsed`, `language`, `hasCompletedOnboarding`), `RefreshToken`, `Unit`, `Category`, `Ingredient` (global) · `ChefUnit`, `ChefCategory`, `ChefIngredient` (per-chef) · `Plan` (`isRecommended`), `Subscription` (1:1 Chef; `retryCount`, `renewalLockedAt`), `Transaction`, `BillingInfo`, `SavedPaymentMethod` · `Dish`, `DishIngredient`, `MenuSet`, `MenuSetDish` (`sortOrder`) · `Event`, `EventDish`, `EventMenuSet`, `VendorPreset`, `VendorPresetIngredient`, `EventPurchaseStatus`

## 8. Inconsistencies (Pattern មិនស៊ីគ្នា — ពិនិត្យតាម Code)

### A. Response / Error
1. Endpoint ទាញឯកសារ (`GET /billing/transactions/:id/invoice`, report PDF/Excel) មិនប្រើ `ApiResponse`; `/health` ក៏សរសេរ `res.json` ផ្ទាល់ (រូបរាងដូចគ្នា ប៉ុន្តែមិនឆ្លងកាត់ `ApiResponse`)។
2. `errors[]` មានរូបរាងខុសគ្នា: validation = `{field,message,code,params}`; `PAYMENT_FAILED` / `PAYMENT_RETRY_FAILED` = `[{ transactionId }]`; ករណីផ្សេងទទេ។
3. Code ដដែល ប៉ុន្តែ HTTP status ខុស: `STOCK_INGREDIENT_NOT_FOUND` = **404** ក្នុង `ingredient.controller`, តែ = **400** ក្នុង `vendorPreset.controller`។ `SUBSCRIPTION_NOT_FOUND` = **403** ពី `requireActiveSubscription` Middleware តែ = **404** ពី `GET /subscription/me` ផ្ទាល់។ ក្រៅពីនេះ ករណី "រក ingredient មិនឃើញ" មាន 3 ឈ្មោះ: `STOCK_INGREDIENT_NOT_FOUND`, `INGREDIENT_NOT_FOUND` (procurement), `INGREDIENTS_NOT_FOUND` (import)។
4. ដែនកំណត់ចំនួនដង ប្រើ status ខុសគ្នា: `AUTH_OTP_RESEND_LIMITED` = 403 (per-account), `AUTH_RESEND_RATE_LIMITED` = 429 (per-IP); `AUTH_ACCOUNT_LOCKED` / `AUTH_TOO_MANY_ATTEMPTS` = 403។
5. Error ដែលមិនមែន `ApiError` និងគ្មាន status ស្គាល់ ទទួល `code: 'ERROR'` (គ្មាន code ជាក់លាក់)។
6. `validate()` ពិនិត្យ body តែមួយ — query (`archived`, `tag`, `upcoming`, `categoryId`) និង path param (`:id` …) មិនត្រូវបាន validate ដោយ Zod។

### B. Auth / Config
7. Cookie refresh token `maxAge` ចាក់ចូល 7 ថ្ងៃ (`REFRESH_TOKEN_MAX_AGE_MS` ក្នុង auth.controller) និង `expiresAt` ក្នុង DB ដូចគ្នា ប៉ុន្តែ JWT expiry មកពី `JWT_REFRESH_EXPIRES_IN` (កំណត់ជា env បាន) — ប្រសិនបើ env ផ្លាស់ប្តូរ តម្លៃទាំងបីនឹងលែងស៊ីគ្នា។
8. `res.clearCookie('refreshToken')` ហៅដោយគ្មាន option (`httpOnly/sameSite/secure`) ដែលបានប្រើពេល `res.cookie`។
9. `changePassword` មិនលុប refresh token, ខណៈ `resetPassword` លុបទាំងអស់។
10. Refresh token មិន rotate; គ្មាន job សម្អាត row `refresh_tokens` ដែលផុតកំណត់។
11. Limiter ជាក់លាក់ (register/login/resend-otp) មាន ប៉ុន្តែ `/auth/google`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password` ប្រើតែ global limiter (300/15នាទី)។
12. `verifyGoogleIdToken` ត្រឡប់ `emailVerified` ប៉ុន្តែ `googleLogin` មិនប្រើវា។ ពេលភ្ជាប់ Google ទៅ account មានស្រាប់ `authProvider` នៅតែ `LOCAL`។
13. `env.js` ជា config កណ្តាល ប៉ុន្តែ file ជាច្រើនអាន `process.env` ផ្ទាល់ (ចំណុច §5); `validateEnv` ពិនិត្យតែ 3 ตัว។
14. `requireAuth` ពិនិត្យតែ JWT (មិនរក chef ក្នុង DB), ខណៈ `refresh-token` និង `getMe` រក chef ក្នុង DB។

### C. Routes / Naming
15. `event.routes.js` ប្រើ param `:id` សម្រាប់ CRUD ប៉ុន្តែ `:eventId` សម្រាប់ shopping-list/report/procurement។ Param toggle = `:chefIngredientId` (README សរសេរ `:ingredientId`)។
16. Prefix ឯកវចនៈ/ពហុវចនៈលាយគ្នា: `/subscription`, `/billing`, `/onboarding`, `/dashboard` vs `/units`, `/menu-sets`, `/vendor-presets` ។
17. Semantics "Archive" ខុសគ្នា: Unit/Category/Ingredient ប្រើ `isActive` (list ត្រឹមតែ active, គ្មាន `?archived`); Dish/MenuSet ប្រើ `isArchived` (មាន `?archived=true`)។ `Event` គ្មាន archive/delete; Unit/Category គ្មាន hard delete។
18. `PATCH /vendor-presets/:id` គ្មាន `validate()` (route ផ្សេងដែលមាន body ទាំងអស់មាន)។
19. ឈ្មោះ file middleware លាយ: `auth.middleware.js` (មាន suffix) vs `errorHandler.js`, `rateLimiters.js`, `requireActiveSubscription.js` (គ្មាន suffix)។
20. Validator ចងក្រុមមិនតាម entity: `catalog.validator` = unit+category+ingredient; `event.validator` រួមទាំង `vendorPresetSchema` និង report schema; `billing.validator` រួមទាំង subscription upgrade/retry/saved-payment-method។

### D. Architecture
21. Controller ហៅ Prisma ផ្ទាល់ភាគច្រើន; Service មានតែ logic ចែករំលែក — Layer "Controller/Service" ប្រើមិនស្មើគ្នា។
22. `sendReceiptEmailInBackground` ចម្លងដូចគ្នា ៣ កន្លែង (`subscription.controller.js`, `payment.controller.js`, `subscription.cron.js` ជា `sendReceiptEmailSafely`); ការគណនា `endDate` ក្នុង `retryPayment` សរសេរដោយដៃ ខណៈ `getSubscriptionEndDate` មាននៅក្នុង service។
23. `PrismaClient` ពីរ instance: `config/db.js` (singleton ប្រើដោយ controller/service) និង `new PrismaClient()` ក្នុង `server.js`។
24. `$transaction` ប្រើក្នុង `startTrialForChef`, `paymentMethod.controller`, cron មិនប្រើ `$transaction` ពេលកែ `Subscription` (claim → charge → update ជា Query ដាច់ដោយឡែក ការពារដោយ `renewalLockedAt` ជំនួសវិញ); ការសរសេរច្រើនជំហានផ្សេងៗ (createDish, updateDish, create/updateMenuSet, updateVendorPreset, importIngredients …) មិនស្ថិតក្នុង transaction។ `upsertDishIngredients` ជា delete+create មិនមែន upsert។
25. Response data: ខ្លះជា raw Prisma object (`createDish`, `createUnit` …), ខ្លះជា DTO រៀបចំ (`getDishDetail`, `getMyIngredients` ដែល `category` ជា string ខណៈ `createIngredient` ត្រឡប់ `categoryId`)។
26. Dead code: `verifyTransaction` (abaPayway) មិនត្រូវបានហៅ; `require('pdfkit')` មិនប្រើក្នុង `report.controller.js`។

### E. Schema ↔ Code
27. តម្លៃ/field ក្នុង schema ដែល Code មិនប្រើ (ឬប្រើដោយផ្នែក): `SubscriptionStatus.CANCELED` (Code ប្រើ `autoRenew:false` លើ `status` ដែលមានស្រាប់ជំនួស ដោយមិនដែលកំណត់ `CANCELED` ផ្ទាល់), `TransactionStatus.PENDING/REFUNDED`, `RefundStatus.APPROVED/REJECTED` (គ្មាន Admin Endpoint អនុម័ត), `Plan.features` (Json field រក្សា ប៉ុន្តែគ្មាន Logic អាន)។ **`Subscription.retryCount` ត្រូវបានបូក និង Reset ជាក់ស្តែងក្នុង Cron** (មិនមែនមិនដែលបូកទេ); `renewalLockedAt` ត្រូវបានប្រើជា Idempotency Claim ក្នុង Cron។
28. `PaymentMethod` enum + validator អនុញ្ញាត `VISA_MASTERCARD`, `WING` ប៉ុន្តែ `payment.service` គាំទ្រតែ `ABA_PAYWAY` (ផ្សេងទៀត → 400 `PAYMENT_METHOD_UNSUPPORTED`)។ **Cron ប្រើ `SavedPaymentMethod` ដែល `isDefault:true` របស់ Chef សម្រាប់ Auto-charge** (មិនចាក់ជាប់ `ABA_PAYWAY` ដោយគ្មាន Token ទេ) — បើ Chef គ្មាន Default Card, Cron ចាត់ទុកថាបរាជ័យភ្លាមដោយមិនហៅ Gateway។
29. `deleteDish` ពិនិត្យតែ `MenuSetDish`; `deleteMenuSet` មិនពិនិត្យ `EventMenuSet`; `deleteMyIngredient` ពិនិត្យតែ `DishIngredient`។ Relation `EventDish→Dish`, `EventMenuSet→MenuSet`, `VendorPresetIngredient`/`EventPurchaseStatus→ChefIngredient` គ្មាន `onDelete` (Prisma default = Restrict) → ករណីទាំងនេះនឹងធ្លាក់ទៅ `P2003` → 400 `INVALID_REFERENCE`។

### F. README ↔ Code
30. README រាយ `/units/:id/select|deselect`, `ChefUnitPreference`, `ChefCategoryPreference` — មិនមានក្នុង Code/schema (Code ប្រើ `/import`, `/archive`, `ChefUnit`, `ChefCategory`)។
31. README: Vendor Preset ចងក្រុម "global Ingredient" — Code ប្រើ `chefIngredientIds`; README: shopping list group តាម "name" — Code group តាម `chefIngredientId`។
32. README: "i18n handled entirely on Frontend" — Backend ក៏បកប្រែ email និង PDF (km/en) តាម `chef.language`។
33. README: "`requireActiveSubscription` available to protect premium routes" — ជាក់ស្តែងត្រូវបានប្រើលើ write route ស្ទើរទាំងអស់។
34. README: រូបភាព Dish ផ្ញើជា URL ពី Cloudinary (Frontend upload) — ប៉ុន្តែ avatar upload តាម Backend (`POST /auth/avatar`)។
35. README មិនរាយ `/subscription/resume`, `/billing/payment-methods*`, `rateLimiters.js`, `upload.js`, `otpHash.js`, `payment.service.js`, `pdf.service.js`, `upload.service.js`, `cloudinary.js`; រាប់ controller 15 (ជាក់ស្តែង 16)។ README ក៏មិនទាន់ឆ្លុះបញ្ចាំង Retry/Idempotency Logic ថ្មីក្នុង Cron ពី Epic 5 ដែរ។

## 9. Missing / Not Provided (មិនមានក្នុង zip — មិនសន្មត់)
- `prisma/migrations/` (README បញ្ជាឲ្យ `migrate dev --name init`)
- API docs ក្នុង README ("Endpoint-by-endpoint documentation … per Epic 2–12") និងឯកសារ User Story / Epic (US-01…US-60) ដែល comment យោង
- `package-lock.json` / lockfile, `.env` (ធម្មតា), tests, ESLint/Prettier config, Dockerfile/CI
- Plan seeding: `seed.js` មិនបង្កើត `Plan` ជាប់បង់ប្រាក់ (មានតែ `startTrialForChef` បង្កើត plan `trial` ស្វ័យប្រវត្តិ) និងគ្មាន admin endpoint សម្រាប់ Plan/Refund approval
- Payment webhook endpoint (កត់ Comment ក្នុង `subscription.service.js` ថាជា Known Deviation — ត្រូវធ្វើពេលមាន ABA PayWay Credential ពិត); pagination លើ list endpoint; `app.set('trust proxy')` (មិនមានក្នុង app.js)
- `MAX_AUTO_RETRY_ATTEMPTS` (Cron retry limit) ជា Hardcoded Constant មិនទាន់ជា Env Var/DB Config
- Frontend code
