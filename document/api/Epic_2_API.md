# Chef SaaS Platform — API Documentation

## Epic 2: Authentication & Profile (Updated)

Base URL: `/api/v1/auth`

**Response Format (គ្រប់ Endpoint):**
```json
{ "success": true|false, "message": "<text>", "data": {...} }
// លើ Error៖
{ "success": false, "message": "<English fallback>", "code": "<KEY>", "params": {...}, "errors": [...] }
```
Frontend បកប្រែ Error តាម `code` + `params` មិនមែន `message` ទេ (សូមមើលតារាង Error Code ខាងក្រោម)។

---

### 1. Register with Email
**US-02** — Rate limit: **5 ដង/ម៉ោង ក្នុងមួយ IP**

`POST /api/v1/auth/register`
**Auth:** Public

**Request Body**
```json
{
  "email": "chef@example.com",
  "password": "StrongPass123",
  "displayName": "Sok Dara",
  "language": "km"
}
```
> `language`: `"km"` | `"en"`, Optional (Default `"km"`). `displayName` Optional.

**Response `201`**
```json
{
  "success": true,
  "message": "Registered successfully. Please check your email for the verification code.",
  "data": { "id": "uuid", "email": "chef@example.com", "language": "km" }
}
```

**Errors**
| Status | Code |
|---|---|
| 409 | `AUTH_EMAIL_EXISTS` |
| 400 | `VALIDATION_FAILED` |
| 429 | `AUTH_REGISTER_RATE_LIMITED` (params: `minutes`) |

---

### 2. Register / Login via Google
**US-03**

`POST /api/v1/auth/google`
**Auth:** Public

**Request Body**
```json
{
  "idToken": "<google_id_token_from_frontend>",
  "language": "km"
}
```
> `language`: ប្រើតែពេលបង្កើតគណនីថ្មី (Chef ចាស់រក្សាភាសាក្នុង Database ដដែល)

**Response `200`**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "jwt_access_token",
    "chef": {
      "id": "uuid",
      "email": "chef@example.com",
      "displayName": "Sok Dara",
      "avatarUrl": "https://...",
      "language": "km"
    }
  }
}
```
> Sets `refreshToken` httpOnly cookie. Google login មិនតម្រូវ Email Verification ទេ (ស្វ័យប្រវត្តិ Verified)។

**Errors**
| Status | Code |
|---|---|
| 401 | `AUTH_GOOGLE_TOKEN_INVALID` |

---

### 3. Verify Email OTP
**US-04**

`POST /api/v1/auth/verify-email`
**Auth:** Public

**Request Body**
```json
{ "email": "chef@example.com", "otp": "123456" }
```

**Response `200`**
```json
{ "success": true, "message": "Email verified successfully", "data": null }
```

**Errors**
| Status | Code |
|---|---|
| 404 | `AUTH_ACCOUNT_NOT_FOUND` |
| 400 | `AUTH_EMAIL_ALREADY_VERIFIED` / `AUTH_OTP_INVALID` / `AUTH_OTP_EXPIRED` |

---

### 4. Resend Verification OTP  🆕
**US-04 Scenario 3, 4** — Rate limit: **3 ដង/10 នាទី ក្នុងមួយគណនី** + 10 ដង/15 នាទី ក្នុងមួយ IP

`POST /api/v1/auth/resend-otp`
**Auth:** Public

**Request Body**
```json
{ "email": "chef@example.com" }
```

**Response `200`**
```json
{ "success": true, "message": "A new verification code has been sent to your email", "data": null }
```

**Errors**
| Status | Code | Params |
|---|---|---|
| 404 | `AUTH_ACCOUNT_NOT_FOUND` | — |
| 400 | `AUTH_EMAIL_ALREADY_VERIFIED` | — |
| 403 | `AUTH_OTP_RESEND_LIMITED` | `minutes` |
| 429 | `AUTH_RESEND_RATE_LIMITED` | `minutes` |

---

### 5. Login (Email & Password)
**US-05** — Rate limit: **10 ដង/15 នាទី ក្នុងមួយ IP** (បន្ថែមលើ Account Lockout)

`POST /api/v1/auth/login`
**Auth:** Public

**Request Body**
```json
{ "email": "chef@example.com", "password": "StrongPass123" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_access_token",
    "chef": {
      "id": "uuid",
      "email": "chef@example.com",
      "displayName": "Sok Dara",
      "avatarUrl": "https://...",
      "language": "km"
    }
  }
}
```
> Sets `refreshToken` httpOnly cookie. **ទាមទារ Email Verified សិន** (`AUTH_EMAIL_NOT_VERIFIED` បើមិនទាន់)។

**Errors**
| Status | Code | Params |
|---|---|---|
| 401 | `AUTH_INVALID_CREDENTIALS` | — |
| 403 | `AUTH_ACCOUNT_LOCKED` | `minutes` |
| 403 | `AUTH_TOO_MANY_ATTEMPTS` | `minutes` |
| 403 | `AUTH_EMAIL_NOT_VERIFIED` | — |
| 429 | `AUTH_LOGIN_RATE_LIMITED` | `minutes` |

---

### 6. Forgot Password (Request OTP)
**US-06**

`POST /api/v1/auth/forgot-password`
**Auth:** Public

**Request Body**
```json
{ "email": "chef@example.com" }
```

**Response `200`** (ដូចគ្នាមិនថាអ៊ីមែលមានឬអត់ — ការពារ Email Enumeration)
```json
{ "success": true, "message": "If this email is registered, a reset code has been sent", "data": null }
```

---

### 7. Reset Password (with OTP)
**US-06**

`POST /api/v1/auth/reset-password`
**Auth:** Public

**Request Body**
```json
{ "email": "chef@example.com", "otp": "123456", "newPassword": "NewStrongPass456" }
```

**Response `200`**
```json
{ "success": true, "message": "Password has been reset successfully", "data": null }
```
> **Session ចាស់ទាំងអស់ត្រូវបាន Invalidate** (Refresh Token គ្រប់ឧបករណ៍ត្រូវលុប — ចាំបាច់ Login ចូលឡើងវិញនៅគ្រប់ទីកន្លែង)។

**Errors**
| Status | Code |
|---|---|
| 400 | `AUTH_OTP_INVALID` / `AUTH_OTP_EXPIRED` |

---

### 8. Refresh Access Token
`POST /api/v1/auth/refresh-token`
**Auth:** Public (httpOnly `refreshToken` cookie)

**Response `200`**
```json
{ "success": true, "message": "Token refreshed", "data": { "accessToken": "new_jwt_access_token" } }
```

**Errors**
| Status | Code |
|---|---|
| 401 | `AUTH_REFRESH_TOKEN_MISSING` / `AUTH_REFRESH_TOKEN_INVALID` |

---

### 9. Logout
**US-09**

`POST /api/v1/auth/logout`
**Auth:** Public (clears cookie if present)

**Response `200`**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### 10. Get Current Profile
`GET /api/v1/auth/me`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "chef@example.com",
    "displayName": "Sok Dara",
    "avatarUrl": "https://...",
    "language": "km",
    "isEmailVerified": true,
    "authProvider": "LOCAL",
    "hasCompletedOnboarding": false,
    "createdAt": "2026-09-27T00:00:00.000Z"
  }
}
```

**Errors**
| Status | Code |
|---|---|
| 401 | `AUTH_ACCESS_TOKEN_MISSING` / `_EXPIRED` / `_INVALID` |

---

### 11. Update Own Profile
**US-07** — ⚠️ **ផ្លាស់ប្តូរ៖ លែងទទួល `avatarUrl` ទៀត** (ប្រើ Endpoint 12 ជំនួស)

`PATCH /api/v1/auth/profile`
**Auth:** Bearer Token

**Request Body**
```json
{ "displayName": "Sok Dara Chef", "language": "en" }
```
> Field ណាដែលផ្ញើមកលើសពីនេះ (ឧ. `avatarUrl`) នឹងត្រូវបានមិនអើពើដោយស្ងៀម មិនមែន Error ទេ។

**Response `200`**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid", "email": "chef@example.com",
    "displayName": "Sok Dara Chef", "avatarUrl": "https://...", "language": "en"
  }
}
```

---

### 12. Upload / Replace Avatar  🆕
**US-07 Scenario 1, 2**

`POST /api/v1/auth/avatar`
**Auth:** Bearer Token
**Content-Type:** `multipart/form-data`

**Request Body** — Field `avatar` (File តែមួយ, ≤ 5MB, ប្រភេទ `jpg`/`png`/`webp` ប៉ុណ្ណោះ)

**Response `200`**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": { "avatarUrl": "https://res.cloudinary.com/.../chef-saas/avatars/<chefId>.jpg" }
}
```

**Errors**
| Status | Code |
|---|---|
| 400 | `AVATAR_FILE_REQUIRED` |
| 400 | `AVATAR_TOO_LARGE` (> 5MB) |
| 400 | `AVATAR_INVALID_TYPE` (មិនមែន jpg/png/webp) |
| 400 | `AVATAR_UPLOAD_ERROR` |

---

### 13. Change Password
**US-08**

`PATCH /api/v1/auth/change-password`
**Auth:** Bearer Token

**Request Body**
```json
{ "currentPassword": "StrongPass123", "newPassword": "NewStrongPass456" }
```
> `currentPassword` Optional សម្រាប់តែគណនី Google-only ដែលកំណត់លេខសម្ងាត់ជាលើកដំបូង

**Response `200`**
```json
{ "success": true, "message": "Password updated successfully", "data": null }
```

**Errors**
| Status | Code |
|---|---|
| 400 | `AUTH_CURRENT_PASSWORD_REQUIRED` |
| 401 | `AUTH_CURRENT_PASSWORD_INCORRECT` |

---

## Summary Table

| # | Method | Endpoint | Auth | User Story | Rate Limit |
|---|--------|----------|------|------------|------------|
| 1 | POST | `/auth/register` | Public | US-02 | 5/hr per IP |
| 2 | POST | `/auth/google` | Public | US-03 | — |
| 3 | POST | `/auth/verify-email` | Public | US-04 | — |
| 4 🆕 | POST | `/auth/resend-otp` | Public | US-04 | 3/10min per account + 10/15min per IP |
| 5 | POST | `/auth/login` | Public | US-05 | 10/15min per IP + account lockout |
| 6 | POST | `/auth/forgot-password` | Public | US-06 | — |
| 7 | POST | `/auth/reset-password` | Public | US-06 | — |
| 8 | POST | `/auth/refresh-token` | Public (cookie) | — | — |
| 9 | POST | `/auth/logout` | Public | US-09 | — |
| 10 | GET | `/auth/me` | Bearer | — | — |
| 11 | PATCH | `/auth/profile` | Bearer | US-07 | — |
| 12 🆕 | POST | `/auth/avatar` | Bearer | US-07 | — |
| 13 | PATCH | `/auth/change-password` | Bearer | US-08 | — |

---

## Error Code Reference (Epic 2)

| Code | Status | Params |
|---|---|---|
| `AUTH_ACCESS_TOKEN_MISSING` / `_INVALID` | 401 | — |
| `AUTH_ACCESS_TOKEN_EXPIRED` | 401 | — (→ call `/auth/refresh-token`) |
| `AUTH_REFRESH_TOKEN_MISSING` / `_INVALID` | 401 | — (→ back to Login) |
| `AUTH_EMAIL_EXISTS` | 409 | — |
| `AUTH_GOOGLE_TOKEN_INVALID` | 401 | — |
| `AUTH_ACCOUNT_NOT_FOUND` | 404 | — |
| `AUTH_EMAIL_ALREADY_VERIFIED` | 400 | — |
| `AUTH_OTP_INVALID` / `AUTH_OTP_EXPIRED` | 400 | — |
| `AUTH_OTP_RESEND_LIMITED` 🆕 | 403 | `minutes` |
| `AUTH_INVALID_CREDENTIALS` | 401 | — |
| `AUTH_ACCOUNT_LOCKED` | 403 | `minutes` |
| `AUTH_TOO_MANY_ATTEMPTS` | 403 | `minutes` |
| `AUTH_EMAIL_NOT_VERIFIED` 🆕 | 403 | — |
| `AUTH_CURRENT_PASSWORD_REQUIRED` / `_INCORRECT` | 400/401 | — |
| `AUTH_REGISTER_RATE_LIMITED` 🆕 | 429 | `minutes` |
| `AUTH_LOGIN_RATE_LIMITED` 🆕 | 429 | `minutes` |
| `AUTH_RESEND_RATE_LIMITED` 🆕 | 429 | `minutes` |
| `AVATAR_FILE_REQUIRED` 🆕 | 400 | — |
| `AVATAR_TOO_LARGE` 🆕 | 400 | — |
| `AVATAR_INVALID_TYPE` 🆕 | 400 | — |
| `AVATAR_UPLOAD_ERROR` 🆕 | 400 | — |