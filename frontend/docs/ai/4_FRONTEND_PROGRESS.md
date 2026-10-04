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

## Epic 9 — Dish & Recipe
- 🟡 US-43 S2 Filter តាម Tag (Chip ពី Dish ទាំងអស់, Filter Client-side) · ⬜ S1/S3 កំណត់/បង្កើត Tag (9B)
- 🟡 US-44 Toggle List/Grid + ចងចាំ View (localStorage `chef.dishView`)
- ⬜ US-37 · US-39 (9B) · ⬜ US-38 · US-40 · US-41 (9C) · ⬜ US-42 (9D) · ⬜ US-44.1 (9E — Backend Gap #65)

## Epic 9 — Dish & Recipe
- 🟡 US-43 Tag: S1 កំណត់ Tag (TagPicker) · S2 Filter · S3 បង្កើត Tag ថ្មីភ្លាមៗ (Tag ជា string សេរី — Gap #61/#69)
- 🟡 US-44 Toggle List/Grid + ចងចាំ View
- 🟡 US-37 Create Dish (Live Cost ប៉ាន់ស្មាន, Validation គ្រឿងផ្សំ ≥1 / បរិមាណ > 0) · Picker ពី Stock
- 🟡 US-39 Edit Dish (Replace-all, Cancel → Modal) — ផ្គូផ្គងតាមឈ្មោះ (Gap #66); Route `/dishes/:id` បណ្តោះអាសន្ន = Form
- ⬜ US-38 · US-40 · US-41 (9C) · ⬜ US-42 (9D) · ⬜ US-44.1 (9E — Backend Gap #65)
- 🟡 US-38 Dish Detail + Cost Breakdown (% ពី Server, Highlight ខ្ពស់បំផុត) · ⬜ S3 Badge "Archived" លើគ្រឿងផ្សំ (Gap #66/#71)
- 🟡 US-40 Duplicate (បង្ហាញតាមឈ្មោះ Backend "(Copy)" — Gap #3) → ទៅ Detail ថ្មី + Toast
- 🟡 US-41 S1 Archive (Confirm) · S2 មើលបញ្ជី Archived (Tab) ✅ · Restore ⬜ (Gap #63) · S3 Delete (409 DISH_IN_USE → Warning + "លាក់ជំនួស"; 400 INVALID_REFERENCE → "កំពុងប្រើ")
- Route: `/dishes/:id` = Detail · `/dishes/:id/edit` = Form

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
66. Home → "មុខម្ហូប" → /dishes: 4 ជួរ (Active) · Archived (សាឡាត់ត្រសក់) មិនបង្ហាញ · ថ្លៃ "$13.25"
67. Chips: ទាំងអស់ · ស៊ុប · ម្ហូបសម្រន់ · ម្ហូបសំខាន់ · បង្អែម · ចុច "ម្ហូបសំខាន់" → 2 មុខ · ចុច "ទាំងអស់" ត្រឡប់
68. Toggle Grid → 2 Column កាត (Placeholder 🍜 ព្រោះគ្មានរូប) · Refresh → នៅ Grid ដដែល · ប្តូរ List វិញ → ចងចាំ
69. Console: localStorage.setItem('mock.dish','empty') + Refresh → Empty State + "បង្កើតមុខម្ហូបដំបូង"
70. ប្តូរភាសា EN → ចំណងជើង/Toggle label/"Total cost" ប្តូរតាម
71. FAB (+) / Empty CTA → /dishes/new (9B — ឥឡូវ Redirect ទៅ `/` ជាធម្មតា)
72. /dishes → FAB (+) → "បង្កើតមុខម្ហូប": Save ទទេ → Error ឈ្មោះ + "សូមបន្ថែមគ្រឿងផ្សំ…" · Scroll ទៅលើ
73. "+ បន្ថែមគ្រឿងផ្សំ" → Picker ពេញអេក្រង់: 4 ជួរ · Search/Chips ដំណើរការ · Footer "បានជ្រើសរើស (0)" ប៊ូតុង Disabled
74. ជ្រើស 2 → "បន្ថែម →" → ត្រឡប់ Form ឃើញ 2 ជួរ · បើកម្តងទៀត → 2 នោះ checked+disabled "បានបន្ថែមរួចហើយ"
75. បំពេញបរិមាណ `1.5` (សាច់មាន់ $6.50) → "= $9.75" ក្រោមជួរ · Footer សរុបប្តូរភ្លាម · ✕ ដកជួរ → សរុបថយ
76. បរិមាណទទេ → Error "សូមបញ្ចូលបរិមាណ" · `0`/`-1` → "ធំជាង 0" · Save មិនបន្ត
77. Tag: ចុច Chip ជ្រើស/ដក · វាយ "បុណ្យ" + Enter/"បន្ថែម" → Chip ថ្មីជ្រើសភ្លាម · វាយ "ស៊ុប" (មានស្រាប់) → មិនស្ទួន
78. URL រូបភាព `abc` → Error "តំណមិនត្រឹមត្រូវ" (Mock 400) · ទទេ → ជាប់
79. Save ត្រឹមត្រូវ → ត្រឡប់ /dishes + Toast "បានបង្កើតមុខម្ហូបថ្មី" · Dish ថ្មីក្នុងបញ្ជី ថ្លៃត្រូវ · Chip "បុណ្យ" ចេញ
80. Back ពេលបានបំពេញ → Modal "បោះបង់?" → បោះបង់ត្រឡប់ List · Back ពេលទទេ → ត្រឡប់ភ្លាម
81. ចុច Dish "ឆាក្ដៅសាច់មាន់" → Form Edit: ឈ្មោះ, Tag, 2 ជួរ (1.5 / 0.5) សរុប $10.75 · កែបរិមាណ → Save → Toast "បានរក្សាទុក" · List ថ្លៃថ្មី
82. Edit → ដក 1 ជួរ + បន្ថែមមួយ → Save → ថ្លៃថ្មីត្រូវ (Replace-all) · Edit → ដកអស់ → Save → Error គ្រឿងផ្សំ
83. Stock → Archive "ខ្ទឹមស" → Edit "ឆាក្ដៅសាច់មាន់" → Warning លឿង "ខ្ទឹមស … នឹងត្រូវដកចេញ" · /dishes/xyz → "រកមិនឃើញមុខម្ហូបនេះ"
84. Stock ទទេ (Archive ទាំង 4) → Picker → "ស្តុកគ្រឿងផ្សំទទេ" + "ទៅបន្ថែមគ្រឿងផ្សំមុន" → /ingredients/browse
85. `mock.sub=expired` + View-only → Save → 403 → Upgrade Modal (ពី api.js)
86. /dishes → ចុច "ឆាក្ដៅសាច់មាន់" → Detail: ថ្លៃ $10.75 · Tag · តារាង 2 ជួរ (សាច់មាន់ 1.5kg $6.50 = $9.75 ៩០.៧%; ខ្ទឹមស 0.5kg $2.00 = $1.00) · ជួរសាច់មាន់ Highlight លឿង "ខ្ពស់បំផុត" · សរុបខាងក្រោម
87. Detail មួយគ្រឿងផ្សំ (នំបញ្ចុក) → គ្មាន Highlight · Refresh ទំព័រ → ទិន្នន័យនៅដដែល · /dishes/xyz → "រកមិនឃើញមុខម្ហូបនេះ"
88. Stock → កែតម្លៃ "សាច់មាន់" ទៅ $8 → Detail ឆាក្ដៅ → ថ្លៃថ្មី $13.00 (US-42 S2)
89. "⋮" → កែប្រែ → /dishes/d-1/edit (Form) · Save → ត្រឡប់ Detail + Toast "បានរក្សាទុក" · Back ក្រោយនោះ មិនចូល Form វិញ
90. Create Dish ថ្មី → Save → Detail ថ្មី + Toast "បានបង្កើត"
91. "⋮" → Duplicate → Spinner ~0.6s → Detail "ឆាក្ដៅសាច់មាន់ (Copy)" + Toast "បានចម្លង" · ថ្លៃ/តារាងដូចដើម · កែ Copy → ដើមមិនប៉ះពាល់
92. "⋮" → Archive → Modal → បញ្ជាក់ → /dishes + Toast "បានលាក់" · ជួរបាត់ពី Tab សកម្ម · Tab "បានលាក់" ឃើញ (រួម "សាឡាត់ត្រសក់")
93. Tab "បានលាក់" → ចុចជួរ → Detail: Badge "បានលាក់" · Menu មានតែ "លុបចោល" · គ្មានប៊ូតុង កែប្រែ
94. Delete "នំបញ្ចុក" → Modal ក្រហម → លុប → /dishes + Toast "បានលុប" · ជួរបាត់
95. Delete "សម្លម្ជូរគ្រឿងសាច់ជ្រូក" (Mock ប្រើ 2 កញ្ចប់) → Modal បិទ + Warning លឿង "ប្រើក្នុង 2 កញ្ចប់ម៉ឺនុយ" → "លាក់ជំនួស" → Archive ជោគជ័យ
96. Console: localStorage.setItem('mock.dishDelete','fk') → Delete Dish ណាមួយ (មិនជាប់ MenuSet) → Banner ក្រហម "មិនអាចបញ្ចប់បានទេ ព្រោះទិន្នន័យនេះកំពុងប្រើប្រាស់"
97. Tab "បានលាក់" ទទេ (Archive/លុបអស់) → "មិនមានមុខម្ហូបដែលបានលាក់" គ្មានប៊ូតុងបង្កើត
98. EN → Header ជួរតារាង, Modal, Toast ប្តូរភាសា

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
60. GET /dishes = raw Prisma មិនបញ្ជាក់ field: Adapter `toDish` សន្មត់ `totalCost`, `tags[]`, `imageUrl`, `isArchived`; បើគ្មាន `totalCost` UI បង្ហាញ "—"
61. គ្មាន Endpoint បញ្ជី Tag/Preset Tag (US-43 S3, Epic 1 i18n) → Chip បង្កើតពី Dish ទាំងអស់; Tag ដែលគ្មាន Dish ប្រើ មិនបង្ហាញ
62. គ្មាន Endpoint Upload រូប Dish (មានតែ `imageUrl` ជា URL) → Grid View បង្ហាញ Placeholder; UX 9.2 "Photo upload" ធ្វើមិនបាន
63. គ្មាន Un-archive Dish (US-41 S2 Restore)
64. `?tag=` គ្មានភ្ជាប់ Tag ច្រើន/Search; Frontend Filter Client-side (គ្មាន Pagination)
65. `calculationType` (US-44.1) មិនមានក្នុង Contract/Dish — ត្រូវ Backend (schema + migration + Dish controller + Event cost-calculation)
66. GET /dishes/:id `costBreakdown[]` គ្មាន `chefIngredientId` → Edit ផ្គូផ្គងតាមឈ្មោះក្នុង my-stock; គ្រឿងផ្សំ Archived/ប្តូរឈ្មោះ → ដកចេញពេល Save. ស្នើបន្ថែម `chefIngredientId` (+ `isArchived`) ក្នុង Breakdown (US-38 S3 ក៏ត្រូវការ Badge "Archived")
67. PATCH /dishes/:id មិនអាចសម្អាត `description`/`imageUrl` (ទទេ → មិនផ្ញើ; imageUrl ត្រូវជា URL)
68. Contract មិនបញ្ជាក់ `costBreakdown[].unit` (string/object) និង Path `errors[].field` របស់ Array (`ingredients.N.quantityUsed`) — Adapter ទទួលទាំងពីរ
69. Tag គ្មាន Max length/Preset/Normalize ក្នុង Contract (US-43 + i18n Epic 1) — UI កំណត់ 40 តួ, ប្រៀបធៀបមិនប្រកាន់អក្សរធំតូច
70. Total Cost Live ក្នុង Form ជាការប៉ាន់ស្មាន Client (Σ qty × purchasePrice) — គ្មាន Endpoint Preview; Backend ជា Source of Truth (US-37)
71. US-38 S3: `costBreakdown[]` គ្មាន `isArchived` ក្នុង Row (ទាក់ទង #66) → Badge "Archived" ធ្វើមិនបាន; តារាងបង្ហាញឈ្មោះ/តម្លៃដូចធម្មតា
72. Contract មិនបញ្ជាក់ថា `GET /dishes/:id` ឆ្លើយ Dish ដែល `isArchived:true` ឬអត់ → UI សន្មតថាបាន (Tab "បានលាក់" ចុចចូល Detail); បើ 404 → បង្ហាញ "រកមិនឃើញ"
73. `DELETE /dishes/:id` ពិនិត្យតែ MenuSet (Contract §15.9); Dish ក្នុង Event ដែលជាប់ FK → 400 INVALID_REFERENCE (មិនមែន 409) → UI បង្ហាញសារទូទៅ "កំពុងប្រើប្រាស់" ដោយគ្មានចំនួន; ស្នើ 409 + count សម្រាប់ Event ផងដែរ (US-41 S3 តម្រូវពិនិត្យ Table Calculation ចាស់)
74. Duplicate: Backend ពុំបញ្ជាក់ឈ្មោះជាន់ (Copy)(Copy) — UI បង្ហាញតាម Server

## សំណួរ/ការសម្រេចចិត្តដែលនៅបើក
- Epic 4-6: UI បង្ហាញ Visa/Wing (សារ "មិនទាន់គាំទ្រ") ឬតែ ABA PayWay?
