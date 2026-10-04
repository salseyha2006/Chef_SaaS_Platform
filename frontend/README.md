# Chef SaaS — Frontend (React + Vite + Tailwind v3)

Mobile-first web app។ ស្ថានភាព: **Epic 1, 2, 3** (Localization, Auth/Profile, Onboarding)។

## តម្រូវការ
- **Node.js 20.19+ ឬ 22.12+** (ពិនិត្យ: `node -v`)

## ដំឡើង និងរត់
```powershell
npm install
npm run dev
```
បើក http://localhost:5173 (F12 → Ctrl+Shift+M ដើម្បីមើលជា Mobile)

> ⚠️ កុំរត់ `npm audit fix --force` (វានឹងប្តូរ Tailwind ទៅ v4 ហើយ Style ខូច)។ Tailwind ត្រូវនៅ **3.4.17**។
> ក្រោយកែ `.env` ត្រូវ Restart `npm run dev`។

## `.env`
| Key | តម្លៃ |
|---|---|
| `VITE_USE_MOCK` | `true` = ប្រើ Mock (មិនត្រូវការ Backend) · `false` = ភ្ជាប់ Backend ពិត |
| `VITE_API_BASE_URL` | ត្រូវបញ្ចប់ដោយ `/api/v1` ឧ. `http://localhost:3000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | ទុកទទេក្នុង Mock |

Backend ពិត: ត្រូវបើក CORS `origin: http://localhost:5173` + `credentials: true` (សម្រាប់ Cookie `refreshToken`)។

## Mock Accounts
| Email | លទ្ធផល |
|---|---|
| `demo@chef.com` / `Password123` | Login ជោគជ័យ (វាយខុស 5 ដង → Lockout 15 នាទី) |
| `unverified@chef.com` | នាំទៅ `/verify-email` |
| OTP `123456` | ត្រឹមត្រូវ · `000000` ផុតកំណត់ · ផ្សេងទៀតខុស |
| ប៊ូតុង Google | ចូលភ្លាម (Google-only → សាកល្បង "កំណត់លេខសម្ងាត់") |

សាកល្បង Onboarding ម្តងទៀត: DevTools → Application → Local Storage → លុប `mock.onboarded`។

## រចនាសម្ព័ន្ធ
```
src/
  i18n/          index.js + locales/{km,en}/*.json (namespace តាម Module)
  services/      api.js (token memory, refresh, ApiError) · *Service.js · mock/
  context/       AuthContext.jsx
  routes/        guards.jsx (Protected / PublicOnly / OnboardingGate)
  hooks/         useLanguage · useCountdown · useSwipe
  components/    AuthLayout · PageHeader · LanguageSwitch · GoogleButton · OnboardingSlide
  components/ui/ PrimaryButton · AuthInput · OTPInput · Avatar · ConfirmModal · Toast · ...
  pages/         Login · Register · VerifyEmail · Forgot/ResetPassword · Profile · EditProfile · ChangePassword · Onboarding
  config/        onboardingSteps.js
docs/ai/         4_FRONTEND_PROGRESS.md
```

## Checklist Test (Mock)
ឃើញ `docs/ai/4_FRONTEND_PROGRESS.md` ផ្នែក "Test Checklist"។
