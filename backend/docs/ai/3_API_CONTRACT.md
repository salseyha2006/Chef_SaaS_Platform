# API_CONTRACT.md — Chef SaaS Platform Backend

Base URL: `{API_BASE_URL}/api/v1` · សរុប **81 endpoints** · ចងក្រងពី routes/controllers/validators ក្នុង Code

## 0. ច្បាប់រួម

**Auth column**: `Public` = គ្មាន token · `Auth` = `requireAuth` (Bearer access token) · `Auth+Sub` = `requireAuth` + `requireActiveSubscription`

**Success envelope**: `{ "success": true, "message": string, "data": … }` (ឯកសារ binary លើកលែង)

**Error envelope**: `{ "success": false, "message": string, "code": string, "params"?: object, "errors"?: array }`

**Global errors (អាចកើតលើ endpoint ណាក៏បាន)**
| HTTP | code | ពេលណា |
|---|---|---|
| 400 | `VALIDATION_FAILED` | Zod body ខុស; `errors[] = {field,message,code,params?}` |
| 400 | `INVALID_JSON` / `INVALID_REFERENCE` | JSON parse ខុស / Prisma P2003 |
| 401 | `AUTH_ACCESS_TOKEN_MISSING` / `_EXPIRED` / `_INVALID` | ជាមួយ `Auth`, `Auth+Sub` |
| 403 | `SUBSCRIPTION_NOT_FOUND` / `SUBSCRIPTION_EXPIRED` | ជាមួយ `Auth+Sub` |
| 404 | `ROUTE_NOT_FOUND` / `RECORD_NOT_FOUND` | Route មិនមាន / Prisma P2025 |
| 409 | `DUPLICATE_VALUE` | Prisma P2002 (`params.field`) |
| 413 | `PAYLOAD_TOO_LARGE` | body > 10mb |
| 429 | `RATE_LIMITED` | global 300 req/15 នាទី |
| 500 | `INTERNAL_ERROR` | (production ប្តូរ message) |

**Validation code**: `VALIDATION_REQUIRED`, `_INVALID_TYPE`, `_INVALID_EMAIL`, `_INVALID_ID` (uuid), `_INVALID_URL`, `_INVALID_DATETIME`, `_INVALID_FORMAT`, `_TOO_SHORT`, `_TOO_LONG`, `_LENGTH_EXACT`, `_ARRAY_MIN`, `_ARRAY_MAX`, `_TOO_SMALL`, `_TOO_BIG`, `_INVALID_OPTION`, `_INVALID`

**កំណត់ចំណាំរួម**: `:id` param មិនត្រូវបាន validate ជា uuid; ទិន្នន័យរបស់ chef ផ្សេង → 404 (code `<ENTITY>_NOT_FOUND`); `language` ∈ `'km' | 'en'`; `paymentMethod`/`provider` ∈ `'ABA_PAYWAY' | 'VISA_MASTERCARD' | 'WING'`; ទម្រង់ `Chef` = `{id,email,displayName,avatarUrl,language}`។ Entity ដែលសរសេរ "Model" = raw Prisma object (field តាម `schema.prisma`)។

---

## 1. Health
| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/health` | Public | — | `null` (message `API is healthy`) | — |

## 2. Auth — `/auth`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| POST | `/auth/register` | Public + limiter 5/ម៉ោង | body `{email, password(min8), displayName?(min2), language?}` | 201 `{id,email,language}` · បង្កើត trial 14 ថ្ងៃ + ផ្ញើ OTP email | 409 `AUTH_EMAIL_EXISTS`; 429 `AUTH_REGISTER_RATE_LIMITED` |
| POST | `/auth/google` | Public | `{idToken(min10), language?}` | 200 `{accessToken, chef}` + set cookie `refreshToken` | 401 `AUTH_GOOGLE_TOKEN_INVALID` |
| POST | `/auth/verify-email` | Public | `{email, otp(6 ខ្ទង់)}` | 200 `null` | 404 `AUTH_ACCOUNT_NOT_FOUND`; 400 `AUTH_EMAIL_ALREADY_VERIFIED`, `AUTH_OTP_INVALID`, `AUTH_OTP_EXPIRED` |
| POST | `/auth/login` | Public + limiter 10/15នាទី | `{email, password}` | 200 `{accessToken, chef}` + set cookie | 401 `AUTH_INVALID_CREDENTIALS`; 403 `AUTH_ACCOUNT_LOCKED` (`params.minutes`), `AUTH_TOO_MANY_ATTEMPTS` (`params.minutes`=15), `AUTH_EMAIL_NOT_VERIFIED`; 429 `AUTH_LOGIN_RATE_LIMITED` |
| POST | `/auth/forgot-password` | Public | `{email}` | 200 `null` (ដូចគ្នាទោះ email មានឬអត់) | — |
| POST | `/auth/reset-password` | Public | `{email, otp(6), newPassword(min8)}` | 200 `null` · លុប refresh token ទាំងអស់ | 400 `AUTH_OTP_INVALID`, `AUTH_OTP_EXPIRED` |
| POST | `/auth/refresh-token` | Public (cookie `refreshToken`) | គ្មាន body validator | 200 `{accessToken}` | 401 `AUTH_REFRESH_TOKEN_MISSING`, `AUTH_REFRESH_TOKEN_INVALID`; 404 `AUTH_ACCOUNT_NOT_FOUND` |
| POST | `/auth/logout` | Public (cookie) | — | 200 `null` | — |
| POST | `/auth/resend-otp` | Public + limiter 10/15នាទី | `{email}` | 200 `null` | 404 `AUTH_ACCOUNT_NOT_FOUND`; 400 `AUTH_EMAIL_ALREADY_VERIFIED`; 403 `AUTH_OTP_RESEND_LIMITED` (`params.minutes`; 3/10នាទី); 429 `AUTH_RESEND_RATE_LIMITED` |
| POST | `/auth/avatar` | Auth | `multipart/form-data` field `avatar` (jpeg/png/webp ≤5MB) | 200 `{avatarUrl}` | 400 `AVATAR_FILE_REQUIRED`, `AVATAR_INVALID_TYPE`, `AVATAR_TOO_LARGE`, `AVATAR_UPLOAD_ERROR` |
| GET | `/auth/me` | Auth | — | 200 `{id,email,displayName,avatarUrl,language,isEmailVerified,authProvider,hasCompletedOnboarding,createdAt}` | 404 `AUTH_ACCOUNT_NOT_FOUND` |
| PATCH | `/auth/profile` | Auth | `{displayName?(min2), language?}` | 200 `Chef` | — |
| PATCH | `/auth/change-password` | Auth | `{currentPassword?, newPassword(min8)}` | 200 `null` | 404 `AUTH_ACCOUNT_NOT_FOUND`; 400 `AUTH_CURRENT_PASSWORD_REQUIRED`; 401 `AUTH_CURRENT_PASSWORD_INCORRECT` |

## 3. Onboarding — `/onboarding`
| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| PATCH | `/onboarding/complete` | Auth | — | 200 `{hasCompletedOnboarding: true}` | — |

## 4. Subscription — `/subscription`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/subscription/plans` | Public | — | 200 `Plan[]` (`isActive`, `billingCycle != 'trial'`, តម្រៀប recommended↓ price↑) | — |
| GET | `/subscription/me` | Auth | — | 200 `Subscription + plan + daysRemaining` | 404 `SUBSCRIPTION_NOT_FOUND` |
| POST | `/subscription/upgrade` | Auth | `{planId(uuid), paymentMethod, savedPaymentMethodId?(uuid)}` | 200 `{subscription, transaction}` · ផ្ញើ receipt email (background) | 404 `PLAN_NOT_FOUND`; 400 `PAYMENT_METHOD_NOT_FOUND`, `PAYMENT_METHOD_MISMATCH`, `PAYMENT_METHOD_UNSUPPORTED`, `PAYMENT_FAILED` (`errors=[{transactionId}]`, `params={reason,transactionId}`) |
| POST | `/subscription/cancel` | Auth | — | 200 `Subscription` (`autoRenew:false`, `canceledAt`) | 404 `SUBSCRIPTION_NOT_FOUND` |
| POST | `/subscription/resume` | Auth | — | 200 `Subscription` (`autoRenew:true`) | 404 `SUBSCRIPTION_NOT_FOUND`; 400 `SUBSCRIPTION_ALREADY_AUTO_RENEWING`, `SUBSCRIPTION_EXPIRED_CANNOT_RESUME` |
| POST | `/subscription/payments/:transactionId/retry` | Auth | `{paymentMethod?, savedPaymentMethodId?(uuid)}` | 200 `Transaction` | 404 `TRANSACTION_NOT_FOUND`; 400 `PAYMENT_RETRY_NOT_ALLOWED`, `PAYMENT_RETRY_FAILED` (`params={reason,transactionId}`), `PAYMENT_METHOD_NOT_FOUND`, `PAYMENT_METHOD_MISMATCH`, `PAYMENT_METHOD_UNSUPPORTED` |

## 5. Billing — `/billing`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/billing/transactions` | Auth | — | 200 `(Transaction + plan)[]` (createdAt↓) | — |
| GET | `/billing/transactions/:id` | Auth | — | 200 `Transaction + plan + chef{email,displayName}` | 404 `TRANSACTION_NOT_FOUND` |
| GET | `/billing/transactions/:id/invoice` | Auth | — | 200 `application/pdf` (`invoice-<invoiceNumber>.pdf`) | 404 `TRANSACTION_NOT_FOUND` |
| PATCH | `/billing/info` | Auth | `{billingName?(min2), shopAddress?(min2), phoneNumber?(min6)}` | 200 `BillingInfo` (upsert) | — |
| POST | `/billing/transactions/:id/refund-request` | Auth | `{reason(min5)}` | 200 `Transaction` (`refundStatus:'REQUESTED'`) | 404 `TRANSACTION_NOT_FOUND`; 400 `REFUND_NOT_ALLOWED`; 409 `REFUND_ALREADY_REQUESTED` |
| GET | `/billing/payment-methods` | Auth | — | 200 `[{id,provider,last4,brand,isDefault,createdAt}]` | — |
| POST | `/billing/payment-methods` | Auth | `{provider, gatewayToken(min4), last4(4 តួ), brand?, isDefault?}` | 201 `{id,provider,last4,brand,isDefault}` (card ដំបូង = default) | — |
| PATCH | `/billing/payment-methods/:id/default` | Auth | — | 200 `null` | 404 `PAYMENT_METHOD_NOT_FOUND` |
| DELETE | `/billing/payment-methods/:id` | Auth | — | 200 `null` (បើលុប default → card ថ្មីបំផុតក្លាយជា default) | 404 `PAYMENT_METHOD_NOT_FOUND` |

## 6. Units — `/units`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/units/presets` | Auth | — | 200 `[{id,name,abbreviation,unitType,conversionRate,isImported}]` | — |
| GET | `/units` | Auth | — | 200 `ChefUnit[]` (`isActive`, name↑) | — |
| POST | `/units` | Auth+Sub | `{name, abbreviation, unitType:'weight'|'volume'|'count', conversionRate(>0)}` | 201 `ChefUnit` | 409 `UNIT_EXISTS` |
| POST | `/units/presets/:presetId/import` | Auth+Sub | — | 201 `ChefUnit` | 404 `UNIT_NOT_FOUND`; 409 `UNIT_ALREADY_IMPORTED` |
| PATCH | `/units/:id` | Auth+Sub | `{name?, abbreviation?, unitType?, conversionRate?}` | 200 `ChefUnit` | 404 `UNIT_NOT_FOUND`; 409 `UNIT_EXISTS` |
| PATCH | `/units/:id/archive` | Auth+Sub | — | 200 `ChefUnit` (`isActive:false`) | 404 `UNIT_NOT_FOUND` |

## 7. Categories — `/categories`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/categories/presets` | Auth | — | 200 `[{id,name,isImported}]` | — |
| GET | `/categories` | Auth | — | 200 `ChefCategory[]` (`isActive`) | — |
| POST | `/categories` | Auth+Sub | `{name}` | 201 `ChefCategory` | 409 `CATEGORY_EXISTS` |
| POST | `/categories/presets/:presetId/import` | Auth+Sub | — | 201 `ChefCategory` | 404 `CATEGORY_NOT_FOUND`; 409 `CATEGORY_ALREADY_IMPORTED` |
| PATCH | `/categories/:id` | Auth+Sub | `{name}` (តម្រូវ) | 200 `ChefCategory` | 404 `CATEGORY_NOT_FOUND`; 409 `CATEGORY_EXISTS` |
| PATCH | `/categories/:id/archive` | Auth+Sub | — | 200 `ChefCategory` (`isActive:false`) | 404 `CATEGORY_NOT_FOUND` |

## 8. Ingredients — `/ingredients`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/ingredients/presets` | Auth | — | 200 `[{category:string, items:[{id,name,defaultUnit:{id,name}|null,isImported}]}]` | — |
| POST | `/ingredients/import` | Auth+Sub | `{items:[{ingredientId(uuid), purchasePrice(≥0), unitId(uuid)}](min1)}` | 201 `ChefIngredient[]` ដែលបង្កើតថ្មី (រំលងស្ងៀមស្ងាត់ប្រសិនបើ import រួច ឬឈ្មោះជាន់) | 400 `INGREDIENTS_NOT_FOUND`, `UNIT_NOT_IN_LIST` |
| POST | `/ingredients` | Auth+Sub | `{name, purchasePrice(≥0), unitId(uuid), categoryId?(uuid)}` | 201 `ChefIngredient` | 409 `INGREDIENT_EXISTS`; 400 `UNIT_NOT_IN_LIST`, `CATEGORY_NOT_IN_LIST` |
| GET | `/ingredients/my-stock` | Auth | query `categoryId?` | 200 `[{id,name,category:string,purchasePrice,unit:{id,name,abbreviation},source}]` | — |
| PATCH | `/ingredients/my-stock/:id` | Auth+Sub | `{name?, purchasePrice?(≥0), unitId?, categoryId?}` | 200 `ChefIngredient` · បើមាន `purchasePrice` → recalc ថ្លៃ Dish/MenuSet | 404 `STOCK_INGREDIENT_NOT_FOUND`; 409 `INGREDIENT_EXISTS`; 400 `UNIT_NOT_IN_LIST`, `CATEGORY_NOT_IN_LIST` |
| PATCH | `/ingredients/my-stock/:id/archive` | Auth+Sub | — | 200 `ChefIngredient` (`isActive:false`) | 404 `STOCK_INGREDIENT_NOT_FOUND` |
| DELETE | `/ingredients/my-stock/:id` | Auth+Sub | — | 200 `null` | 404 `STOCK_INGREDIENT_NOT_FOUND`; 409 `INGREDIENT_IN_USE` (`params.count`) |

## 9. Dishes — `/dishes`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/dishes` | Auth | query `tag?`, `archived?` (`'true'` = archived; ក្រៅនេះ = active) | 200 `Dish[]` (name↑) | — |
| POST | `/dishes` | Auth+Sub | `{name, description?, imageUrl?(url), tags?:string[], ingredients:[{chefIngredientId(uuid), quantityUsed(>0)}](min1)}` | 201 `Dish` (រួម `totalCost`) | 400 `DISH_INGREDIENTS_NOT_IN_STOCK` |
| GET | `/dishes/:id` | Auth | — | 200 `{id,name,description,imageUrl,tags,totalCost,isArchived,costBreakdown:[{ingredientName,quantityUsed,unit,unitPrice,subtotal,percentageOfTotal}]}` | 404 `DISH_NOT_FOUND` |
| PATCH | `/dishes/:id` | Auth+Sub | `{name?, description?, imageUrl?, tags?, ingredients?:[…]}` (បើផ្ញើ `ingredients` = ជំនួសទាំងអស់) | 200 `Dish` | 404 `DISH_NOT_FOUND`; 400 `DISH_INGREDIENTS_NOT_IN_STOCK` |
| POST | `/dishes/:id/duplicate` | Auth+Sub | — | 201 `Dish` (ឈ្មោះ `"<name> (Copy)"`) | 404 `DISH_NOT_FOUND` |
| PATCH | `/dishes/:id/archive` | Auth+Sub | — | 200 `Dish` (`isArchived:true`) | 404 `DISH_NOT_FOUND` |
| DELETE | `/dishes/:id` | Auth+Sub | — | 200 `null` | 404 `DISH_NOT_FOUND`; 409 `DISH_IN_USE` (`params.count`, ពិនិត្យ MenuSet តែប៉ុណ្ណោះ) |

## 10. Menu Sets — `/menu-sets`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/menu-sets` | Auth | query `archived?` (`'true'`) | 200 `MenuSet[]` | — |
| POST | `/menu-sets` | Auth+Sub | `{name, dishIds:uuid[](min1)}` | 201 `MenuSet` (`totalCost` គណនារួច) | 400 `MENU_SET_DISHES_INVALID` |
| GET | `/menu-sets/:id` | Auth | — | 200 `{id,name,totalCost,isArchived,dishes:[{dishId,name,imageUrl,cost,sortOrder}]}` | 404 `MENU_SET_NOT_FOUND` |
| PATCH | `/menu-sets/:id` | Auth+Sub | `{name?, dishIds?:uuid[]}` (`dishIds` = ជំនួសទាំងអស់, `sortOrder` តាមលំដាប់) | 200 `MenuSet` | 404 `MENU_SET_NOT_FOUND`; 400 `MENU_SET_DISHES_INVALID` |
| PATCH | `/menu-sets/:id/archive` | Auth+Sub | — | 200 `MenuSet` | 404 `MENU_SET_NOT_FOUND` |
| DELETE | `/menu-sets/:id` | Auth+Sub | — | 200 `null` | 404 `MENU_SET_NOT_FOUND` |

## 11. Events — `/events`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/events` | Auth | query `upcoming?` (`'true'` = `eventDate >= now`) | 200 `Event[]` (eventDate↑) | — |
| POST | `/events` | Auth+Sub | `{name, eventDate(ISO datetime string), tableCount(int>0)}` | 201 `Event` | — |
| GET | `/events/:id` | Auth | — | 200 `Event + dishes[{…,dish}] + menuSets[{…,menuSet}]` | 404 `EVENT_NOT_FOUND` |
| PATCH | `/events/:id` | Auth+Sub | `{name?, eventDate?, tableCount?}` | 200 `Event` | 404 `EVENT_NOT_FOUND` |
| POST | `/events/:id/clone` | Auth+Sub | `{name?, eventDate?}` | 201 `Event` (ចម្លង dishes + menuSets + tableCount; ឈ្មោះ default `"<name> (Copy)"`) | 404 `EVENT_NOT_FOUND` |
| POST | `/events/:id/items` | Auth+Sub | `{dishIds?:uuid[], menuSetIds?:uuid[]}` | 200 `Event + dishes + menuSets` (`skipDuplicates`) | 404 `EVENT_NOT_FOUND`; 400 `EVENT_DISHES_INVALID`, `EVENT_MENU_SETS_INVALID` |
| DELETE | `/events/:id/dishes/:dishId` | Auth+Sub | — | 200 `null` | 404 `EVENT_NOT_FOUND` |
| DELETE | `/events/:id/menu-sets/:menuSetId` | Auth+Sub | — | 200 `null` | 404 `EVENT_NOT_FOUND` |
| GET | `/events/:id/cost-calculation` | Auth | — | 200 `{eventId,eventName,tableCount,items:[ShoppingItem],grandTotal}` | 404 `EVENT_NOT_FOUND` |

`ShoppingItem` = `{chefIngredientId, ingredientName, unit:{id,name,abbreviation}, unitPrice, quantityPerTable, totalQuantity, totalPrice}`

## 12. Shopping List, Procurement & Reports — ក្រោម `/events`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/events/:eventId/shopping-list` | Auth | — | 200 `{eventId,eventName,items:[ShoppingItem + isPurchased],progress(%),purchasedCount,totalCount}` | 404 `EVENT_NOT_FOUND` |
| PATCH | `/events/:eventId/shopping-list/:chefIngredientId/toggle-purchased` | Auth+Sub | `{isPurchased: boolean}` | 200 `EventPurchaseStatus` | 404 `EVENT_NOT_FOUND`, `INGREDIENT_NOT_FOUND` |
| GET | `/events/:eventId/shopping-list/vendor/:vendorPresetId` | Auth | — | 200 `{eventId,vendorPresetName,items:[ShoppingItem]}` | 404 `EVENT_NOT_FOUND`, `VENDOR_PRESET_NOT_FOUND` |
| POST | `/events/:eventId/reports/pdf` | Auth (គ្មាន Sub) | `{title?, items?:[{ingredientName, totalQuantity, unit:{abbreviation}}]}` | 200 `application/pdf` (`purchasing-list-<eventId>.pdf`; ឈ្មោះ+បរិមាណ មិនមានតម្លៃ) | 404 `EVENT_NOT_FOUND` |
| GET | `/events/:eventId/reports/excel` | Auth (គ្មាន Sub) | — | 200 `.xlsx` (`cost-report-<eventId>.xlsx`; sheets `Dish Detail`, `Shopping List Summary`) | 404 `EVENT_NOT_FOUND` |

## 13. Vendor Presets — `/vendor-presets`
| Method | Path | Auth | Request | Response `data` | Errors (code) |
|---|---|---|---|---|---|
| GET | `/vendor-presets` | Auth | — | 200 `[{id,name,ingredients:[{id,name}]}]` | — |
| POST | `/vendor-presets` | Auth+Sub | `{name, chefIngredientIds:uuid[](min1)}` | 201 `VendorPreset` | 409 `VENDOR_PRESET_EXISTS`; 400 `STOCK_INGREDIENT_NOT_FOUND` |
| PATCH | `/vendor-presets/:id` | Auth+Sub | `{name?, chefIngredientIds?}` — **គ្មាន Zod validation** | 200 `null` | 404 `VENDOR_PRESET_NOT_FOUND`; 400 `STOCK_INGREDIENT_NOT_FOUND` |
| DELETE | `/vendor-presets/:id` | Auth+Sub | — | 200 `null` | 404 `VENDOR_PRESET_NOT_FOUND` |

## 14. Dashboard — `/dashboard`
| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/dashboard` | Auth | — | 200 `{upcomingEvents:Event[](≤5), dishCount, menuSetCount, monthlySpending, subscription:{status,planName,endDate}|null}` | — |

---

## 15. Inconsistencies (ផ្នែកនេះ សម្រាប់ Contract)
1. **`STOCK_INGREDIENT_NOT_FOUND`**: 404 ក្នុង `/ingredients/my-stock/*` តែ 400 ក្នុង `/vendor-presets` (POST/PATCH)។ Endpoint `toggle-purchased` ប្រើ `INGREDIENT_NOT_FOUND` (404) ជំនួស។
2. **`errors[]` shape**: validation ≠ payment failure (`[{transactionId}]`)។
3. **Rate-limit status**: `AUTH_OTP_RESEND_LIMITED` = 403 vs `AUTH_RESEND_RATE_LIMITED` = 429 លើ `/auth/resend-otp` តែមួយ; lockout = 403។
4. **Path param**: `:id` vs `:eventId` ក្នុង `/events/*`។
5. **`PATCH /vendor-presets/:id`** គ្មាន validate; endpoint body ផ្សេងៗទាំងអស់មាន។
6. **Archive/list semantics**: units/categories/ingredients (`isActive`, គ្មាន `?archived`) vs dishes/menu-sets (`isArchived`, មាន `?archived`); events គ្មាន archive/delete។
7. **Response shape**: `GET /ingredients/my-stock` ត្រឡប់ `category` ជា string ខណៈ `POST /ingredients` ត្រឡប់ `categoryId` (raw model)។
8. **Payment method**: validator អនុញ្ញាត `VISA_MASTERCARD`/`WING` តែ Backend គាំទ្រតែ `ABA_PAYWAY` → 400 `PAYMENT_METHOD_UNSUPPORTED`; ABA PayWay ជា mock។
9. **Delete guard មិនពេញលេញ**: `DELETE /dishes/:id` ពិនិត្យតែ MenuSet; `DELETE /menu-sets/:id` មិនពិនិត្យ Event; ករណីជាប់ FK ផ្សេងទៀត → Prisma P2003 → 400 `INVALID_REFERENCE` (មិនមែន 409)។
10. **Limiter**: `/auth/google`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password` មានតែ global limiter។
11. **Binary responses** (invoice PDF, report PDF/Excel) មិនប្រើ envelope; error នៃ endpoint ទាំងនោះនៅតែ JSON envelope ធម្មតា។
12. **README ↔ Code**: README រាយ `/units/:id/select|deselect` និង `/categories` select/deselect — មិនមានក្នុង Code។ README មិនរាយ `/subscription/resume`, `/billing/payment-methods*`, `/auth/avatar`, `/auth/resend-otp`, `/events/:id/shopping-list/vendor/:vendorPresetId`។

## 16. Missing / Not Provided
- ឯកសារ API docs per Epic (README និយាយថាមាន) មិនមានក្នុង zip
- Webhook endpoint (payment), Admin endpoint (Plan management, Refund approve/reject — enum `APPROVED/REJECTED` មាន តែគ្មាន endpoint)
- Pagination/sort/search query លើ list endpoint (ជាក់ស្តែងមានតែ filter `tag`, `archived`, `upcoming`, `categoryId`)
- `prisma/migrations/`, tests, lockfile