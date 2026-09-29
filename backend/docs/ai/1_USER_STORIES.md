## Epic 1: System Foundation & Localization
*(ចំណាំសម្រាប់ Dev: ត្រូវរៀបចំ i18n Framework សម្រាប់ភាសាតាំងពីថ្ងៃទី១)*

*   **US-01: Switch System Language (Khmer / English)**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចផ្លាស់ប្តូរភាសាប្រព័ន្ធរវាង ខ្មែរ និង អង់គ្លេស បានយ៉ាងងាយស្រួល**, ដើម្បី **ងាយស្រួលប្រើប្រាស់ប្រព័ន្ធជាភាសាដែលខ្ញុំស៊ាំ ឬអាចឱ្យបុគ្គលិកបរទេស និងខ្មែរប្រើប្រាស់ប្រព័ន្ធតែមួយបានដោយគ្មានឧបសគ្គ**។

    *   **Acceptance Criteria:**

        **Scenario 1: ប្តូរភាសាដោយជោគជ័យពីទំព័រ Login**
        - **Given** អ្នកប្រើប្រាស់កំពុងនៅទំព័រ Login ហើយប្រព័ន្ធកំពុងបង្ហាញជាភាសាខ្មែរ (default)
        - **When** អ្នកប្រើប្រាស់ចុចលើប៊ូតុងប្តូរភាសា ហើយជ្រើសរើស "English"
        - **Then** អត្ថបទទាំងអស់នៅលើទំព័រ Login (Label, Placeholder, Button, Error message) ត្រូវផ្លាស់ប្តូរទៅជាភាសាអង់គ្លេសភ្លាមៗ ដោយមិនចាំបាច់ Reload ទំព័រ

        **Scenario 2: ភាសាដែលបានជ្រើសរើសត្រូវរក្សាទុកបន្ទាប់ពី Login ចូលប្រព័ន្ធ**
        - **Given** អ្នកប្រើប្រាស់បានប្តូរភាសាទៅជា "English" នៅទំព័រ Login
        - **When** អ្នកប្រើប្រាស់ Login ចូលទៅក្នុងប្រព័ន្ធជោគជ័យ
        - **Then** គ្រប់ទំព័រខាងក្នុងប្រព័ន្ធ (Dashboard, Navigation Bar, Menu) ត្រូវបង្ហាញជាភាសាអង់គ្លេសដដែល

        **Scenario 3: ភាសាដែលបានជ្រើសរើសត្រូវរក្សាទុកសម្រាប់ Session/Login លើកក្រោយ**
        - **Given** អ្នកប្រើប្រាស់បានជ្រើសរើសភាសា "English" ហើយបាន Logout ចេញពីប្រព័ន្ធ
        - **When** អ្នកប្រើប្រាស់ Login ចូលម្តងទៀតនៅលើឧបករណ៍ (Browser) ដដែល
        - **Then** ប្រព័ន្ធត្រូវបង្ហាញជាភាសាអង់គ្លេស (ភាសាចុងក្រោយដែលបានជ្រើសរើស) ដោយស្វ័យប្រវត្តិ

        **Scenario 4: ទិន្នន័យដែលបុគ្គលិកបញ្ចូល (User Data) មិនត្រូវបានបកប្រែស្វ័យប្រវត្តិ**
        - **Given** ចុងភៅបានបញ្ចូលឈ្មោះម្ហូបជាភាសាខ្មែរ ឧ. "សម្លការីមាន់" ទុកក្នុងប្រព័ន្ធ
        - **When** អ្នកប្រើប្រាស់ (ណាមួយ) ប្តូរភាសាប្រព័ន្ធទៅជា "English"
        - **Then** ឈ្មោះម្ហូប "សម្លការីមាន់" ត្រូវបង្ហាញដដែលដោយមិនមានការបកប្រែជាភាសាអង់គ្លេស (មានតែ UI Label ជុំវិញប៉ុណ្ណោះដែលប្តូរ)

        **Scenario 5: ករណីមិនអាចផ្ទុកការកំណត់ភាសាបាន (Fallback)**
        - **Given** Browser របស់អ្នកប្រើប្រាស់មិនអនុញ្ញាតឱ្យរក្សាទុក Local Storage / Cookie (ឧ. Private Mode ដែលបិទ Storage)
        - **When** អ្នកប្រើប្រាស់ចូលទៅកាន់ប្រព័ន្ធជាលើកដំបូង
        - **Then** ប្រព័ន្ធត្រូវបង្ហាញភាសា Default (ខ្មែរ) ដោយមិនកើត Error ឬ Crash

    *   **Technical Notes:**
        - ត្រូវប្រើ i18n Library ស្តង់ដារតាម Stack ដែលជ្រើសរើស (ឧ. `react-i18next` សម្រាប់ React, `vue-i18n` សម្រាប់ Vue, ឬ `next-intl` សម្រាប់ Next.js)
        - រចនាសម្ព័ន្ធ Translation File ត្រូវញែកជា Namespace តាម Module (ឧ. `common.json`, `login.json`, `menu.json`) ដើម្បីងាយគ្រប់គ្រង និងបន្ថែមភាសាថ្មីនាពេលអនាគត
        - ភាសាដែលអ្នកប្រើប្រាស់ជ្រើសរើសត្រូវរក្សាទុកក្នុង `localStorage` (សម្រាប់ Guest/មុន Login) និងក្នុង User Profile នៅ Database (សម្រាប់ User ដែល Login រួច) ដើម្បីឱ្យ Sync បានឆ្លងកាត់ឧបករណ៍
        - Default language code: `km` (Khmer), Secondary: `en` (English) — កំណត់តាម ISO 639-1
        - គ្រប់ Static Text (Label, Button, Validation Message, Error Message) ត្រូវហាមចារឹកជាប់ (Hardcode) ក្នុង Component ដោយផ្ទាល់ តម្រូវឱ្យទាញចេញពី Translation Key ទាំងអស់
        - Field ដែលជា User-Generated Content (ឈ្មោះម្ហូប, ការពិពណ៌នា) ត្រូវរក្សាទុកជា Text ធម្មតា (មិនមែន Translation Key) ក្នុង Database column ដដែល ដោយមិនចាំបាច់មាន Column ញែកតាមភាសា
        - ត្រូវធ្វើ QA Checklist ពិនិត្យមើលករណី Text Overflow/Truncate ចំពោះពាក្យអង់គ្លេសវែងៗ ធៀបនឹងពាក្យខ្មែរខ្លីៗ (Layout Responsiveness)

---