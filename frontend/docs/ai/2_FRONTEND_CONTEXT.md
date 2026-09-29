# FRONTEND_CONTEXT.md — Chef SaaS Platform (Frontend)

## 0. ឯករាជ្យពី Backend
- Frontend មិនអាន Code Backend ទេ។ ប្រើតែឯកសារក្នុង frontend/docs/ai/ ប៉ុណ្ណោះ
- API Contract (Snapshot): frontend/docs/ai/3_API_CONTRACT.md — ប្រភពតែមួយរបស់ Frontend
- User Story: frontend/docs/ai/user_story/<Epic>.md (Story ដែលពាក់ព័ន្ធ)
- ធ្វើការជាមួយ Mock បាន: VITE_USE_MOCK=true; Mock ត្រូវរូបរាងដូច Contract ១០០%
- បើ Contract មិនគ្រប់គ្រាន់សម្រាប់ Story → កត់ជា Backend Gap ក្នុង 2_FRONTEND_PROGRESS.md កុំស្មាន
- Snapshot ចាស់ជាងកំណែ Backend → ត្រូវ Sync មុនភ្ជាប់ API ពិត

## 1. Stack
React + Vite + Tailwind CSS · Backend: docs/ai/3_API_CONTRACT.md (Base `{API}/api/v1`)
`VITE_API_BASE_URL` ត្រូវបញ្ចប់ដោយ `/api/v1`

## 2. Architecture (LOCKED)
Page → src/services/<entity>Service.js → src/services/api.js
Adapter: src/utils/format.js (Backend shape → UI shape)
- Page មិនហៅ fetch ផ្ទាល់ ហៅតែ service
- mock*.js ទុកជា static config/backup មិនលុប
- Service គំរូ (ចម្លង Pattern): src/services/ingredientService.js

## 3. api.js ត្រូវធ្វើតាមច្បាប់ទាំងនេះ
1. Header `Authorization: Bearer <accessToken>`; `credentials: 'include'` (សម្រាប់ cookie refreshToken)
2. Access token រក្សាក្នុង memory (state/module variable) មិនដាក់ localStorage
3. Response ជោគជ័យ: return `json.data` (unwrap envelope)
4. Response បរាជ័យ: throw `{ status, code, message, params, errors }` (តាម ApiError)
5. 401 `AUTH_ACCESS_TOKEN_EXPIRED` → POST /auth/refresh-token ម្តង → retry request ដើម; បើបរាជ័យ → logout ទៅ Login
6. 403 `SUBSCRIPTION_EXPIRED|SUBSCRIPTION_NOT_FOUND` → បង្ហាញ Upgrade prompt (GET ដំណើរការធម្មតា)
7. Binary (PDF/Excel/invoice): helper `downloadBlob(path, filename)` មិន unwrap JSON
8. មិនមាន Accept-Language: Backend មិនអាន

## 4. Error & i18n
- បកប្រែតាម `code` (+ `params`) ដោយប្រើ key `errors.<CODE>`; ប្រើ `message` (EN) ជា fallback
- `VALIDATION_FAILED` → map `errors[].field` ទៅ Input នីមួយៗ, បកប្រែតាម `errors[].code`
- ភាសា km/en តាម `chef.language` (`PATCH /auth/profile`)

## 5. Quirk របស់ Contract ដែល Adapter ត្រូវដោះស្រាយ
- `GET /ingredients/my-stock` ឱ្យ `category` ជា string; `POST /ingredients` ឱ្យ `categoryId` → adapter បម្លែងឱ្យដូចគ្នា
- Dish list = raw Prisma; Dish detail = DTO (`costBreakdown`) → ប្រើ adapter ពីរ
- Archive: Unit/Category/Ingredient `isActive` (គ្មាន ?archived); Dish/MenuSet `isArchived` (?archived=true)
- Event param `:id` vs `:eventId` (មិនប៉ះពាល់ URL ភាគច្រើន)
- `STOCK_INGREDIENT_NOT_FOUND` អាច 404 ឬ 400; ពិនិត្យតែ `code` មិនមែន status
- Delete Dish/MenuSet ជាប់ FK ផ្សេង → 400 `INVALID_REFERENCE` (ប្រាប់ User "កំពុងប្រើ")
- គ្មាន Pagination ក្នុង List

## 6. Backend Gap (ប្រាប់ ចុះឈ្មោះក្នុង 6_FRONTEND_PROGRESS.md កុំបង្កើតដោយស្មាន)
- Field UI ដែល Backend មិនមាន (ឧ. ចំណាំ Ingredient, cookTime, chefNote): ចុះបញ្ជី ហើយសម្រេចជាមុន
- Endpoint មិនមាន: notifications, import-template, admin Plan/Refund, webhook payment

## 7. ច្បាប់សម្រាប់ AI
1. User Story ជា Source of truth; Contract ជាស្ពាន។ មិនប្រាកដ → សួរ
2. អានឯកសារដែលបិទភ្ជាប់មុនសរសេរ Code; ប្រើឈ្មោះ prop/field ពិត
3. ធ្វើម្តង ១ Story/Page; កុំលុប mock/Component ចាស់
4. ផ្តល់ Code ពេញលេញក្នុង Code block ម្តងមួយឯកសារ (ដាក់ path) សម្រាប់ Copy
5. កុំដំឡើង Library ថ្មី លើកលែងសួរមុន
6. បើត្រូវការ Backend ថ្មី → ប្រាប់ជា Backend Gap (schema diff + migration + controller ទាំងអស់)
7. ចុងបញ្ចប់ត្រូវ Update 6_FRONTEND_PROGRESS.md