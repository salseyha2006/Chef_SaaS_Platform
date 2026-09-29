# Error Response Format
{ "success": false, "message": "<English fallback>", "code": "<KEY>", "params": {...}, "errors": [...] }
Frontend: t(`errors:${code}`, { ...params, defaultValue: message })
Validation: errors[i] = { field, message, code, params }

## Generic
| Code | Status | Params |
|---|---|---|
| BAD_REQUEST / UNAUTHORIZED / FORBIDDEN / NOT_FOUND / CONFLICT | 400/401/403/404/409 | — |
| INTERNAL_ERROR | 500 | — |
| ROUTE_NOT_FOUND | 404 | — |
| RATE_LIMITED | 429 | minutes |
| INVALID_JSON | 400 | — |
| PAYLOAD_TOO_LARGE | 413 | — |
| INVALID_REFERENCE | 400 | — |
| RECORD_NOT_FOUND | 404 | — |
| DUPLICATE_VALUE | 409 | field |

## Validation (VALIDATION_FAILED + errors[])
| Code | Params |
|---|---|
| VALIDATION_FAILED | — |
| VALIDATION_REQUIRED | — |
| VALIDATION_INVALID_TYPE | expected |
| VALIDATION_INVALID_EMAIL / _ID / _URL / _DATETIME / _FORMAT | — |
| VALIDATION_LENGTH_EXACT | length |
| VALIDATION_TOO_SHORT | min |
| VALIDATION_TOO_LONG | max |
| VALIDATION_ARRAY_MIN | min |
| VALIDATION_ARRAY_MAX | max |
| VALIDATION_TOO_SMALL | min, inclusive |
| VALIDATION_TOO_BIG | max, inclusive |
| VALIDATION_INVALID_OPTION | options |
| VALIDATION_INVALID | — |

## Auth (401/403/400/404/409)
| Code | Params |
|---|---|
| AUTH_ACCESS_TOKEN_MISSING / _INVALID | — |
| AUTH_ACCESS_TOKEN_EXPIRED | — (Frontend: ហៅ /auth/refresh-token រួចសាកម្តងទៀត) |
| AUTH_REFRESH_TOKEN_MISSING / _INVALID | — (Frontend: ត្រឡប់ទៅទំព័រ Login) |
| AUTH_EMAIL_EXISTS | — |
| AUTH_GOOGLE_TOKEN_INVALID | — |
| AUTH_ACCOUNT_NOT_FOUND | — |
| AUTH_EMAIL_ALREADY_VERIFIED | — |
| AUTH_OTP_INVALID / AUTH_OTP_EXPIRED | — |
| AUTH_INVALID_CREDENTIALS | — |
| AUTH_ACCOUNT_LOCKED | minutes |
| AUTH_TOO_MANY_ATTEMPTS | minutes |
| AUTH_CURRENT_PASSWORD_REQUIRED / _INCORRECT | — |

## Subscription / Payment / Billing
| Code | Params |
|---|---|
| SUBSCRIPTION_NOT_FOUND | — |
| SUBSCRIPTION_EXPIRED | — |
| PLAN_NOT_FOUND | — |
| PAYMENT_FAILED | reason, transactionId (reason ជាអង់គ្លេសពី Gateway) |
| PAYMENT_RETRY_FAILED | reason, transactionId |
| PAYMENT_RETRY_NOT_ALLOWED | — |
| PAYMENT_METHOD_UNSUPPORTED | method |
| TRANSACTION_NOT_FOUND | — |
| REFUND_NOT_ALLOWED / REFUND_ALREADY_REQUESTED | — |

## Catalog (Unit / Category / Ingredient)
| Code | Params |
|---|---|
| UNIT_EXISTS / UNIT_NOT_FOUND / UNIT_NOT_IN_LIST | — |
| CATEGORY_EXISTS / CATEGORY_NOT_FOUND / CATEGORY_NOT_IN_LIST | — |
| INGREDIENT_NOT_FOUND | — |
| INGREDIENTS_NOT_FOUND | — |
| STOCK_INGREDIENT_NOT_FOUND | — |
| INGREDIENT_IN_USE | count |

## Dish / Menu Set / Event / Vendor Preset
| Code | Params |
|---|---|
| DISH_NOT_FOUND / DISH_INGREDIENTS_NOT_IN_STOCK | — |
| DISH_IN_USE | count |
| MENU_SET_NOT_FOUND / MENU_SET_DISHES_INVALID | — |
| EVENT_NOT_FOUND / EVENT_DISHES_INVALID / EVENT_MENU_SETS_INVALID | — |
| VENDOR_PRESET_EXISTS / VENDOR_PRESET_NOT_FOUND | — |