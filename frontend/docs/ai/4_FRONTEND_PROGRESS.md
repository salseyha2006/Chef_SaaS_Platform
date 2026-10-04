## Epic 2 — Authentication & Profile
- ✅ 2A Login/Google/Logout (Test ជាប់ + UI Professional SaaS)
- 🟡 2B (ធ្វើរួច ⏳ រង់ចាំ Test)
  - ✅ US-02 Register (inline validation, Strength indicator, Terms checkbox, Google)
  - ✅ US-04 Verify OTP (6 ប្រអប់, paste/autofill, shake error, Resend 60s + limit)
  - ✅ Components: AuthLayout, OTPInput, PasswordStrength, Checkbox
- ⬜ 2C US-06 Forgot/Reset (ប្រើ AuthLayout + OTPInput ឡើងវិញ)
- ⬜ 2D US-07 Profile/Avatar, US-08 Change/Set Password (+ Sync ភាសាទៅ Profile)

### Mock (2B)
- Register: demo@chef.com / unverified@chef.com → "អ៊ីមែលត្រូវបានប្រើរួច"
- OTP: 123456 = ត្រឹមត្រូវ · 000000 = ផុតកំណត់ · ផ្សេងទៀត = ខុស
- Resend: 3 ដង → បន្ទាប់ទៀត Limited 10 នាទី

## Backend Gaps (បន្ថែម)
9. `/auth/verify-email` ឆ្លើយ `null` គ្មាន Token → ក្រោយ Verify ត្រូវ Login ម្តងទៀត (UX Spec ចង់ auto → Onboarding)
10. គ្មានទំព័រ/Endpoint "លក្ខខណ្ឌប្រើប្រាស់" (Terms) → ទុកជា Text ជាប់
11. `/auth/register` មិនប្រាប់រយៈពេលផុតកំណត់ OTP → Frontend មិនអាចបង្ហាញ Timer ផុតកំណត់ (មានតែ Resend cooldown)

## Decisions
- Gap #8: Frontend ហៅ `/auth/me` ក្នុង Epic 3 (មិនចាំបាច់ប៉ះ Backend)