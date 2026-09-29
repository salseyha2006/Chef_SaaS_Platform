# Chef SaaS Platform — API Documentation

## Epic 3: Onboarding & Data Setup

Base URL: `/api/v1/onboarding`

---

### 1. Complete Onboarding Wizard
**US-10**

`PATCH /api/v1/onboarding/complete`
**Auth:** Bearer Token

**Description:** Called by the Frontend when the chef finishes the first-time Onboarding Wizard, so the flag persists and the wizard won't show again on next login.

**Request Body:** _none_

**Response `200`**
```json
{
  "success": true,
  "message": "Onboarding marked as completed",
  "data": {
    "hasCompletedOnboarding": true
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 401 | Access token is missing / Invalid or expired access token |

---

> **ចំណាំ (US-11 — Seed Standard Presets):** មិនមាន Endpoint សម្រាប់ Epic 3 ទេ ព្រោះ Unit / Category / Ingredient ស្តង់ដារត្រូវបានបញ្ចូលដោយ `prisma/seed.js` ដោយផ្ទាល់ទៅ Database (មិនមែនតាមរយៈ HTTP call ពី Frontend ទេ)។ API សម្រាប់ **រុករក/ជ្រើសរើស/Custom Pricing** លើ Preset ទាំងនេះ (Tree View, Prevent Duplicate, Soft-delete...) នឹងមាននៅ **Epic 7** (Unit/Category) និង **Epic 8** (Ingredient)។

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | PATCH | `/onboarding/complete` | Bearer | US-10 |

*(US-11 is a database seed step, not an API endpoint — see note above)*