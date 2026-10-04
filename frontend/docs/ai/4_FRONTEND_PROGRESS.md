# FRONTEND PROGRESS
Legend: ⬜ មិនទាន់ · 🟡 Code ចប់ រង់ចាំ Test · ✅ Test ជាប់

## Epic 1 — Localization
- 🟡 US-01 Switch Language km/en (i18n namespaces, safeStorage fallback, Sync Profile)

## Epic 2 — Auth & Profile
- ✅ 2A Login + Lockout countdown + Google + Logout (multi-tab) — Test ជាប់ (UI Professional SaaS)
- 🟡 2B US-02 Register · US-04 Verify OTP (Resend 60s)
- 🟡 2C US-06 Forgot / Reset Password
- 🟡 2D US-07 Edit Profile + Avatar · US-08 Change/Set Password

## Epic 3 — Onboarding
- 🟡 US-10 Wizard 3 ជំហាន (Skip/Finish/Replay/Gate)
- ➖ US-11 Seed Presets — Backend ប៉ុណ្ណោះ (គ្មាន UI)

## Epic 4-12: ⬜

## Test Checklist (VITE_USE_MOCK=true)
1. `/` ពេលមិនទាន់ Login → Redirect `/login`
2. Login ទទេ / `abc@` → Error inline · ខុស 5 ដង → Countdown 15:00
3. ខ្មែរ ⇄ EN ប្តូរភ្លាម, Refresh នៅដដែល
4. Register: Terms មិនធីក → ប៊ូតុង Disabled · Email `demo@chef.com` → Banner "ប្រើរួចហើយ"
5. Register Email ថ្មី → `/verify-email` · OTP `111111` shake · `000000` ផុតកំណត់ · `123456` ជោគជ័យ → `/login` Banner បៃតង
6. Paste 6 ខ្ទង់ក្នុង OTP → បំពេញគ្រប់ប្រអប់
7. Forgot → Reset (OTP `123456` + លេខសម្ងាត់ថ្មី) → `/login` Banner បៃតង
8. Login ដំបូង → Wizard · ចប់/Skip → Home · Login ម្តងទៀតគ្មាន Wizard
9. Profile → កែឈ្មោះ/Avatar (JPG/PNG/WebP ≤5MB) → Toast · Back ពេលមានការកែ → Modal
10. Change Password (លេខចាស់ `Password123`) · Google user → "កំណត់លេខសម្ងាត់" គ្មាន Field លេខចាស់
11. Profile → "របៀបប្រើប្រាស់" → Wizard ឡើងវិញ → ចប់ត្រឡប់ Profile
12. Logout → Modal → `/login` · Back មិនចូលវិញ · 2 Tab: Logout មួយ → ម្ខាងទៀតចេញដែរ

## Backend Gaps
1. Category គ្មាន Sub-category (`parentId`) — UX Epic 7/8/11 ត្រូវការ 2-level
2. Dish គ្មាន Category (មានតែ `tags[]`)
3. Duplicate/Clone suffix "(Copy)" ≠ UX "(ចម្លង)"
4. Event គ្មាន Archive/Delete endpoint
5. Payment: មានតែ ABA PayWay (mock)
6. គ្មាន Refund approve / Notification / Admin / Webhook
7. `AUTH_ACCOUNT_LOCKED` ផ្តល់តែ `params.minutes` → Countdown មិនសុក្រឹត (ស្នើ `lockedUntil`)
8. `/auth/login` គ្មាន `hasCompletedOnboarding`, `authProvider` → Frontend ហៅ `/auth/me`
9. `/auth/verify-email` គ្មាន Token → Login ម្តងទៀតក្រោយ Verify
10. គ្មានទំព័រ/Endpoint Terms
11. គ្មាន OTP expiry time ពី Backend
12. គ្មាន Endpoint ផ្ទៀងផ្ទាត់ OTP តែឯង (Reset ផ្ញើ OTP + លេខសម្ងាត់ជាមួយគ្នា)
13. `/auth/forgot-password` គ្មាន Limiter ក្រៅពី Global
14. Google "Set Password" ប្រើ change-password គ្មាន currentPassword — រង់ចាំ Backend បញ្ជាក់ (មាន Fallback)
15. `PATCH /auth/profile` មិនទទួល `avatarUrl` → Upload ដាច់ដោយឡែក
16. គ្មាន Endpoint លុប Avatar
17. ក្រោយ Set Password `authProvider` នៅ `google` ឬអត់? មិនច្បាស់
18. US-11 (Auto-seed, Copy-on-write) ≠ Contract (Presets ជា Opt-in `import`) — សម្រេចមុន Epic 7-8
19. Wizard Content កែពី Server មិនបាន (រក្សាក្នុង Frontend Config)
20. គ្មាន Endpoint ពិនិត្យស្ថានភាព Seed (UX: Retry ស្វ័យប្រវត្តិ)

## សំណួរ/ការសម្រេចចិត្តដែលនៅបើក
- Epic 4-6: UI បង្ហាញ Visa/Wing (សារ "មិនទាន់គាំទ្រ") ឬតែ ABA PayWay?
