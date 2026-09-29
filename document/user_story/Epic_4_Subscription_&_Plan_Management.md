## Epic 4: Subscription & Plan Management

*   **US-12: Auto-Start Free Trial**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ទទួលបានការសាកល្បងប្រើប្រាស់ឥតគិតថ្លៃ (Free Trial) ដោយស្វ័យប្រវត្តិបន្ទាប់ពីចុះឈ្មោះរួច**, ដើម្បី **ខ្ញុំអាចសាកល្បងបញ្ចូលគ្រឿងផ្សំ និងគណនាថ្លៃដើមជាក់ស្តែងរបស់ខ្ញុំសិន មុននឹងសម្រេចចិត្តបង់លុយទិញ**។

    *   **Acceptance Criteria:**

        **Scenario 1: Free Trial ចាប់ផ្តើមស្វ័យប្រវត្តិបន្ទាប់ពី Register**
        - **Given** ចុងភៅ ទើបបញ្ចប់ការចុះឈ្មោះ និង Verify Email ជោគជ័យ
        - **When** ចុងភៅ Login ចូលប្រព័ន្ធជាលើកដំបូង
        - **Then** ប្រព័ន្ធកំណត់ Subscription Status ជា `trial` ដោយស្វ័យប្រវត្តិ ព្រមទាំងកំណត់ Trial End Date (ឧ. +14 ថ្ងៃ) ដោយ ចុងភៅ មិនចាំបាច់វាយបញ្ចូល Payment Info

        **Scenario 2: ចុងភៅ ប្រើប្រាស់មុខងារពេញលេញកំឡុងពេល Trial**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `trial` ហើយមិនទាន់ផុតកំណត់
        - **When** ចុងភៅ ប្រើប្រាស់មុខងារកម្រិតខ្ពស់ណាមួយរបស់ប្រព័ន្ធ
        - **Then** ប្រព័ន្ធអនុញ្ញាតឱ្យប្រើប្រាស់ពេញលេញ ដូចអ្នកជាវកញ្ចប់ត្រូវប្រាក់ដែរ

        **Scenario 3: ចុងភៅ មិនអាចទទួល Free Trial ដដែលម្តងទៀត**
        - **Given** Account របស់ ចុងភៅ ធ្លាប់ទទួល ឬបញ្ចប់ Free Trial រួចហើយ
        - **When** ចុងភៅ ព្យាយាមរក Option "Start Free Trial" ម្តងទៀត (ឧ. តាមរយៈ Support ឬ Bug)
        - **Then** ប្រព័ន្ធរារាំង ព្រោះ Field កត់ត្រា `trial_used = true` ជាអចិន្ត្រៃយ៍ភ្ជាប់ជាមួយ Account

    *   **Technical Notes:**
        - Field `subscription_status` (`trial` / `active` / `expired` / `canceled`), `trial_start_date`, `trial_end_date`, និង `trial_used` (Boolean, permanent flag) ត្រូវបន្ថែមក្នុង ចុងភៅ/Account Table
        - ត្រូវប្រើ Scheduled Job (Cron) ពិនិត្យ Trial ដែលផុតកំណត់ជារៀងរាល់ថ្ងៃ ដើម្បីប្តូរ Status ទៅ `expired` ស្វ័យប្រវត្តិ
        - `trial_used` ត្រូវចងភ្ជាប់ទៅ Account (មិនមែន Email/Device) ដើម្បីជៀសវាងការបង្កើត Account ថ្មីដើម្បីទាញ Trial ឡើងវិញ

---

*   **US-13: View Pricing & Plans**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលឃើញតារាងតម្លៃកញ្ចប់សេវាកម្ម និងជម្រើសបង់ប្រាក់ (ខែ/ឆ្នាំ)**, ដើម្បី **អាចប្រៀបធៀប និងស្វែងយល់ពីអត្ថប្រយោជន៍នៃកញ្ចប់នីមួយៗ**។

    *   **Acceptance Criteria:**

        **Scenario 1: មើលតារាងតម្លៃជោគជ័យ**
        - **Given** ចុងភៅ ចូលទំព័រ "Pricing/Plans"
        - **When** ទំព័រ Load ចប់
        - **Then** ប្រព័ន្ធបង្ហាញកញ្ចប់សេវាកម្មទាំងអស់ ព្រមទាំងលក្ខណៈពិសេស (Features), តម្លៃខែ, និងតម្លៃឆ្នាំរបស់កញ្ចប់នីមួយៗ

        **Scenario 2: ប្តូររវាង Monthly/Yearly Toggle**
        - **Given** ចុងភៅ កំពុងមើលតារាងតម្លៃដែលបង្ហាញជា Monthly
        - **When** ចុងភៅ ចុច Toggle ប្តូរទៅ "Yearly"
        - **Then** តម្លៃទាំងអស់ក្នុងតារាងផ្លាស់ប្តូរបង្ហាញជាតម្លៃឆ្នាំភ្លាមៗ (រួមទាំង % បញ្ចុះតម្លៃ ប្រសិនបើមាន)

        **Scenario 3: រំលេច Recommended Plan**
        - **Given** មានកញ្ចប់មួយក្នុងចំណោមទាំងអស់ត្រូវបានកំណត់ជា Recommended
        - **When** ចុងភៅ មើលតារាងតម្លៃ
        - **Then** កញ្ចប់នោះត្រូវបានរំលេចដោយ Visual (ឧ. Border ពណ៌ ឬ Badge "Recommended") ខុសពីកញ្ចប់ផ្សេងទៀត

    *   **Technical Notes:**
        - Plan Data (ឈ្មោះ, តម្លៃ, Feature List, `is_recommended`) គួររក្សាទុកក្នុង Database ឬ Config ដាច់ដោយឡែក ដើម្បីឱ្យ Admin កែប្រែតម្លៃបានដោយមិនចាំបាច់ Deploy Code ថ្មី
        - Feature List របស់កញ្ចប់ត្រូវផ្គូផ្គងជាមួយ i18n Framework (Epic 1)

---

*   **US-14: Upgrade / Start Paid Subscription**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចជ្រើសរើសកញ្ចប់ និងធ្វើការបង់ប្រាក់ (Subscribe) ភ្លាមៗ ឬក្រោយពេលចប់ Free Trial**, ដើម្បី **បន្តសិទ្ធិប្រើប្រាស់មុខងារទាំងអស់របស់ប្រព័ន្ធដោយគ្មានការរំខាន**។

    *   **Acceptance Criteria:**

        **Scenario 1: Subscribe ជោគជ័យ**
        - **Given** ចុងភៅ ជ្រើសរើសកញ្ចប់ និងវិធីបង់ប្រាក់រួច
        - **When** ចុងភៅ បំពេញព័ត៌មានទូទាត់ត្រឹមត្រូវ ហើយបញ្ជាក់ការទូទាត់ជោគជ័យតាម Payment Gateway
        - **Then** ប្រព័ន្ធប្តូរ Subscription Status ទៅ `active` ភ្លាមៗ ហើយផ្ញើ Receipt/Invoice តាមអ៊ីមែល

        **Scenario 2: ការទូទាត់បរាជ័យ**
        - **Given** ចុងភៅ កំពុងព្យាយាមទូទាត់ប្រាក់
        - **When** Payment Gateway ត្រឡប់លទ្ធផលបរាជ័យ (ឧ. Card ត្រូវបានបដិសេធ)
        - **Then** ប្រព័ន្ធបង្ហាញ Error ជូនដំណឹង ហើយ Subscription Status មិនផ្លាស់ប្តូរ (ចុងភៅ អាចព្យាយាមម្តងទៀត)

        **Scenario 3: Upgrade ពី Trial ទៅ Paid មុនផុតកំណត់**
        - **Given** ចុងភៅ កំពុងស្ថិតក្នុងស្ថានភាព `trial` ហើយនៅសល់ថ្ងៃ
        - **When** ចុងភៅ ជ្រើសរើសកញ្ចប់ ហើយទូទាត់ប្រាក់ជោគជ័យ
        - **Then** ប្រព័ន្ធប្តូរ Status ភ្លាមទៅ `active` ដោយបញ្ចប់ Trial ជាមុន (មិនរង់ចាំដល់ Trial ផុតកំណត់)

    *   **Technical Notes:**
        - ត្រូវរួមបញ្ចូល Payment Gateway (ឧ. Stripe, ABA PayWay, ឬ PayPal អាស្រ័យលើទីផ្សារ Cambodia) តាមរយៈ Secure API/SDK, មិនរក្សាទុក Card Data ដោយផ្ទាល់ក្នុង Server ខ្លួនឯង (PCI Compliance)
        - ត្រូវប្រើ Webhook ពី Payment Gateway ដើម្បីបញ្ជាក់ស្ថានភាពទូទាត់ (Confirm/Failed) ជាជាង Trust Response ពី Client
        - Log ប្រតិបត្តិការទូទាត់ទាំងអស់ (Success/Failed) ក្នុង Table `payment_transactions` សម្រាប់ Audit/Support

---

*   **US-15: View Current Trial / Subscription Status**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលឃើញច្បាស់ថាតើ Free Trial នៅសល់ប៉ុន្មានថ្ងៃ ឬកញ្ចប់របស់ខ្ញុំផុតកំណត់ថ្ងៃណា**, ដើម្បី **ងាយស្រួលតាមដាន និងត្រៀមថវិកាសម្រាប់ការបន្តកញ្ចប់ (Renewal)**។

    *   **Acceptance Criteria:**

        **Scenario 1: មើលស្ថានភាព Trial**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `trial`
        - **When** ចុងភៅ ចូលទំព័រ Account/Billing Settings
        - **Then** ប្រព័ន្ធបង្ហាញចំនួនថ្ងៃនៅសល់នៃ Trial ឱ្យច្បាស់ (ឧ. "នៅសល់ 5 ថ្ងៃទៀត")

        **Scenario 2: មើលស្ថានភាព Active Subscription**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `active`
        - **When** ចុងភៅ ចូលទំព័រ Account/Billing Settings
        - **Then** ប្រព័ន្ធបង្ហាញឈ្មោះកញ្ចប់បច្ចុប្បន្ន, ថ្ងៃខែឆ្នាំបន្តកញ្ចប់ (Renewal Date) បន្ទាប់

        **Scenario 3: ជូនដំណឹងជាមុនមុន Trial/Subscription ជិតផុតកំណត់**
        - **Given** Trial ឬ Subscription របស់ ចុងភៅ នៅសល់តិចជាង 3 ថ្ងៃ
        - **When** ចុងភៅ Login ចូលប្រព័ន្ធ
        - **Then** ប្រព័ន្ធបង្ហាញ Notification/Banner រំលឹកអំពីកាលបរិច្ឆេទជិតដល់ ព្រមទាំង Link ទៅទំព័រ Upgrade

    *   **Technical Notes:**
        - គណនាចំនួនថ្ងៃនៅសល់ពី `trial_end_date`/`subscription_end_date` ធៀបនឹងកាលបរិច្ឆេទបច្ចុប្បន្ន (Server-side, ជៀសវាង Client Clock Manipulation)
        - Notification Banner គួរបង្ហាញតាម Threshold ដែលកំណត់បាន (Configurable, ឧ. 3 ថ្ងៃ) មិនមែន Hardcode

---

*   **US-16: Cancel Subscription (Auto-renewal)**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចលុបចោលការបន្តកញ្ចប់សេវាកម្មដោយស្វ័យប្រវត្តិដោយខ្លួនឯង**, ដើម្បី **បញ្ឈប់ការគិតប្រាក់នៅវដ្តបន្ទាប់ ក្នុងករណីដែលខ្ញុំមិនចង់បន្តប្រើប្រាស់ទៀត**។

    *   **Acceptance Criteria:**

        **Scenario 1: Cancel Auto-renewal ជោគជ័យ**
        - **Given** ចុងភៅ មាន Subscription `active` ជាមួយ Auto-renewal Enabled
        - **When** ចុងភៅ ចុច "Cancel Subscription" ហើយបញ្ជាក់ (Confirm)
        - **Then** ប្រព័ន្ធបិទ Auto-renewal ប៉ុន្តែ ចុងភៅ នៅតែប្រើប្រាស់មុខងារពេញលេញបានរហូតដល់ Subscription End Date ដើម

        **Scenario 2: ស្ថានភាពក្រោយផុតកំណត់ (Post-cancellation)**
        - **Given** ចុងភៅ បាន Cancel Auto-renewal ហើយកាលបរិច្ឆេទបច្ចុប្បន្នដល់ Subscription End Date
        - **When** ថ្ងៃនោះមកដល់
        - **Then** ប្រព័ន្ធប្តូរ Status ទៅ `expired` ស្វ័យប្រវត្តិ (ភ្ជាប់ទៅ US-17 Graceful Lockout)

        **Scenario 3: Re-activate Auto-renewal មុនផុតកំណត់**
        - **Given** ចុងភៅ ធ្លាប់ Cancel Auto-renewal ប៉ុន្តែ Subscription ចាស់នៅមិនទាន់ផុតកំណត់
        - **When** ចុងភៅ ចុច "Resume Subscription" / "Re-enable Auto-renewal"
        - **Then** ប្រព័ន្ធបើក Auto-renewal ឡើងវិញ ដោយមិនចាំបាច់ទូទាត់ប្រាក់ភ្លាមៗ (គិតលុយវដ្តបន្ទាប់ដូចធម្មតា)

    *   **Technical Notes:**
        - Cancel មិនមែនលុប Subscription ភ្លាមៗ គ្រាន់តែកំណត់ Field `auto_renew = false` រក្សា Access រហូតដល់ `subscription_end_date`
        - ត្រូវ Sync ស្ថានភាព Cancel ជាមួយ Payment Gateway ផងដែរ (ឧ. Stripe Subscription Cancel API) ដើម្បីកុំឱ្យគិតលុយវដ្តបន្ទាប់

---

*   **US-17: Graceful Lockout (Expired Subscription)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឱ្យប្រព័ន្ធគ្រាន់តែ "ចាក់សោ (Lock)" មុខងារកម្រិតខ្ពស់ ពេលកញ្ចប់ខ្ញុំផុតកំណត់ ដោយមិនលុបទិន្នន័យខ្ញុំចោលឡើយ**, ដើម្បី **ខ្ញុំអាចត្រលប់មកបង់ប្រាក់បើកសិទ្ធិប្រើប្រាស់វិញនៅពេលក្រោយដោយសុវត្ថិភាព**។

    *   **Acceptance Criteria:**

        **Scenario 1: ចាក់សោមុខងារពេល Subscription ផុតកំណត់**
        - **Given** Subscription/Trial របស់ ចុងភៅ ផុតកំណត់ (Status = `expired`)
        - **When** ចុងភៅ Login ចូលប្រព័ន្ធ
        - **Then** ប្រព័ន្ធបង្ហាញផ្ទាំងសាររួសរាយ (មិនមែន Error Page) ជូនដំណឹងអំពីការផុតកំណត់ ព្រមទាំង Call-to-Action ឱ្យទៅទំព័រ Upgrade

        **Scenario 2: ទិន្នន័យមិនត្រូវបានលុប**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `expired`
        - **When** ចុងភៅ (ឬ Admin) ពិនិត្យទិន្នន័យដែលធ្លាប់បញ្ចូល (Ingredient, Recipe, Order)
        - **Then** ទិន្នន័យទាំងអស់នៅតែមានគ្រប់ (View-only) មិនត្រូវបានលុបចោល

        **Scenario 3: ចុងភៅ ព្យាយាមប្រើមុខងារកម្រិតខ្ពស់ខណៈ Expired**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `expired`
        - **When** ចុងភៅ ចុចប្រើមុខងារកម្រិតខ្ពស់ (ឧ. បង្កើត Recipe ថ្មី, គណនាតារាង)
        - **Then** ប្រព័ន្ធរារាំង Action នោះ ហើយបង្ហាញ Modal/Popup ណែនាំឱ្យ Upgrade ជាជាង Error ធម្មតា

        **Scenario 4: ចុងភៅ ត្រលប់មក Subscribe វិញបន្ទាប់ពី Expired**
        - **Given** ចុងភៅ ស្ថិតក្នុងស្ថានភាព `expired` ជាយូរមកហើយ
        - **When** ចុងភៅ ជ្រើសរើសកញ្ចប់ និងទូទាត់ប្រាក់ជោគជ័យ
        - **Then** ប្រព័ន្ធប្តូរ Status ទៅ `active` ភ្លាមៗ ហើយ ចុងភៅ អាចចូលប្រើប្រាស់ទិន្នន័យចាស់ទាំងអស់ (ដែលមិនធ្លាប់ត្រូវបានលុប) បានដូចដើម

    *   **Technical Notes:**
        - ត្រូវប្រើ Middleware/Guard ត្រួតពិនិត្យ `subscription_status` នៅ Backend មុនអនុញ្ញាតឱ្យ Access API កម្រិតខ្ពស់ណាមួយ (មិនត្រូវពឹងផ្អែកលើ Frontend Check តែម្នាក់ឯង)
        - Read-only Mode ត្រូវអនុញ្ញាតឱ្យ View/Export ទិន្នន័យចាស់បាន ប៉ុន្តែរារាំង Create/Update/Delete
        - UI Empty/Locked State ត្រូវរចនាឱ្យរួសរាយ (Friendly Illustration/Message) មិនមែន Generic 403/500 Error Page ស្របតាម UI/UX Note ដែលបានផ្តល់

---