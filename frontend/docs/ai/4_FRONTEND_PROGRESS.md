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

## Epic 4 — Subscription
- 🟡 US-12 Trial Badge (Auto-start ជា Backend; UI បង្ហាញ "សល់ N ថ្ងៃ")
- 🟡 US-13 Pricing (Monthly/Yearly toggle, Recommended, Plan Card)
- 🟡 US-15 Status (Badge ខៀវ/បៃតង → លឿង ≤3 ថ្ងៃ → ក្រហម) + ទំព័រ /subscription
- 🟡 US-16 Cancel / Resume Auto-renewal
- 🟡 US-17 Graceful Lockout + View-only + Upgrade Modal (403 SUBSCRIPTION_*)
- 🟡 US-14 Subscribe (Pricing → Checkout → Success; Trial→Paid ដោយ Backend)

## Epic 5 — Payment
- 🟡 US-18 Select Payment Method (ABA PayWay + Saved methods; Visa/Wing = "ឆាប់ៗនេះ"; Validation មិនទាន់ជ្រើស)
- ➖ US-19 Auto-charge — Backend Scheduled Job (គ្មាន UI)
- 🟡 US-20 Retry (Overlay: Retry / ប្តូរ Method → /subscription/payments/:id/retry) · Retry ពី Billing → Epic 6
- 🟡 US-21 Confirmation Screen (Email = Backend; Download Invoice → Epic 6)

## Epic 6 — Billing
- 🟡 US-22 Billing History (ក្រុមតាមខែ, Filter Client-side, ផ្ទុកបន្ថែម 20/ដង, Empty State)
- 🟡 US-23 Transaction Detail + Download Invoice (Share Sheet លើ Mobile; Success ប៉ុណ្ណោះ)
- 🟡 US-24 Billing Info (Validation, Discard Modal; Prefill ពី Cache Device)
- 🟡 US-25 Refund Request (Sheet + Status ក្នុង Detail) · Admin Approve/Reject = Backend/Admin
- 🟡 US-20 S2 Retry ពី Billing (Sheet ជ្រើស Method → /retry)

## Epic 7 — Unit & Category Configuration
- 🟡 US-29 Preset Checklist (Unit/Category): checked+disabled, Toast "កំពុងប្រើរួចហើយ", Import ពី Preset
- 🟡 US-30 Archive ("លាក់" + Confirm Modal) — ទិន្នន័យចាស់មិនប៉ះពាល់
- 🟡 US-27 បង្កើត Unit (UnitFormSheet): Rate ចាំបាច់ > 0 · Cancel
- 🟡 US-26 S2/S3 Sheet Inline បង្កើតថ្មី — ✅ Component · ⬜ ភ្ជាប់ Combobox ក្នុង Form គ្រឿងផ្សំ (Epic 8)
- 🟡 US-28 CategoryFormSheet — ✅ Component · ⬜ Auto-assign + Combobox (Epic 8)

## Epic 8 — Ingredient Management
- 🟡 US-31 Browse Tree · 🟡 US-32 Checked+Disabled · 🟡 US-33 Set Price/Unit (Tree 3 កម្រិត UI រួច; Adapter 2 កម្រិត — Gap #48)
- 🟡 US-34 Stock List (Search, Sort ៣, NestedFilterChips, Empty+CTA); កែតម្លៃក្នុង Detail (មិនមែន List); "Last Updated" មិនអាច (Gap #54)
- 🟡 US-35 Archive (Confirm; Undo មិនអាច — Gap #56)
- 🟡 US-36 Delete (Modal ក្រហម, 409 INGREDIENT_IN_USE → Warning + "លាក់ជំនួស")
- ⬜ US-26/28 Combobox ពេញលេញ (បច្ចុប្បន្ន <select> + Option បង្កើតថ្មី)

## Epic 9 — Dish & Recipe (User Story: US-37..44.1)
- ✅ 9A US-43 S2 Filter តាម Tag (Chip ពី Dish ទាំងអស់, Client-side) · US-44 Toggle List/Grid + ចងចាំ View (localStorage `chef.dishView`)
- ✅ 9B US-37 Create (Live Cost ប៉ាន់ស្មាន, Validation ≥1 គ្រឿងផ្សំ / បរិមាណ > 0) · US-39 Edit (Replace-all, Cancel → Modal) · US-43 S1/S3 Tag (string សេរី) · Picker ពី Stock
- ✅ 9C US-38 Detail + Cost Breakdown (% ពី Server, Highlight ខ្ពស់បំផុត) · US-40 Duplicate · US-41 Archive/Delete (409 DISH_IN_USE → "លាក់ជំនួស") · Tab សកម្ម/បានលាក់ · ⬜ Restore (Gap #63) · ⬜ Badge "Archived" លើគ្រឿងផ្សំ (Gap #71)
- ✅ 9D US-42 Dynamic Costing: ទាញថ្មីរាល់ពេលចូល + Toast ក្រោយកែតម្លៃស្តុក (គ្មានលេខ N — Gap #75)
- ⏸️ 9E US-44.1 Fixed Dish (`calculationType`) — ពន្យារពេល រង់ចាំ Backend (មើល `7_PENDING_BACKEND_9E.md`)
- Route: `/dishes` · `/dishes/new` · `/dishes/:id` (Detail) · `/dishes/:id/edit`

## Epic 10 — Menu Set (User Story: US-45..49)
- ✅ 10A បញ្ជី (Tab សកម្ម/លាក់) · Detail · Archive · Delete
- ✅ 10B US-45 Create (Validation ឈ្មោះ + ≥1 Dish, ការពារស្ទួន) · US-47 S1 Edit (Replace-all) · US-48 S3 Tap-to-add/✕ (Tab-switch តាម UX) · US-49 Sticky Total + Pulse (Client Σ)
- ⚠️ US-48 S1/S2 Drag: ប្រើប៊ូតុង ▲▼ ជំនួស (មិនដំឡើង Library — Gap #85) · ⬜ US-47 S2 Snapshot (Backend — Gap #84) · US-46 S2 ពឹង Backend Recalc (Gap #83)
- Route: `/menu-sets` · `/new` · `/:id` · `/:id/edit` (មិនមែន Tab ក្នុង Bottom Nav — ចូលតាម Dashboard)

## Epic 11 — Event, Cost, Dashboard, Vendor, Report (User Story: US-50..59)
- ✅ 11A US-50 បញ្ជី Event (Tab កំពុងមក/កន្លងទៅ/ទាំងអស់) · Create · Edit
- ✅ 11B Event Detail (3 Tab) · US-52 បន្ថែម/ដក Dish & Menu Set (ការពារស្ទួនតែ Direct — Gap #94) · US-51 Clone (Sheet ឈ្មោះ + កាលបរិច្ឆេទថ្មី)
- ✅ 11C US-53 Cost Calculation (Group តាម Category ១ Level; ទាញ my-stock ផ្គូផ្គងតាម id) · ⬜ Sub-Category (Gap #1)
- ✅ 11D US-54 Dashboard (Event ខែនេះ គណនា Client — Gap #103) · ✅ 11D-2 BottomNavBar (5 Tab) លើ ៥ ទំព័រ Root (`MainTabsLayout`, `--bottom-nav-h`)
- ✅ 11E US-55/56 Vendor Presets (Template Manager + Filter Client-side)
- ✅ 11F-1 US-57 Quick Edit (Local State) + US-58 S1/S2 Preview A4 + PDF (ឈ្មោះ+បរិមាណ គ្មានតម្លៃ) · ⬜ US-58 S3 Telegram (Gap #116)
- ✅ 11F-2 US-59 S1 Export Excel (Event តែមួយ) + S3 គ្មានទិន្នន័យ · ⬜ S2 ប្រចាំខែ + CSV (Gap #124/#125)
- Route: `/events` · `/new` · `/:id` · `/:id/edit` · `/:id/report?template=` · `/:id/checklist`

## Epic 12 — Procurement (User Story: US-60)
- ✅ 12A US-60 Checklist: S1 គ្រីស → ឆូត/ព្រាល + រុញទៅក្រោមក្នុងក្រុម · S2 Undo · S3 Progress M/N + % (Frontend) · S4 ១០០% Toast + កាតបៃតង · S5 Persisted (Backend) · Optimistic + Rollback · Filter ទាំងអស់/មិនទាន់ទិញ

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
13. `trial` → Home/Profile Badge ខៀវ "សល់ 12 ថ្ងៃទៀត" · `trial-soon` → លឿង "សល់ 2 ថ្ងៃ" · ប៉ះ → /pricing
14. Pricing: Toggle ខែ/ឆ្នាំ ប្តូរតម្លៃភ្លាម · Pro មាន Badge "ណែនាំ" · ប៊ូតុងនៅក្នុង Card · ជ្រើស → /checkout/:id
15. `active` → Badge បៃតង "ផុតកំណត់ថ្ងៃទី..." → /subscription → Pricing: Pro (ខែ) ប៊ូតុង Disabled "កញ្ចប់បច្ចុប្បន្ន"
16. /subscription (active) → "លុបចោលការបន្ត" → Modal → Toast → Badge "កំពុងប្រើប្រាស់ដល់ ..., មិនបន្តទៀត" → "បន្តការបន្ត" ត្រឡប់វិញ
17. `expired` → ចូល `/` ត្រូវទៅ /subscription-expired · "មើលទិន្នន័យ" → Home (Badge ក្រហម) · "ចាកចេញ" ដំណើរការ · Profile ចូលបាន
18. `none` → ដូច 17 · ប្តូរភាសា → អក្សរ/ថ្ងៃខែប្តូរតាម
19. Upgrade Modal: Console → `window.dispatchEvent(new CustomEvent('subscription:required'))` → Modal ចេញ (ប្រើជាក់ស្តែងពេលមាន Action សរសេរ Epic 7+)
20. /pricing → ជ្រើសកញ្ចប់ → /checkout/:id បង្ហាញសង្ខេប + ABA (ជ្រើសស្រាប់ពី Saved) · Visa/Wing Disabled "ឆាប់ៗនេះ"
21. `mock.saved=none` → ចុច "បង់ប្រាក់" ដោយមិនជ្រើស → Error "សូមជ្រើសរើស..." មិនបន្ត
22. ជ្រើស ABA → Overlay Spinner ~2s · ចុច Back/Refresh មិនចេញ · ជោគជ័យ → /payment/success → "ទៅកាន់ទំព័រដើម" Badge បៃតង (mock.sub=active)
23. `mock.pay=fail` → Overlay ❌ "កាតត្រូវបានបដិសេធ" · "ព្យាយាមម្តងទៀត" → ❌ "សមតុល្យមិនគ្រប់គ្រាន់"
24. `mock.pay=fail-then-success` → បរាជ័យ → "ព្យាយាមម្តងទៀត" → ជោគជ័យ
25. បរាជ័យ → "ប្តូរមធ្យោបាយបង់ប្រាក់ផ្សេង" → ត្រឡប់ទំព័រជ្រើស (Overlay បាត់)
26. Expired (mock.sub=expired) → ទិញជោគជ័យ → Home ចូលបាន (មិន Lock)
27. /payment/success Refresh → ទៅ /subscription
28. Profile → "ប្រវត្តិការទូទាត់" → បញ្ជីក្រុមតាមខែ · 20 ជួរដំបូង + "ផ្ទុកបន្ថែម" (35 ជួរ) · Filter ជោគជ័យ/បរាជ័យ/បានសងវិញ · `mock.tx=empty` → Empty State + "ជ្រើសរើសកញ្ចប់"
29. ចុច tx-a (ជោគជ័យ) → Detail មាន Plan/វិធីបង់/ID/ម៉ោង/លេខវិក្កយបត្រ · "ទាញយកវិក្កយបត្រ" → PDF ទាញយក (Desktop) / Share Sheet (Mobile) + Toast
30. tx-mock-1 (បរាជ័យ) → គ្មានប៊ូតុង Download · "ព្យាយាមបង់ម្តងទៀត" → Sheet → ABA → Overlay → ជោគជ័យ → Toast, Status ប្តូរជោគជ័យ, Badge Subscription = Active · `mock.pay=fail` → ❌ "សមតុល្យមិនគ្រប់គ្រាន់" → "ប្តូរមធ្យោបាយ" ត្រឡប់ Sheet
31. tx-a → "ស្នើសុំ Refund": ទទេ/<5 តួ → Error · ត្រឹមត្រូវ → Toast + Badge "កំពុងពិនិត្យ Refund" + លីងស្នើបាត់
32. tx-b (40 ថ្ងៃ) → ស្នើ Refund → Error REFUND_NOT_ALLOWED ក្នុង Sheet (Sheet នៅបើក)
33. tx-d → បង្ហាញ "កំពុងពិនិត្យ Refund" + មូលហេតុ · tx-c → Status "បានសងវិញ" ចំនួនទឹកប្រាក់ Strikethrough
34. /billing/info: ទទេ → Error ទាំងឈ្មោះ និងអាសយដ្ឋាន · Phone `123` → Error · Save → Toast + ប៊ូតុង Disabled · កែ → Back → Modal · Refresh → Prefill
35. Checkout បរាជ័យ (mock.pay=fail) → /billing ឃើញជួរ "បរាជ័យ" ថ្មីលើគេ
36. Expired (mock.sub=expired) → /billing, Detail, Retry នៅចូលបាន
37. Profile → "ខ្នាត និងប្រភេទ" → /settings/catalog Tab ខ្នាត: 6 Preset · Refresh នៅ Tab ដដែល (?tab=)
38. ធីក "គីឡូក្រាម" → Spinner → ជួរ checked+disabled + ប៊ូតុង "លាក់" + Toast · ចុចជួរ checked → Toast "កំពុងប្រើប្រាស់រួចហើយ"
39. "លាក់" → Modal → បញ្ជាក់ → ជួរត្រឡប់ unchecked · ធីកម្តងទៀតបាន (mock ស្រាប់) · `mock.restore=conflict` → Error "ត្រូវបានបន្ថែមរួចហើយ"
40. FAB (+) → Sheet: Rate ទទេ → Error "ចាំបាច់" · `0`/`-1` → Error "ធំជាង 0" · Hint "1 កញ្ចប់ = 0.5 kg" Live
41. បង្កើត "កញ្ចប់" Rate 0.5 → Sheet បិទ + Toast + ក្នុងផ្នែក "ដែលខ្ញុំបង្កើត" · ឈ្មោះដដែលម្តងទៀត → Error ក្រោម Field ឈ្មោះ
42. Cancel ក្នុង Sheet → មិនបង្កើតអ្វី (US-26 S3)
43. Tab ប្រភេទ: Import/Archive/បង្កើតថ្មី ដូចខាងលើ (គ្មាន Field Rate)
44. `mock.sub=expired` + "មើលទិន្នន័យ" → ចូលទំព័របាន · Action សរសេរ (ជាក់ស្តែងនឹង 403 → Upgrade Modal)
45. Profile → "បន្ថែមគ្រឿងផ្សំ…" → Tree 4 ក្រុម (បិទ) · "អំបិល" ក្នុង "គ្រឿងទេស" = checked+disabled+"មានក្នុងស្តុកហើយ" · ចុច → Toast
46. Parent "សាច់" ធីក → ទាំង 4 ជាប់ · ដក 1 → Parent Indeterminate · Footer "បានជ្រើសរើស (3)"
47. Parent "គ្រឿងទេស" (ម្រេច, ស្ករ មិនទាន់ Import) → ធីក Parent ជ្រើសតែ 2 (មិនរាប់អំបិល)
48. Search "មាន់" → ក្រុម "សាច់" បើកស្វ័យប្រវត្តិ ឃើញតែ 2 មុខ + Breadcrumb "សាច់" · Search ឈ្មោះក្រុម "បន្លែ" → បង្ហាញ Item ទាំងអស់ក្នុងក្រុម · "xyz" → "រកមិនឃើញ"
49. ជ្រើសរើស 3 → "បន្ទាប់ →" → ជួរ 3 · ខ្នាតបំពេញស្រាប់ "គីឡូក្រាម" (ត្រសក់ គ្មានខ្នាតស្រាប់)
50. Save ទទេ → Error តាមជួរ (តម្លៃ/ខ្នាត) + Scroll ទៅជួរដំបូង · តម្លៃ `0` → "ធំជាង 0" · `1.5` Blur → `1.50`
51. ខ្នាត → "＋ បង្កើតខ្នាតថ្មី" → Sheet (Rate ចាំបាច់) → ខ្នាតថ្មីត្រូវជ្រើសក្នុងជួរនោះភ្លាម
52. Save ត្រឹមត្រូវ → Toast "បាននាំចូល 3 មុខ" → ត្រឡប់ Tree · 3 មុខនោះ checked+disabled (គ្មាន Refresh)
53. ក្នុងជំហាន 2: Back ពេលបានបំពេញតម្លៃ → Modal → បោះបង់ → Tree ហើយការជ្រើសទទេ · Back ពេលមិនទាន់បំពេញ → ត្រឡប់ Tree ភ្លាម
54. Profile → "ស្តុកគ្រឿងផ្សំ" → 4 ជួរ (អំបិល, សាច់មាន់ទាំងខ្លួន, ខ្ទឹមស, សាច់ជ្រូក) · តម្លៃ "$6.50 / kg"
55. Chips: ក្រោយ Import ប្រភេទ (Epic 7) → ឃើញ Chips · ចុច "សាច់" → បង្ហាញតែ 2 មុខ · ចុច "ទាំងអស់" ត្រឡប់
56. Search "ខ្ទឹម" → 1 ជួរ · "xyz" → "រកមិនឃើញគ្រឿងផ្សំ" · Sort តម្លៃ ថ្លៃ→ថោក ប្តូរលំដាប់
57. FAB (+) → /ingredients/browse · Import ថ្មី → ត្រឡប់ស្តុក (Back) ឃើញថ្មី
58. ចុចជួរ → Detail: តម្លៃ "6.50" ខ្នាត "គីឡូក្រាម" · ប៊ូតុង Save Disabled រហូតកែ
59. កែតម្លៃ `0` → Error "ធំជាង 0" · `7` Blur → `7.00` · Save → Toast "បានរក្សាទុក" · Refresh List ឃើញតម្លៃថ្មី
60. Back ពេលកែ → Modal "បោះបង់ការផ្លាស់ប្តូរ?" · Select ខ្នាត → "＋ បង្កើតខ្នាតថ្មី" → ជ្រើសភ្លាម
61. "⋮" → Archive → Confirm → ត្រឡប់ List + Toast · ជួរបាត់ · Browse: Preset នោះ unchecked វិញ
62. "⋮" → Delete "អំបិល" (usedBy 0) → Modal ក្រហម → លុប → Toast · Browse: "អំបិល" អាចជ្រើសវិញ (US-36 S1)
63. Delete "សាច់មាន់ទាំងខ្លួន" (usedBy 2) → Modal បិទ + Warning លឿង "ប្រើក្នុង 2 មុខម្ហូប" → "លាក់ជំនួស" → Archive ជោគជ័យ
64. Empty State: Archive/Delete ទាំង 4 → "មិនទាន់មានគ្រឿងផ្សំក្នុងស្តុក" + "បន្ថែមឥឡូវនេះ" → Browse
65. `/ingredients/xyz` → "រកមិនឃើញគ្រឿងផ្សំនេះ"

### Epic 9–12 (Mock Seed: Dish d-1..d-5, MenuSet m-1..m-3, Event e-1..e-3 [Relative ទៅថ្ងៃនេះ], Template v-1/v-2)
លេខខាងក្រោមជា Test សង្ខេបតាមជំហាន (ពិនិត្យតម្លៃ Seed: ឆាក្ដៅសាច់មាន់ $10.75 · នំបញ្ចុក $2.00 · បង្អែមចេកចៀន $1.00 · សម្លម្ជូរ $5.05 · កញ្ចប់មង្គលការ $16.80 · កញ្ចប់ធម្មតា $12.75)

**Dish (9A–9D)**
66. Home→/dishes: 4 ជួរ Active · "សាឡាត់ត្រសក់" (Archived) មិនបង្ហាញ · Chip Tag: ម្ហូបសំខាន់/ស៊ុប/ម្ហូបសម្រន់/បង្អែម · Filter ដំណើរការ
67. Toggle Grid → 2 Column · Refresh → ចងចាំ Grid · `localStorage mock.dish=empty` → Empty State
68. Create: Save ទទេ → Error ឈ្មោះ + គ្រឿងផ្សំ · Picker ជ្រើស 2 → បរិមាណ `1.5` → Footer Σ Live · `0`/ទទេ → Error · Tag ថ្មី Enter → Chip · URL `abc` → Error
69. Save ត្រឹមត្រូវ → Dish Detail + Toast · Detail: Breakdown % + Highlight "ខ្ពស់បំផុត" ជួរសាច់មាន់
70. Edit (⋮→កែប្រែ): ផ្គូផ្គងគ្រឿងផ្សំ · ដក/បន្ថែម → Save ថ្លៃថ្មី · Back ពេលកែ → Modal · Archive ខ្ទឹមស ក្នុង Stock → Warning លឿង
71. Duplicate → "(Copy)" + Toast · Archive → Tab "បានលាក់" · Delete "សម្លម្ជូរ" → 409 Warning + "លាក់ជំនួស" · `mock.dishDelete=fk` → Banner
72. Stock កែតម្លៃសាច់មាន់ 6.50→8 → Toast "ថ្លៃដើមមុខម្ហូបត្រូវបានធ្វើបច្ចុប្បន្នភាព" · ឆាក្ដៅ = $13.00 (US-42)

**Menu Set (10A–10B)**
73. /menu-sets: 2 ជួរ · ថ្លៃ = Σ Dish · Detail + Archive + Delete (`mock.menuSetDelete=fk`) · Tab "បានលាក់"
74. Create: Tab-switch · "+" → "✓ បានបន្ថែម" (ការពារស្ទួន) · ▲▼✕ · Footer Pulse · Save ទទេ → Error · Edit Replace-all · Back → Modal

**Event (11A–11F)**
75. /events Tab កំពុងមក (e-1 +10, e-2 +35) / កន្លងទៅ (e-3) · Create Validation (ចំនួនតុ 0/-3/2.5) · Edit · Back → Modal
76. Detail: Menu Set + Dish · Picker 2 Tab (មានរួច → ✓ Disabled) · ដក (Modal) · Clone Sheet (កាលបរិច្ឆេទទទេ → Error; ជោគជ័យ → Detail ថ្មី + Toast)
77. Tab ការគណនា e-1 (20 តុ): **$255.00** · សាច់ $195.00 (30 kg) / បន្លែ $60.00 (30 kg) · e-2 (8 តុ): **$134.40** · សាច់ $118 → គ្រឿងទេស $8.40 → បន្លែ $8.00 · ប្តូរតុ 20→25 = **$318.75**
78. Tab បញ្ជីទិញ: Template Dropdown (ទាំងអស់/ម៉ូយសាច់ 1/ម៉ូយបន្លែ 1/មិនក្នុង Template…) · Filter · បង្កើត/កែ/លុប Template · ឈ្មោះស្ទួន → Error
79. "បង្កើត PDF" → /report?template=… Preview A4 (គ្មានតម្លៃ) · កែបរិមាណ/ថែម/ដក/Reset · ទទេ → Error · ទាញយក `purchasing-list-e-1.pdf` · `mock.reportPdf=fail` → Banner
80. "នាំចេញ Excel" → Modal ព្រមានតម្លៃ → ទាញយក `cost-report-e-1.xlsx` (Mock ≠ Workbook ពិត) · Event ទទេ → Toast "គ្មានទិន្នន័យ" · `mock.reportExcel=fail`
81. Dashboard "/": កាតស្ថិតិ (បើថ្ងៃនេះក្នុងខែដូច e-1: Event ខែនេះ 1 · ចំណាយ $255.00 · មុខម្ហូប 4 · កញ្ចប់ 2) · កម្មវិធីជិតមកដល់ 2 · `mock.event=empty` → Empty State

**Checklist (12A)**
82. Tab បញ្ជីទិញ → កាល "បានទិញ 0/2" → /checklist · ចុចជួរ → ✓ + ឆូត ភ្លាម · 50% · Undo · ១០០% → Toast + កាលបៃតង · Refresh → Persisted · `mock.togglePurchased=fail` → Rollback + Banner

**Bottom Nav (11D-2)**
83. ៥ Tab លើ "/", /ingredients, /dishes, /events, /profile · FAB នៅលើ Nav · Toast នៅលើ Nav · Detail/Form/Picker គ្មាន Nav · Touch + Focus Input → Nav លាក់ · /menu-sets គ្មាន Nav
84. EN គ្រប់ទំព័រ · 360px មិនលើសអេក្រង់ · `mock.sub=expired` → Lockout ដូចដើម

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
21. Contract មិនបញ្ជាក់ field របស់ Plan: `billingCycle` តម្លៃ (monthly/yearly/trial?), `isRecommended`, `features`, `currency` — Adapter `toPlan` សន្មត់
22. US-13 និយាយ "តម្លៃខែ និងតម្លៃឆ្នាំ" ក្នុង Plan តែមួយ ប៉ុន្តែ Contract ទំនងជា Plan ដាច់ដោយឡែកតាម Cycle — ត្រូវបញ្ជាក់
23. Subscription: field `endDate`, `status` (trial/active/expired/canceled) សន្មត់តាម Story; ឈ្មោះ Field ពិតមិនមានក្នុង Contract
24. "សន្សំ 20%" Hardcode (គ្មាន field % បញ្ចុះតម្លៃ)
25. US-15 Banner Threshold "Configurable" — Frontend Hardcode 3 ថ្ងៃ
26. Re-use Trial (`trial_used`) មិនមាន UI/Field ក្នុង Contract
27. Transaction field (amount, currency, status, createdAt, invoiceNumber) មិនមានក្នុង Contract — Adapter `toTransaction` សន្មត់
28. Visa/Mastercard, Wing: Backend `PAYMENT_METHOD_UNSUPPORTED` → UI Disabled (config)
29. Card Form + "Save this card" (US-18 S2): `POST /billing/payment-methods` ត្រូវការ `gatewayToken` ពី Gateway SDK — Flow មិនកំណត់; `/subscription/upgrade` គ្មាន flag `saveCard`
30. ABA PayWay Redirect/QR (UX 5.1): Backend Mock ឆ្លើយភ្លាម គ្មាន Redirect URL / Pending Status / Webhook
31. `params.reason` នៃ PAYMENT_FAILED មិនមាន Enum (UI Map CARD_DECLINED, INSUFFICIENT_FUNDS តាមការសន្មត់; ផ្សេងទៀត → សារទូទៅ)
32. `retry_count` / Retry Schedule (US-20 S1, S3) គ្មាន Field/Endpoint ឱ្យ UI បង្ហាញ
33. UX 5.1 "ប៊ូតុង enable ពេលជ្រើស" ≠ US-18 S3 "បង្ហាញ Validation" → ធ្វើតាម US
34. ចុច Back ពី /payment/success ត្រឡប់ /checkout វិញ (មិនទាន់ Guard ការបង់ស្ទួន)
35. `GET /billing/transactions` គ្មាន Pagination/Filter → Filter Client-side + "ផ្ទុកបន្ថែម" (ទាញទាំងអស់ម្តង) — ស្នើ `?status=&cursor=&limit=` (US-22 S3/S4 ត្រូវការ)
36. Transaction field សន្មត់: `status` (success/failed/refunded/pending), `paymentMethod|provider`, `plan.name`, `invoiceNumber`, `refundStatus` (REQUESTED/APPROVED/REJECTED), `refundReason`
37. គ្មាន `GET /billing/info` → មិន Prefill ពី Server (Cache localStorage ក្នុង Device); Phone លុបមិនបាន (Field ទទេមិនផ្ញើ); UI តម្រូវ ឈ្មោះ+អាសយដ្ឋាន ខុសពី Contract (Optional)
38. Refund Policy Window (7 ថ្ងៃ) មិនបង្ហាញជា Field → UI បង្ហាញប៊ូតុងគ្រប់ Success ដែលមិនទាន់ស្នើ ហើយពឹង `REFUND_NOT_ALLOWED`
39. Refund `rejected` គ្មាន Field មូលហេតុបដិសេធ (US-25 S4 ត្រូវជូនដំណឹងមូលហេតុ) · គ្មាន In-app Notification
40. US-23 S3 ធ្វើតាមពាក្យ: Download សម្រាប់តែ `success` (Refunded មិនមាន) — សូមបញ្ជាក់ថាត្រូវបានឬអត់
41. Invoice Snapshot (US-24 S2) ជា Backend — UI មានតែ Note
42. គ្មាន `baseUnitId` (US-27/UX 7.1) → ប្រើ `unitType` + `conversionRate`; UI សន្មត់ Base kg/L/pcs
43. គ្មាន Un-archive/Restore → Archive រួច Import ម្តងទៀតអាចជាប់ `*_ALREADY_IMPORTED` (US-29 S3) — ស្នើ `PATCH …/:id/restore` ឬ Import ត្រូវ Reactivate
44. ChefUnit/ChefCategory គ្មាន `presetId` → UI ផ្គូផ្គងតាមឈ្មោះ; Preset `isImported` មិនបញ្ជាក់ថាបន្ទាប់ Archive ជា true/false
45. `abbreviation` ចាំបាច់ក្នុង Contract តែ US-26/27 មិនសុំ → UI ដាក់ជាឈ្មោះ បើទទេ
46. គ្មាន Endpoint រាប់ការប្រើប្រាស់ Unit/Category → US-30 S3 (Warning "ប្រើដោយ N គ្រឿងផ្សំ") មិនអាចធ្វើ; Confirm ទូទៅជំនួស
47. Preset Ingredient គ្មាន `defaultCategoryId` ក្នុង `/ingredients/presets` (មានតែក្រុម `category: string`) → US-28 S1 Auto-assign ត្រូវផ្គូផ្គងតាមឈ្មោះ (Epic 8)
48. Preset Tree: Contract flat `[{category, items[]}]` → `toPresetTree` ដាក់ Sub តែមួយគ្មានឈ្មោះ; រង់ចាំ Shape Sub-category
49. US-33 តម្លៃ > 0 ≠ Contract ≥ 0 → UI តម្រូវ > 0
50. `defaultUnit` ជា Preset-unit (មិនមែន ChefUnit id) → UI ផ្គូផ្គងតាមឈ្មោះ; មិនឃើញ → ទទេ
51. US-33 All-or-Nothing: Contract មិនបញ្ជាក់ Transaction; Response មានតែ Item ដែលបង្កើតថ្មី (រំលង Duplicate ស្ងៀម) → Toast រាប់តាម Response
52. `errors[].field` របស់ Array (items.N.purchasePrice) សន្មត់ — មិនមានក្នុង Contract
53. US-35 S3 / US-36 S2: គ្មាន Endpoint រាប់ការប្រើក្នុង Dish មុន Archive (មានតែ `INGREDIENT_IN_USE params.count` ពេល Delete)
54. US-34 S3 "Last Updated": `GET /ingredients/my-stock` គ្មាន `updatedAt`; Pagination ក៏គ្មាន
55. គ្មាន `GET /ingredients/my-stock/:id` → Detail ទាញ List ទាំងមូលហើយរកតាម id
56. គ្មាន Un-archive → UX 8.4 "Archive + Undo" ធ្វើមិនបាន (ប្រើ Confirm); Archive រួចមិនអាច Restore ពី UI
57. `my-stock` ផ្តល់ `category` ជា String គ្មាន `categoryId`/`updatedAt`/`createdAt` → Detail ផ្គូផ្គងតាមឈ្មោះ; គ្មាន Sort "ថ្មីបំផុត"/"Last Updated"
58. `PATCH my-stock/:id` មិនអាចលុប Category (categoryId optional uuid, គ្មាន null)
59. `?categoryId=` ពេល Backend មាន Sub-category: មិនដឹងថា Parent រួម Item របស់ Sub ឬអត់ (ត្រូវបញ្ជាក់)

**Epic 9 (Dish)**
60. GET /dishes raw មិនបញ្ជាក់ field → Adapter `toDish` សន្មត់ `totalCost`, `tags[]`, `imageUrl`, `isArchived`
61. គ្មាន Endpoint បញ្ជី Tag/Preset Tag (US-43 S3) → Chip ពី Dish ទាំងអស់
62. គ្មាន Upload រូប Dish (មាន `imageUrl` ជា URL) → បញ្ចូល URL ដោយដៃ
63. គ្មាន Un-archive Dish (US-41 S2 Restore)
64. `?tag=` មិនគាំទ្រ Tag ច្រើន/Search; Filter Client-side (គ្មាន Pagination)
65. `calculationType` (US-44.1) មិនមានក្នុង Contract/Schema/Controller — ត្រូវ Backend (មើល `7_PENDING_BACKEND_9E.md`)
66. `costBreakdown[]` គ្មាន `chefIngredientId` → Edit ផ្គូផ្គងតាមឈ្មោះ; ស្នើបន្ថែម `chefIngredientId` + `isArchived`
67. PATCH /dishes/:id មិនអាចសម្អាត `description`/`imageUrl` (ទទេ → មិនផ្ញើ)
68. Contract មិនបញ្ជាក់ `costBreakdown[].unit` (string/object) និង Path `errors[].field` របស់ Array
69. Tag គ្មាន Max length/Preset/Normalize — UI កំណត់ 40 តួ, មិនប្រកាន់អក្សរធំតូច
70. Total Cost Live ក្នុង Form ជាការប៉ាន់ស្មាន Client (Σ qty × purchasePrice); Backend ជា Source of Truth
71. US-38 S3: គ្មាន `isArchived` ក្នុង Breakdown Row → គ្មាន Badge "Archived"
72. Contract មិនបញ្ជាក់ថា GET /dishes/:id ឆ្លើយ Dish Archived ឬអត់ (UI សន្មតថាបាន)
73. DELETE /dishes/:id ពិនិត្យតែ MenuSet; Event ជាប់ FK → 400 INVALID_REFERENCE (គ្មាន count) — ស្នើ 409 + count
74. Duplicate ឈ្មោះ (Copy)(Copy) មិនបញ្ជាក់; UX "(ចម្លង)" vs Backend "(Copy)" (#3)
75. PATCH my-stock/:id គ្មាន `affectedDishCount` → Toast US-42 ទូទៅ
76. Schema `Dish.totalCost` ជា Column រក្សាទុក (មិនមែន Computed on Read) — ត្រូវបញ្ជាក់ថា Recalc គ្រប់ករណី

**Epic 10 (Menu Set)**
77. GET /menu-sets raw គ្មាន `dishCount`/`dishes` → បញ្ជីមិនបង្ហាញចំនួនមុខម្ហូប
78. MenuSet raw មិនបញ្ជាក់ field (`totalCost`, `isArchived`)
79. `dishes[].cost` ប្រភេទមិនបញ្ជាក់ (number/string)
80. DELETE /menu-sets/:id មិនពិនិត្យ Event → 400 INVALID_REFERENCE (គ្មាន count)
81. គ្មាន Un-archive MenuSet
82. Dish Archived/លុប ក្នុងកញ្ចប់ — គ្មាន Flag
83. US-46 Tech Note (Computed on Read) vs Schema `MenuSet.totalCost` Column — ត្រូវ Recalc គ្រប់ករណី
84. US-47 S2 Snapshot: `EventMenuSet` ជា Live Reference — កែ MenuSet ប៉ះពាល់ Event ចាស់
85. US-48 ណែនាំ `dnd-kit` តែហាមដំឡើង Library ដោយមិនសួរ → ▲▼ + Tap-to-add (UX Open Item #3)
86. PATCH /menu-sets `dishIds` មិនបញ្ជាក់ថាបដិសេធ Dish Archived ឬអត់

**Epic 11 (Event)**
87. Schema `Event` គ្មាន `status` → Badge កំពុងមក/កន្លងទៅ គណនា Client
88. GET /events មានតែ `?upcoming=true` (≥ now) → Tab Filter Client (≥ ថ្ងៃនេះ 00:00); គ្មាន Pagination
89. `eventDate` ISO datetime vs UX ថ្ងៃតែមួយ → ផ្ញើ 12:00 ម៉ោងក្នុងស្រុក
90. GET /events (raw) គ្មានចំនួន Dish/Menu Set/ថ្លៃ
91. Event គ្មាន Archive/Delete (Contract §15.6)
92. Contract មិនបដិសេធ `eventDate` អតីតកាល/`tableCount` ធំហួសហេតុ
93. US-52 Tech Note ចង់ Expand Menu Set ជា Dish តែ Schema/Contract ទុក `EventMenuSet` Reference
94. GET /events/:id nested `dish`/`menuSet` field មិនបញ្ជាក់; Menu Set គ្មាន Dish ខាងក្នុង → ការពារស្ទួនតាម Menu Set មិនពេញ; `skipDuplicates` ស្ងៀម
95. Clone: Frontend បង្ខំផ្ញើ `name` + `eventDate`; Suffix KM "(ចម្លង)"/EN "(Copy)"
96. POST /events/:id/items ឆ្លើយ Event + dishes + menuSets (shape ដូច #94)
97. Dish/Menu Set Archived ក្រោយបន្ថែមចូល Event — Badge បើ `isArchived` មាន

**Cost / Dashboard / Vendor**
98. US-53 S1: Dish ស្ទួន (Direct + តាម Menu Set) រាប់ម្តងឬពីរដង — Mock រាប់ម្តង
99. Schema `DishIngredient` គ្មាន `unitId` — `quantityUsed` សន្មតជាខ្នាតរបស់ ChefIngredient; គ្មានបំប្លែង Unit
100. `ShoppingItem` គ្មាន Category → ទាញ my-stock បន្ថែម; ស្នើបន្ថែម `categoryId`/`category`
101. 9E មិនទាន់ធ្វើ → ការគណនាគុណ `tableCount` គ្រប់ម្ហូប
102. `cost-calculation` និង `shopping-list` ស្ទួនគ្នា
103. GET /dashboard គ្មាន "Event ខែនេះ" → រាប់ក្នុង Client ពី GET /events
104. `monthlySpending` និយមន័យមិនច្បាស់
105. `upcomingEvents` លំដាប់មិនបញ្ជាក់ + `≥ now` ≠ Tab "កំពុងមក"
106. `dishCount`/`menuSetCount` មិនបញ្ជាក់ថារាប់ Archived ឬអត់
107. `dashboard.subscription` ស្ទួន GET /subscription/me → មិនប្រើ
108. US-54 Tech Note Cache — ពឹង Backend
109. Filter Vendor ក្នុង Client → Endpoint `…/shopping-list/vendor/:id` មិនប្រើ
110. PATCH /vendor-presets/:id គ្មាន Zod + ឆ្លើយ `null` → Frontend ពិនិត្យ + ទាញថ្មី
111. POST /vendor-presets ឆ្លើយ raw (គ្មាន `ingredients`) → ទាញបញ្ជីថ្មី
112. Template ឱ្យ `ingredients:[{id,name}]` គ្មាន `isActive` → ដកគ្រឿងផ្សំ Archived ពេល Save (Warning)
113. US-55 S1 "ជ្រើសពី Shopping List" vs UX "Category/Ingredient" → ជ្រើសពី Stock ទាំងមូល
114. Template ឈ្មោះ: Max length/Case-sensitivity មិនបញ្ជាក់ (UI 60 តួ)
115. "មិនក្នុង Template ណាមួយ" គណនា Client (ទាញ Template ទាំងអស់; គ្មាន Pagination)

**Report (PDF/Excel)**
116. US-58 S3 Telegram: គ្មាន Endpoint
117. PDF A4 បង្កើតដោយ Backend — Preview Frontend ប៉ាន់ស្មាន; ពុម្ពអក្សរខ្មែរ/Layout មិនបញ្ជាក់
118. US-58 S1/S2 បំបែក Generate/Download តែ Contract ឱ្យ PDF ក្នុង Request តែមួយ
119. Body PDF ដែលមាន `items` — Backend ត្រូវមិនបន្ថែមតម្លៃ (Business Secret)
120. Contract មិនបញ្ជាក់ Limit `items`/Validation `totalQuantity > 0`/ប្រវែង `title`
121. Quick Edit ថែមគ្រឿងផ្សំពី Stock (មិនតម្រូវនៅក្នុង Event) — ត្រូវបញ្ជាក់ជាមួយ Client
122. ចំណងជើង PDF លំនាំដើម (`<Event> · <Template>`) បង្កើតក្នុង Frontend
123. Excel Column (ឈ្មោះម្ហូប, គ្រឿងផ្សំ, បរិមាណ, តម្លៃរាយ, តម្លៃសរុប) — Frontend ផ្ទៀងផ្ទាត់មិនបាន; ត្រូវសាកល្បងអក្សរខ្មែរ UTF-8 ក្នុង Excel
124. US-59 S2 Export ប្រចាំខែ + UX 11.9 ជ្រើស Scope: គ្មាន Endpoint
125. US-59 CSV (UTF-8 BOM): គ្មាន Endpoint
126. US-59 S3: Empty ពិនិត្យ Client; Response Backend ពេលគ្មានទិន្នន័យមិនបញ្ជាក់
127. Excel រួម Event ទាំងមូល (គ្មាន Parameter Template)
128. Excel/PDF មិនតម្រូវ Subscription សកម្ម (Contract §12) — Business ត្រូវសម្រេច

**Epic 12 (Checklist)**
129. US-60 S3: Contract ឱ្យ `progress`/`purchasedCount`/`totalCount` តែ Tech Note ចង់ឱ្យគណនា Frontend → Frontend មិនប្រើ field ទាំងនោះ
130. Toggle Endpoint ជា Auth+Sub (403 ពេលផុតកំណត់) → Rollback + Upgrade Modal
131. Check-off ជាប់ (eventId, chefIngredientId): Dish ដក/ប្តូរតុ → នៅជាប់; Clone មិនចម្លង (សន្មត)
132. Response Toggle (`EventPurchaseStatus`) shape មិនបញ្ជាក់ → មិនប្រើ
133. Sync ឆ្លងឧបករណ៍: គ្មាន Push/Polling → ទាញថ្មីពេល Tab មើលឃើញវិញ; Last-write-wins
134. Group តាម Category: ShoppingItem គ្មាន Category (#100) + គ្មាន Sub-Category (#1)
135. Checklist មិនប្រើ Vendor Template Filter

**កំណត់សម្គាល់ Frontend (មិនមែន Backend)**
136. Dashboard "ផ្លូវកាត់" ស្ទួន Bottom Nav (រក្សា: Menu Sets មិនមែន Tab)
137. ទំព័រ Root នៅមានប៊ូតុង ← (`backTo="/"`) ស្ទួន Nav — អាចលុបក្រោយ
138. `CalendarGlyph` ស្ទួន `CalendarIcon` ក្នុង Icons.jsx — អាចជំនួសក្រោយ
139. Tab "ផ្សេងៗ" → /profile (មិនមាន Menu Hub)
140. `useTextFieldFocus` ប្រើ `pointer: coarse` — iPad + Keyboard ខាងក្រៅ អាចលាក់ Nav
141. `HomePlaceholder` + `QuickLink` ក្នុង App.jsx ទុកជា Backup (មិនប្រើ)
142. Mock `.xlsx` មិនមែន Workbook ពិត (គ្មាន Library សរសេរ Excel) — សាកល្បងជាមួយ Backend ពិត

## សំណួរ/ការសម្រេចចិត្តដែលនៅបើក
- Epic 4-6: UI បង្ហាញ Visa/Wing (សារ "មិនទាន់គាំទ្រ") ឬតែ ABA PayWay?
