# FRONTEND PROGRESS

## Legend: ⬜ មិនទាន់ · 🟡 កំពុងធ្វើ · ✅ រួច

## Epic 1 — System Foundation & Localization
- ✅ US-01 Switch Language (km/en)
  - i18n (namespaces: common, login, errors), safeStorage, LanguageSwitch
  - ⏳ ចំណែក Sync ទៅ Profile (`PATCH /auth/profile`) → ធ្វើក្នុង Epic 2
  - 🧪 QA: ពិនិត្យ Text overflow ពាក្យអង់គ្លេសវែង (ធ្វើពេលមាន Screen ពិត)

## Core
- ✅ api.js (token in memory, refresh single-flight, downloadBlob, ApiError)
- ✅ utils/errors.js (បកប្រែតាម code)

## Epic 2 — Authentication & Profile
- 🟡 2A (ធ្វើរួច ⏳ រង់ចាំ Test)
  - ✅ US-05 Login + Lockout countdown + Rate-limit banner
  - ✅ US-03 Google (GIS ID token → POST /auth/google; Mock fallback)
  - ✅ US-09 Logout (Server revoke + Client clear + multi-tab `storage` broadcast + Route Guards)
  - ✅ AuthContext, authService, mockAuth, guards, AuthInput, PrimaryButton, GoogleButton, useCountdown
  - ✅ US-01 ចំណែក Sync ភាសា (ពេល Login)
  - ⏳ ភាសា Sync ពេលប្តូរក្នុង Profile → 2D
- ⬜ 2B US-02 Register, US-04 Verify OTP (+Resend countdown)
- ⬜ 2C US-06 Forgot/Reset
- ⬜ 2D US-07 Profile/Avatar, US-08 Change/Set Password

### Mock accounts
- demo@chef.com / Password123 · វាយខុស 5 ដង → Lockout 15 នាទី
- unverified@chef.com → ទៅ /verify-email

## Backend Gaps (បន្ថែម)
7. `AUTH_ACCOUNT_LOCKED` ផ្តល់តែ `params.minutes` (មិនមានវិនាទី/`lockedUntil`) → Countdown មិនសុក្រឹត
8. Login ជោគជ័យមិនផ្តល់ `hasCompletedOnboarding` (មានតែក្នុង /auth/me) → Epic 3 ត្រូវហៅ /auth/me បន្ថែម

## Backend Gaps
1. Category មិនមាន Sub-category (`parentId`) — UX Epic 7/8/11 ត្រូវការ 2-level
2. Dish មិនមាន Category (មានតែ `tags[]`)
3. Duplicate/Clone suffix ជា "(Copy)" (UX: "(ចម្លង)")
4. Event គ្មាន Archive/Delete endpoint
5. Payment: មានតែ ABA PayWay (mock)
6. គ្មាន Refund approve/Notification/Admin/Webhook

## Decisions / Open
- ចាំបាច់ Confirm: Libraries (react-router-dom, i18next, react-i18next)

## API Status
- Contract snapshot: v1 (81 endpoints) — ⚠️ Backend កំពុងកែប្រែ
- ត្រូវ Sync ម្តងទៀតពេលអ្នកផ្ញើ Contract ថ្មី មុនភ្ជាប់ API ពិត
- ខណៈនេះ៖ ប្រើ Mock (`VITE_USE_MOCK=true`) តាមរូបរាង Contract v1

## Pending from Backend owner
- [ ] Sub-category (parentId) សម្រាប់ Categories
- [ ] Dish category
- [ ] Event archive/delete
- [ ] ផ្សេងៗ (អ្នកនឹងប្រាប់)