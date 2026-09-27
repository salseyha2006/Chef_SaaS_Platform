# 📱 UX/UI Specification Document
# Chef SaaS Platform — Mobile-First Web App

**Platform:** Mobile-First Responsive Web (ដំណើរការដូច Native Mobile App)
**Scope:** Epic 2 → Epic 12 (Full Product Backlog)

---

# Epic 2: Authentication & Profile Management

## 1. User Flow Overview

```
[Splash/Landing] → [Login Screen] ⇄ [Register Screen] → [Email Verification/OTP] → Onboarding (Epic 3)
[Login] → [Forgot Password] → [OTP Verify] → [Reset Password] → [Login]
[Authenticated] → [Profile Menu] → [Edit Profile] / [Change Password] / [Logout]
```

## 2. Screen 2.1 — Login
**Stories:** US-03, US-05

**Layout:**
- Header: Logo កណ្តាល, គ្មាន Back button (Entry point)
- Language Switcher 🌐 (KH/EN) — ជ្រុងស្តាំខាងលើ (US-01)
- Input: Email
- Input: Password (Icon 👁️ toggle show/hide)
- Link: "ភ្លេចលេខសម្ងាត់?" — align ស្តាំ ក្រោម Password
- Primary Button: "ចូលប្រើប្រាស់" — full-width, height ≥48px
- Divider "ឬ"
- Secondary Button: "ចូលតាម Google" — style ស្រាល, icon Google
- Footer Link: "មិនទាន់មានគណនី? ចុះឈ្មោះ" → Register

**States:**
- Empty state (default)
- Error state: Input border ក្រហម + text error ក្រោម field ("អ៊ីមែល ឬ លេខសម្ងាត់មិនត្រឹមត្រូវ")
- Lockout state (US-05): ក្រោយពី N ដងខុស → Disable button + Countdown timer text
- Loading state: Button → Spinner

**Edge cases:**
- Autofill browser password managers ត្រូវគាំទ្រ
- Keyboard mobile: Email field → `inputmode="email"`, Enter key → submit

## 3. Screen 2.2 — Register
**Stories:** US-02, US-03

**Layout:**
- Header: Back arrow ← ទៅ Login, Title "បង្កើតគណនី"
- Input: ឈ្មោះ (Display Name)
- Input: Email
- Input: Password (មាន Strength indicator តូចៗក្រោម field)
- Input: Confirm Password
- Checkbox: "ខ្ញុំយល់ព្រមតាម លក្ខខណ្ឌប្រើប្រាស់" (required)
- Primary Button: "ចុះឈ្មោះ" — disable រហូតដល់ checkbox ត្រូវបានគ្រីស
- Divider "ឬ" → Secondary Button "ចុះឈ្មោះតាម Google"
- Footer: "មានគណនីរួចហើយ? ចូលប្រើប្រាស់"

**States:**
- Real-time validation ក្រោម field នីមួយៗ
- Error state: server error (email ត្រូវបានប្រើរួច) → error banner លើគេ

**Edge case:**
- ប្រសិនបើ user ជ្រើសរើស Google (US-03) → Skip screen នេះ ទៅផ្ទាល់ Onboarding (គ្មាន password field)

## 4. Screen 2.3 — Email Verification (OTP)
**Story:** US-04

**Layout:**
- Header: Title "ផ្ទៀងផ្ទាត់អ៊ីមែល"
- Text: "យើងបានផ្ញើកូដទៅ [email@example.com]"
- OTP Input: ប្រអប់ 6 ដាច់ដោយឡែក, auto-focus ប្រអប់បន្ទាប់, auto-fill support ពី SMS/clipboard
- Text link: "មិនទទួលបានកូដ? ផ្ញើម្តងទៀត" — countdown 60s
- Primary Button: "បញ្ជាក់" — auto-enable ពេលបំពេញគ្រប់ 6 ខ្ទង់

**States:**
- Error: កូដខុស → shake animation + border ក្រហម
- Success: checkmark animation → auto-navigate ទៅ Onboarding

## 5. Screen 2.4 — Forgot / Reset Password
**Story:** US-06

**Sub-screen A: Request**
- Input: Email
- Button: "ផ្ញើកូដ OTP"

**Sub-screen B: OTP + New Password**
- OTP Input (ដូច 2.3)
- Input: លេខសម្ងាត់ថ្មី
- Input: បញ្ជាក់លេខសម្ងាត់ថ្មី
- Button: "កំណត់លេខសម្ងាត់ថ្មី" → success → redirect Login ជាមួយ toast

## 6. Screen 2.5 — Profile / Settings
**Stories:** US-07, US-08, US-09

**Layout (List-style):**
- Header: Avatar + ឈ្មោះ + Email (read-only)
- List Item: "កែប្រែព័ត៌មានផ្ទាល់ខ្លួន" → Edit Profile
- List Item: "ផ្លាស់ប្តូរលេខសម្ងាត់" → Change Password
- List Item: "ភាសា" → 🌐 KH/EN toggle inline
- Divider
- List Item (ក្រហម): "ចាកចេញ (Logout)" → Confirm modal

**Edit Profile (US-07):** Avatar upload, Input ឈ្មោះ, Button "រក្សាទុក"

**Change Password (US-08):**
- Email account: Input លេខចាស់ + លេខថ្មី + Confirm
- Google-only account: បង្ហាញតែ "កំណត់លេខសម្ងាត់" (គ្មាន field លេខចាស់)

## 7. Component Checklist
- `<AuthInput>` — text/email/password variants
- `<OTPInput>` — 6-digit, auto-advance
- `<PrimaryButton>` — loading/disabled states
- `<LanguageSwitch>` — global, persists selection
- `<ConfirmModal>` — reused for Logout & destructive actions

## 8. Mobile-Specific Notes
- Touch target min 44×44px
- Bottom-fixed Primary Button លើ screen វែង
- Keyboard-aware scroll

---

# Epic 3: Onboarding & Data Setup

## 1. User Flow Overview

```
[Email Verified / First Login] → [Onboarding Wizard Step 1] → [Step 2] → [Step 3] → [Seed Presets] → [Dashboard]
```

## 2. Screen 3.1 — Onboarding Wizard (Multi-step)
**Story:** US-10

**Layout:** Full-screen takeover, Step-by-step (Carousel/Swipe)
- Top: Progress Dots (● ● ○)
- Top-right: Link "រំលង (Skip)" — step ចុងក្រោយ ប្តូរជា "ចាប់ផ្តើមប្រើប្រាស់"
- Center: Illustration + Title + Description
- Bottom: Primary Button "បន្ទាប់ (Next)" — full-width

**ខ្លឹមសារ Steps:**

| Step | Title | Description |
|---|---|---|
| 1 | គ្រប់គ្រងគ្រឿងផ្សំ | បន្ថែមគ្រឿងផ្សំចូលស្តុក កំណត់តម្លៃដើមយ៉ាងងាយស្រួល |
| 2 | បង្កើតមុខម្ហូប | គណនាថ្លៃដើមមុខម្ហូបស្វ័យប្រវត្តិពីគ្រឿងផ្សំ |
| 3 | គ្រប់គ្រងកម្មវិធី | បង្កើត Event គណនាចំណាយ និង Export របាយការណ៍ |

**Interaction:** Swipe left/right ប្តូរ Step, Tap Dots លោត Step ដោយផ្ទាល់

## 3. Background Process — Seed Standard Presets
**Story:** US-11 (`upsert` logic ក្នុង Seed Script)

**UX Consideration:**
- ដំណើរការស្វ័យប្រវត្តិផ្ទៃខាងក្រោយ ភ្លាមៗពេល Register ជោគជ័យ
- គ្មាន Loading spinner ធំបង្ហាញ
- Retry ស្វ័យប្រវត្តិប្រសិនបើបរាជ័យ, មិន Block user ពី Onboarding

## 4. Component Checklist
- `<OnboardingSlide>`, `<ProgressDots>`, `<SkipLink>`

## 5. Mobile-Specific Notes
- Swipeable Carousel (native touch gesture)
- Illustration optimize ទំហំ file តូច
- Skip button touch target ធំល្មម

---

# Epic 4-6: Subscription, Payment & Billing

## 1. User Flow Overview

```
[Register] → [Free Trial Auto-Start] → [Dashboard] (Trial badge)
[Dashboard] → [View Pricing] → [Select Plan] → [Payment Method] → [Processing] → [Confirmation]
[Trial/Plan Expired] → [Graceful Lockout] → [View Pricing]
[Settings] → [Billing History] → [Transaction Detail] → [Download Invoice]
[Settings] → [Subscription Status] → [Cancel Subscription]
```

## 2. Screen 4.1 — Trial Status Badge (Global Component)
**Stories:** US-12, US-15

- Persistent Banner/Badge លើ Dashboard/Profile menu
- Text: "សល់ 12 ថ្ងៃទៀត" (Trial) ឬ "កញ្ចប់ផុតកំណត់ថ្ងៃទី..." (Paid)
- Color: បៃតង/ខៀវ (normal) → លឿង (≤3 ថ្ងៃ) → ក្រហម (expired grace)
- Tap → Screen 4.2

## 3. Screen 4.2 — Pricing & Plans
**Story:** US-13

- Toggle: "ប្រចាំខែ" ⇄ "ប្រចាំឆ្នាំ (សន្សំ 20%)"
- Plan Cards (Vertical stack លើ Mobile)
- Card **Recommended**: Border/Badge លេចធ្លោ
- Footer note: "អាចលុបចោលបានគ្រប់ពេល"

## 4. Screen 5.1 — Select Payment Method
**Story:** US-18

- Summary box: "កញ្ចប់ [ឈ្មោះ] — $XX/ខែ"
- Radio List: 💳 Visa/Mastercard | 🅰️ ABA PayWay | 📱 Wing
- Primary Button "បន្ត" — enable ពេលជ្រើសរើស

**Edge case:** Visa/Mastercard → Input fields Card number/Expiry/CVV; ABA/Wing → redirect/QR code

## 5. Screen 5.2 — Payment Processing
**Stories:** US-19, US-20

- Full-screen overlay, Spinner + "កំពុងដំណើរការបង់ប្រាក់..."
- មិនអនុញ្ញាត Back/Cancel ខណៈកំពុង process

**States:**
- Success → auto-navigate Confirmation
- Failed → Icon ❌, reason text, Button "ព្យាយាមម្តងទៀត" / "ប្តូរមធ្យោបាយបង់ប្រាក់ផ្សេង"

## 6. Screen 5.3 — Payment Confirmation
**Story:** US-21

- Icon ✅ animation, Title "បង់ប្រាក់ជោគជ័យ!"
- Summary: កញ្ចប់, ចំនួនទឹកប្រាក់, កាលបរិច្ឆេទ
- Button "ទៅកាន់ទំព័រដើម"

## 7. Screen 4.3 — Graceful Lockout (Expired)
**Story:** US-17

- Friendly illustration (មិនមែន Error ក្រហម)
- Title "កញ្ចប់សេវាកម្មរបស់អ្នកបានផុតកំណត់"
- Description: "ទិន្នន័យរបស់អ្នកមានសុវត្ថិភាព 100%"
- Button "ជ្រើសរើសកញ្ចប់ថ្មី" | Secondary link "ចាកចេញ"

## 8. Screen 6.1 — Cancel Subscription
**Story:** US-16

- Plan បច្ចុប្បន្ន + ថ្ងៃបន្តបន្ទាប់
- Button "លុបចោលការបន្តស្វ័យប្រវត្តិ" → Confirm Modal
- ក្រោយ Cancel → Trial Badge ប្តូរជា "កំពុងប្រើប្រាស់ដល់ [date], មិនបន្តទៀត"

## 9. Screen 6.2 — Transaction History
**Story:** US-22

- List grouped by month: Icon status | កាលបរិច្ឆេទ | ចំនួនទឹកប្រាក់ | Chevron →
- Empty state: "មិនទាន់មានប្រវត្តិការទូទាត់"

## 10. Screen 6.3 — Transaction Detail
**Story:** US-23

- Summary card: ចំនួនទឹកប្រាក់, Status badge
- Info: Plan, Payment method, Transaction ID, Date/Time
- Button "ទាញយកវិក្កយបត្រ (PDF)" — native share sheet
- Edge case (US-25): Success transaction → link "ស្នើសុំ Refund"

## 11. Screen 6.4 — Update Billing Information
**Story:** US-24

- Input ឈ្មោះហាង/អាជីវកម្ម, Input អាសយដ្ឋាន, Button "រក្សាទុក"

## 12. Component Checklist
- `<PlanCard>`, `<PaymentMethodRadio>`, `<StatusBadge>`, `<ConfirmModal>`, `<TransactionRow>`

## 13. Mobile-Specific Notes
- Payment fields `inputmode="numeric"` សម្រាប់ Card/CVV
- Processing screen disable pull-to-refresh/back-gesture
- Invoice download → native Share Sheet API
- Sticky "ជ្រើសរើស" button ក្នុង Plan card មិនត្រូវលាក់

---

# Epic 7-8: Unit/Category Configuration & Ingredient Management
*(រួមបញ្ចូល Sub-Category Support)*

## 1. User Flow Overview

```
[Dashboard] → [Ingredient Stock] → [Add Ingredient] → [Browse Preset 2-Level Tree View]
   → [Multi-select] → [Set Custom Price/Unit] → [Save] → [Back to Stock List]
[Inline] → [Unit Selector] → [Create New Unit modal]
[Inline] → [Category Selector] → [Create New Category/Sub-category inline]
```

## 2. Screen 7.1 — Unit & Category Configuration (with Sub-Category)
**Stories:** US-26, US-27, US-28, US-29, US-30 (Extended)

**Tab: Units**
- List Checkbox នៃ Preset units; item ដែលបានជ្រើសរួច → checked + disabled (US-29)
- FAB (+): "បង្កើត Unit ថ្មី"

**Modal: Create New Unit (US-27)**
- Input ឈ្មោះ Unit, Input **អត្រាបំប្លែង (Conversion Rate)** — required, Dropdown Base unit
- Button "រក្សាទុក" — disable ប្រសិនបើ Conversion Rate ទទេ

**Tab: Categories — Hierarchical (Parent → Sub-category)**
```
▼ សាច់ (Parent Category)          ☑ (auto-check if any sub selected)
    ☑ សាច់មាន់ (Sub-category)
    ☐ សាច់ជ្រូក
▶ បន្លែ
```
- Check **Parent** → auto-check គ្រប់ Sub-category ខាងក្រោម
- Check **Sub only** → Parent → **Indeterminate (–)** state
- Inline "+" add: Parent level root, Sub-category level ក្រោម Parent (indent, ពេល expand)

**Uncheck Behavior (extended):**
- Uncheck Parent → Confirm toast: "លាក់ [ឈ្មោះ Parent] និង Sub-category ចំនួន X ខាងក្រោម?"
- Uncheck Sub តែម្នាក់ → មិនប៉ះពាល់ Parent/Sub ផ្សេង

**Edge case / Business rule (ត្រូវ confirm ជាមួយ Dev/Client):**
- Depth limit 2 level ប៉ុណ្ណោះ (Parent → Sub, គ្មាន Sub-of-Sub)
- Ingredient assign ទៅ Sub-category តែមួយប៉ុណ្ណោះ (មិន assign ចូល Parent ដោយផ្ទាល់ ប្រសិនបើមាន Sub រួច)

## 3. Screen 8.1 — Browse Global Ingredient Presets (2-Level Tree View)
**Stories:** US-31, US-32 (Extended)

**3-Tier Tree:** Parent Category → Sub-Category → Ingredients
```
▼ សាច់ (Parent — level 1)
    ▼ សាច់មាន់ (Sub-category — level 2, indent 16px)
        ☑ សាច់មាន់ទាំងខ្លួន (Ingredient — level 3, indent 32px)
        ☐ ស្លាបមាន់
    ▶ សាច់ជ្រូក (collapsed)
▶ បន្លែ (collapsed)
```

**Visual Hierarchy:** Level 1 bold + distinct background; Level 2 medium indent 16px; Level 3 checkbox indent 32px

**Expand/Collapse:**
- Tap Parent chevron → expand/collapse Sub-categories only
- Tap Sub chevron → expand/collapse Ingredients
- Default: All collapsed (លើកលែងតែ Search active)

**Checkbox Sync (extended):**
- Ingredient ដែលមានក្នុងស្តុករួច → checked + disabled
- Sub-category checkbox: Indeterminate (–) ប្រសិនបើមាន selection ខ្លះ
- Parent checkbox: Indeterminate ប្រសិនបើ Sub ណាមួយមាន selection

**Search:** Auto-expand Parent + Sub ដែលមាន matching; breadcrumb តូចខាងលើ (ឧ. "សាច់ > សាច់មាន់ > ស្លាបមាន់")

**Sticky Footer:** "បានជ្រើសរើស (5)" + Button "បន្ទាប់ →"

**Edge case:** Sub-category ទទេ → hide ពី Tree; Tap label text = tap chevron (touch-friendly)

**⚙️ Technical Note:** Data structure 3-level nested `Category → SubCategory → Ingredient[]`; checkbox propagation គណនា client-side។

## 4. Screen 8.2 — Set Custom Pricing & Unit (Import Workflow)
**Story:** US-33

- List item ដែលបានជ្រើសពី 8.1: ឈ្មោះ (read-only) | Input "តម្លៃទិញចូល" | Dropdown "ឯកតា" (+ "បង្កើត Unit ថ្មី" inline)
- Sticky Footer: "រក្សាទុកទាំងអស់"
- Edge case: Back/Cancel → Confirm modal "ការផ្លាស់ប្តូរនឹងបាត់បង់?"

## 5. Screen 8.3 — My Ingredient Inventory (Stock List) + Nested Filter Chips
**Story:** US-34

**Layout:**
- Header: "ស្តុកគ្រឿងផ្សំ", FAB (+)
- **Nested Filter Chips (Updated Pattern):**
  - Row 1 (Primary): "ទាំងអស់" | "សាច់ ▾" | "បន្លែ" | "គ្រឿងទេស ▾" (chip ដែលមាន Sub-category → icon "▾")
  - Tap label text → filter តាម Parent category (ទាំងមូល)
  - Tap icon "▾" → **Row 2 (Sub-filter)** slide-down: "ទាំងអស់ក្នុងសាច់" | "សាច់មាន់" | "សាច់ជ្រូក" | "សាច់គោ"
  - Tap Sub-chip → filter ស៊ីជម្រៅជាងមុន; Parent chip active state រក្សា (nested selection)
  - Tap Parent ផ្សេង/"ទាំងអស់" → Row 2 collapse ស្វ័យប្រវត្តិ
  - Animation: slide-down/fade-in < 200ms
  - Edge case: Sub-category ទទេ → hide ពី Row 2
- Search bar
- List (Card/Row): ឈ្មោះ | តម្លៃ+ឯកតា | tap → 8.4
- Sort dropdown: តាមឈ្មោះ/តម្លៃ/ថ្មីបំផុត

**Component:** `<NestedFilterChips>` — reusable សម្រាប់ Screen 8.3 & 9.1

**Empty state:** "មិនទាន់មានគ្រឿងផ្សំក្នុងស្តុក" + Button "បន្ថែមឥឡូវនេះ"

## 6. Screen 8.4 — Ingredient Detail / Edit
**Stories:** US-35, US-36

- Header: Back, Title = ឈ្មោះ, "⋮" menu
- Editable: តម្លៃ, ឯកតា, Category
- Button "រក្សាទុកការផ្លាស់ប្តូរ"

**"⋮" Menu:**
- "លាក់ចេញពីស្តុក (Archive)" (US-35) → confirm toast + Undo
- "លុបចោលទាំងស្រុង (Delete)" (US-36) → Confirm Modal ក្រហម
  - Business rule (confirm with Dev): ប្រសិនបើ Ingredient កំពុងប្រើក្នុង Dish ណាមួយ → Block ការលុប, បង្ហាញ warning "មិនអាចលុបបានទេ ព្រោះកំពុងប្រើក្នុង [X] មុខម្ហូប"

## 7. Component Checklist
- `<TreeViewGroup>` (2-level), `<InlineCreateInput>`, `<UnitConversionModal>`, `<NestedFilterChips>`, `<StockListRow>`

## 8. Mobile-Specific Notes
- Tree View chevron touch target ធំគ្រប់គ្រាន់
- Numeric price input `inputmode="decimal"`, auto-format ពេល blur
- Sticky footer button មិនត្រូវលាក់ក្រោម keyboard
- Filter Chips scroll snap សម្រាប់ touch feel ស្រួល

---

# Epic 9-10: Dish/Recipe & Menu Set Management

## 1. User Flow Overview

```
[Dashboard] → [Dish List] → [Create Dish] → [Select Ingredients] → [Set Quantity] → [Save] → [Dish Detail]
[Dish List] → [Tap Dish] → [Edit] / [Duplicate] / [Archive]
[Dashboard] → [Menu Set List] → [Create Menu Set] → [Tab Selector] → [Real-time Total] → [Save]
```

## 2. Screen 9.1 — Dish List
**Stories:** US-43, US-44

- Header: "មុខម្ហូបរបស់ខ្ញុំ", FAB (+)
- Filter Chips (reuse `<NestedFilterChips>` ប្រសិនបើ Dish ក៏មាន category hierarchy)
- Toggle View: List ⇄ Grid/Card (US-44)
- List view: ឈ្មោះ | ថ្លៃដើមសរុប | Chevron; Grid view: 2-column card ជាមួយរូបភាព

**Empty state:** "មិនទាន់មានមុខម្ហូប" + Button "បង្កើតមុខម្ហូបដំបូង"

## 3. Screen 9.2 — Create/Edit Dish
**Stories:** US-37, US-39

- Input ឈ្មោះម្ហូប, Photo upload (optional), Dropdown Category
- Section "គ្រឿងផ្សំ": Button "+ បន្ថែមគ្រឿងផ្សំ" → Screen 9.3
- List ingredients ដែលបានជ្រើស: ឈ្មោះ | Input Quantity | Unit label | ❌ remove
- Sticky Footer: "ថ្លៃដើមសរុប: $X.XX" (real-time)
- Button "រក្សាទុក"

**States:** Quantity 0/empty → warning; block save ប្រសិនបើមិនពេញ

## 4. Screen 9.3 — Ingredient Picker (from Stock)
**Story:** US-37 (sub-flow)

- Search bar, Filter Chips (reuse Epic 8), Checkbox multi-select ពី Stock
- Sticky Footer: "បានជ្រើសរើស (3)" + Button "បន្ថែម →"
- Edge case: Stock ទទេ → CTA "ទៅបន្ថែមគ្រឿងផ្សំមុន" → Screen 8.1

## 5. Screen 9.4 — Dish Detail & Cost Breakdown
**Story:** US-38

- Summary card: "ថ្លៃដើមសរុប: $X.XX"
- Cost Breakdown Table: គ្រឿងផ្សំ | បរិមាណ | តម្លៃឯកតា | សរុប (highlight row ខ្ពស់បំផុត)
- "⋮" Menu: "កែប្រែ" | "ចម្លង (Duplicate)" (US-40, suffix "(ចម្លង)") | "លាក់/លុប" (US-41)

## 6. Screen 9.5 — Auto-Update (US-42) — System Behavior
- Toast non-blocking: "បានធ្វើបច្ចុប្បន្នភាពថ្លៃដើមលើ 3 មុខម្ហូប"
- Dish List reflect តម្លៃថ្មី real-time

## 7. Screen 10.1 — Menu Set List
**Story:** US-45

- Header "កញ្ចប់ម៉ឺនុយ", FAB (+); List/Card: ឈ្មោះ | ចំនួនមុខម្ហូប | ថ្លៃដើមសរុប

## 8. Screen 10.2 — Create/Edit Menu Set (Mobile-adapted Tab-switch)
**Stories:** US-45, US-46, US-47, US-48, US-49

**Mobile adaptation note:** True two-pane (Desktop) → ជំនួសដោយ **Tab-switch pattern** សម្រាប់ Mobile។

- Header: Input ឈ្មោះ Menu Set (inline editable)
- Tab bar: "បញ្ជីទាំងអស់" | "ក្នុងកញ្ចប់ (Selected: 5)"
- Tab All Dishes: List ជាមួយ Button "+" តូចជាប់ row ម្ហូបនីមួយៗ → tap → "✓ បានបន្ថែម" ភ្លាមៗ (ជំនួស drag&drop)
- Tab Selected: Reorder ដោយ long-press + drag handle (⠿); Swipe-to-remove
- Sticky Footer: "ថ្លៃដើមសរុប: $XX.XX" — animate/pulse ពេលផ្លាស់ប្តូរ (US-49); Button "រក្សាទុក"

**⚠️ ត្រូវ confirm ជាមួយ Client:** Pattern "Tap-to-add + Tab switch" ជំនួស Drag & Drop 2-column ព្រោះមូលហេតុ touch-conflict លើ Mobile

## 9. Screen 10.3 — Menu Set Detail
**Story:** US-47

- List មុខម្ហូបក្នុងកញ្ចប់ (read view), Total cost summary, Button "កែប្រែកញ្ចប់" → 10.2

## 10. Component Checklist
- `<DishCard>` (List/Grid), `<CostBreakdownTable>`, `<StickyTotalBar>`, `<TabSwitcher>`, `<DragHandleRow>`, `<ViewToggle>`

## 11. Mobile-Specific Notes
- Drag-to-reorder ប្រើ library គាំទ្រ touch events
- Tap-to-add feedback < 100ms (haptic/visual)
- Cost animation subtle, មិន distract
- Photo upload compress client-side

---

# Epic 11-12: Event Management, Cost Calculation, Dashboard & Procurement
*(Shopping List ធ្វើបច្ចុប្បន្នភាពតាម Sub-Category)*

## 1. User Flow Overview

```
[Dashboard] → [Event List] → [Create Event] → [Add Dishes/Menu Sets] → [Cost Calculation/Shopping List]
   → [Vendor Preset] → [Filter by Vendor] → [Quick Edit] → [Generate PDF/Excel]
   → [Procurement Checklist] → [Check-off]
```

## 2. Screen 11.1 — Dashboard (Home)
**Story:** US-54

- Header: ស្វាគមន៍ + Trial/Plan badge
- Summary Cards: "Event ខែនេះ", "ចំណាយសរុបខែនេះ", "មុខម្ហូបសរុប"
- Section "កម្មវិធីជិតមកដល់"
- Bottom Nav: 🏠Home | 🥕Stock | 🍜Dishes | 📅Events | ⚙️More

## 3. Screen 11.2 — Event List
**Story:** US-50

- Filter tabs: "កំពុងមក" | "កន្លងទៅ" | "ទាំងអស់"
- Card: ឈ្មោះ | កាលបរិច្ឆេទ | ចំនួនតុ | Status

## 4. Screen 11.3 — Create/Edit Event
**Story:** US-50

- Input ឈ្មោះ Event, Date picker (native), Input ចំនួនតុ, Button "រក្សាទុក"

## 5. Screen 11.4 — Event Detail
**Stories:** US-51, US-52

- Tabs: "មុខម្ហូប" | "ការគណនាចំណាយ" | "បញ្ជីទិញ"
- Tab Dishes: Button "+ បន្ថែមមុខម្ហូប" (ជ្រើសម្ហូបទោល ឬ Menu Set ទាំងមូល)
- "⋮" Menu: "ចម្លង Event (Clone)" (US-51, suffix "(ចម្លង)") | "លុប/Archive"

## 6. Screen 11.5 — Event Cost Calculation & Shopping List (2-Level Grouping)
**Story:** US-53 (Extended for Sub-Category)

**Auto-Aggregated Shopping List:**
```
▼ សាច់ (Parent)              សរុប: $45.00
    ▼ សាច់មាន់ (Sub)          $25.00
        សាច់មាន់ទាំងខ្លួន — 5kg      $12.50
        ស្លាបមាន់ — 3kg              $12.50
    ▼ សាច់ជ្រូក (Sub)          $20.00
▶ បន្លែ                       $18.00
```

- Level 1 (Parent): សរុបរួមនៃគ្រប់ Sub-category ខាងក្រោម
- Level 2 (Sub): សរុបរងនៃ ingredient
- Level 3: បរិមាណ (× ចំនួនតុ) + តម្លៃប៉ាន់ស្មាន

**Default Expand:** Parent expanded ជាមុន; Sub expanded ប្រសិនបើ list សរុប ≤ ~15 items, បើវែងជាងនេះ auto-collapse Sub

**Interaction:** Tap Parent/Sub header → expand/collapse (read-only view, មិនមែន picker)

**Toggle View:** "តាមក្រុម (Grouped)" ⇄ "តាមបញ្ជីរាប (Flat List)"

**Edge case:** Ingredient ស្ទួនគ្នាពីម្ហូបផ្សេងគ្នា → merge ជាជួរតែមួយក្នុង Sub-category ដដែល

**⚙️ Technical Note:** Group តាម `sub_category_id`, roll-up sum ទៅ `parent_category_id`។ Sort តាមតម្លៃធំទៅតូចលើ Parent level។

## 7. Screen 11.6 — Vendor Presets (Template Manager)
**Story:** US-55

- Dropdown "Template: [ម៉ូយសាច់ ▾]" + "+ បង្កើត Template ថ្មី"
- Modal: Input ឈ្មោះ Template, Checkbox list Category/Ingredient, Button "រក្សាទុក"
- Icons `[✏️ Edit]` `[🗑️ Delete]` ជាប់ template នីមួយៗ

## 8. Screen 11.7 — Shopping List View (Filtered) + Quick Edit
**Stories:** US-56, US-57

- Dropdown Template selector
- List filtered តាម Template (reuse `<AggregatedListGroup>` ពី 11.5)
- Toggle "កែប្រែ" → Quick Edit mode: Swipe-delete item (មិនប៉ះពាល់ Template ដើម), "+ បន្ថែមធាតុ" inline
- Sticky Footer: "បង្កើត PDF" + "នាំចេញ Excel"

## 9. Screen 11.8 — Generate PDF Report (Preview)
**Story:** US-58

- Preview A4 (scaled, scrollable)
- បង្ហាញតែ: ឈ្មោះគ្រឿងផ្សំ + ចំនួន (**លាក់តម្លៃដាច់ខាត** — Business secret)
- Button "Download PDF" → native Share Sheet

## 10. Screen 11.9 — Export Excel/CSV
**Story:** US-59

- Modal ជ្រើសរើស Scope: "Event នេះប៉ុណ្ណោះ" / "របាយការណ៍ខែនេះទាំងអស់"
- Generate → Share Sheet
- Note: "ឯកសារនេះមានលម្អិតតម្លៃពេញលេញ (មិនលាក់ដូច PDF)"

## 11. Screen 12.1 — Procurement Checklist (Check-off)
**Story:** US-60

- Progress Bar: "បានទិញ 8/15"
- List grouped by Category: Large touch checkbox | ឈ្មោះ + បរិមាណ
- Check → dimmed + strikethrough, row រុញទៅបាត់ List, bounce animation
- Filter: "មិនទាន់ទិញ" / "ទាំងអស់"; Un-tick reversible

## 12. Component Checklist
- `<BottomNavBar>`, `<SummaryStatCard>`, `<EventCard>`, `<TabSwitcher>`, `<AggregatedListGroup>` (2-level), `<TemplateDropdownManager>`, `<ProgressBar>`, `<CheckoffRow>`, `<PDFPreviewFrame>`

## 13. Mobile-Specific Notes
- Bottom Nav fixed, safe-area padding (notch/home indicator)
- Checkbox min 44×44px (Procurement — ជាធម្មតាកាន់ដៃម្ខាង)
- PDF/Excel generation បង្ហាញ progress toast
- Date picker ប្រើ native `<input type="date">`
- Tab switcher horizontal swipe-able

---

# Open Items / ចំណុចដែលត្រូវ Confirm បន្ថែមជាមួយ Client ឬ Dev
1. **Epic 7-8:** Depth limit Category គ្រាន់តែ 2 level (Parent → Sub); Ingredient assign ទៅ Sub តែមួយ (មិន assign ចូល Parent ដោយផ្ទាល់ ប្រសិនបើមាន Sub រួច) — ត្រូវ business confirm
2. **Epic 8.4:** Business rule ពេល Delete Ingredient ដែលកំពុងប្រើក្នុង Dish — Block ឬអនុញ្ញាតជាមួយ warning?
3. **Epic 10.2:** ត្រូវ confirm ជាមួយ Client ថាព្រមទទួលយក pattern "Tap-to-add + Tab switch" ជំនួស Drag & Drop 2-column លើ Mobile
4. **Epic 8.3/9.1 Filter Chips:** Confirm pattern Nested Chips (Row 2 inline) ជំនួស Bottom-sheet modal, ទោះជា Sub-category list វែង (10+)