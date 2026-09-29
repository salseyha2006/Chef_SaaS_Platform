## Epic 6: Billing & Transaction History

*   **US-22: View Transaction History**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលប្រវត្តិការបង់ថ្លៃទាំងអស់ (Billing និង Payment)**, ដើម្បី **ត្រួតពិនិត្យ និងតាមដានរាល់ចំណាយលើកញ្ចប់សេវាកម្មរបស់ខ្ញុំ**។

    *   **Acceptance Criteria:**

        **Scenario 1: មើលបញ្ជីប្រវត្តិការបង់ថ្លៃជោគជ័យ**
        - **Given** ចុងភៅ មានប្រតិបត្តិការទូទាត់យ៉ាងតិចមួយក្នុងអតីតកាល
        - **When** ចុងភៅ ចូលទំព័រ "Billing History"
        - **Then** ប្រព័ន្ធបង្ហាញបញ្ជីប្រតិបត្តិការទាំងអស់តាមលំដាប់ថ្មីទៅចាស់ ព្រមទាំងព័ត៌មានសង្ខេប (កាលបរិច្ឆេទ, ចំនួនទឹកប្រាក់, ស្ថានភាព)

        **Scenario 2: មិនទាន់មានប្រតិបត្តិការណាមួយ (Empty State)**
        - **Given** ចុងភៅ ថ្មីមិនទាន់ធ្លាប់ទូទាត់ប្រាក់ណាមួយឡើយ (ស្ថិតក្នុង Free Trial)
        - **When** ចុងភៅ ចូលទំព័រ "Billing History"
        - **Then** ប្រព័ន្ធបង្ហាញ Empty State សារឱ្យដឹងថាមិនទាន់មានប្រវត្តិការទូទាត់ ជាជាងតារាងទទេ

        **Scenario 3: ត្រង (Filter) ប្រតិបត្តិការតាមស្ថានភាព**
        - **Given** ចុងភៅ មានប្រតិបត្តិការច្រើនប្រភេទស្ថានភាព (Success, Failed, Refunded)
        - **When** ចុងភៅ ជ្រើសរើស Filter តាមស្ថានភាពជាក់លាក់ណាមួយ
        - **Then** បញ្ជីបង្ហាញតែប្រតិបត្តិការដែលត្រូវនឹងស្ថានភាពនោះ

        **Scenario 4: Pagination សម្រាប់ប្រតិបត្តិការច្រើន**
        - **Given** ចុងភៅ មានប្រតិបត្តិការច្រើនជាង 1 ទំព័រ (ឧ. លើសពី 20 ជួរ)
        - **When** ចុងភៅ Scroll ចុះក្រោម ឬចុច "Next Page"
        - **Then** ប្រព័ន្ធផ្ទុកបញ្ជីទំព័របន្ទាប់ ដោយមិនធ្វើឱ្យ Browser យឺត ឬ Crash

    *   **Technical Notes:**
        - Query ទាញយក Transaction History ត្រូវ Implement Pagination (ឧ. Cursor-based ឬ Offset/Limit) នៅ Backend ជៀសវាងទាញទិន្នន័យទាំងអស់ម្តងតែម្តង
        - Table `payment_transactions` ត្រូវមាន Index លើ `ចុងភៅ_id` និង `created_at` ដើម្បីបង្កើនល្បឿន Query
        - Status Filter ត្រូវផ្គូផ្គងជាមួយ Enum Status ដែលកំណត់ស្រាប់ (`success`, `failed`, `refunded`)

---

*   **US-23: View Transaction Detail & Download Invoice**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលព័ត៌មានលម្អិតនៃប្រតិបត្តិការ និងទាញយកវិក្កយបត្រ (Invoice)**, ដើម្បី **រក្សាទុកជាឯកសារយោងសម្រាប់ការទូទាត់ចំណាយអាជីវកម្ម**។

    *   **Acceptance Criteria:**

        **Scenario 1: មើលព័ត៌មានលម្អិតជោគជ័យ**
        - **Given** ចុងភៅ នៅក្នុងបញ្ជី "Billing History"
        - **When** ចុងភៅ ចុចលើប្រតិបត្តិការណាមួយ
        - **Then** ប្រព័ន្ធបង្ហាញព័ត៌មានលម្អិត (Transaction ID, កញ្ចប់, វិធីបង់ប្រាក់ដែលប្រើ, ចំនួនទឹកប្រាក់, ថ្ងៃខែ, ស្ថានភាព)

        **Scenario 2: ទាញយក Invoice ជាទម្រង់ PDF ជោគជ័យ**
        - **Given** ចុងភៅ កំពុងមើលព័ត៌មានលម្អិតនៃប្រតិបត្តិការដែលជោគជ័យ (Status = `success`)
        - **When** ចុងភៅ ចុច "Download Invoice"
        - **Then** ប្រព័ន្ធទាញយក File PDF មាន Layout ត្រឹមត្រូវ (Logo, ព័ត៌មានហាង, ព័ត៌មានប្រតិបត្តិការ)

        **Scenario 3: ព្យាយាមទាញយក Invoice សម្រាប់ប្រតិបត្តិការបរាជ័យ**
        - **Given** ចុងភៅ កំពុងមើលព័ត៌មានលម្អិតនៃប្រតិបត្តិការដែលបរាជ័យ (Status = `failed`)
        - **When** ចុងភៅ មើលទំព័រនោះ
        - **Then** ប៊ូតុង "Download Invoice" មិនបង្ហាញ ឬត្រូវបានបិទ (Disabled) ព្រោះមិនមាន Invoice សម្រាប់ប្រតិបត្តិការមិនជោគជ័យ

    *   **Technical Notes:**
        - Invoice PDF ត្រូវបង្កើតតាម Template ស្ថិតស្ថេរ (Fixed Template) ដោយបញ្ចូល Dynamic Data ពី `payment_transactions` និង `invoices` Table
        - Endpoint ទាញយក Invoice ត្រូវផ្ទៀងផ្ទាត់សិទ្ធិម្ចាស់ (Authorization) ថា ចុងភៅ នេះជាម្ចាស់ប្រតិបត្តិការនោះមែន មុនអនុញ្ញាតឱ្យ Download
        - ត្រូវ Cache/Generate Invoice PDF ជាមុន (នៅពេលទូទាត់ជោគជ័យ) មិនមែន Generate រាល់ពេល Request ដើម្បីបង្កើនល្បឿន

---

*   **US-24: Update Billing Information**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **កែប្រែព័ត៌មានបង់ប្រាក់ (ឈ្មោះ និងអាសយដ្ឋានហាង)**, ដើម្បី **ធានាថាវិក្កយបត្រពេលក្រោយចេញមកបានត្រឹមត្រូវ**។

    *   **Acceptance Criteria:**

        **Scenario 1: កែប្រែព័ត៌មាន Billing ជោគជ័យ**
        - **Given** ចុងភៅ នៅទំព័រ "Billing Information Settings"
        - **When** ចុងភៅ កែឈ្មោះហាង/អាសយដ្ឋាន រួចចុច "Save"
        - **Then** ព័ត៌មានត្រូវបានធ្វើបច្ចុប្បន្នភាព ហើយ Invoice ថ្មីៗបន្ទាប់ពីនេះនឹងប្រើព័ត៌មានថ្មី

        **Scenario 2: Invoice ចាស់មិនផ្លាស់ប្តូរតាមព័ត៌មានថ្មី**
        - **Given** ចុងភៅ ធ្លាប់មាន Invoice ចេញរួចហើយ ជាមួយព័ត៌មានចាស់
        - **When** ចុងភៅ ធ្វើបច្ចុប្បន្នភាព Billing Information ថ្មី
        - **Then** Invoice ចាស់ដែលធ្លាប់ Generate រួច នៅតែបង្ហាញព័ត៌មានចាស់ដដែល (Snapshot) មិនប្តូរតាមព័ត៌មានថ្មី

        **Scenario 3: ទុក Field ចាំបាច់ជាទទេ**
        - **Given** ចុងភៅ កំពុងកែប្រែ Billing Information
        - **When** ចុងភៅ ទុក Field ចាំបាច់ (ឧ. ឈ្មោះហាង) ជាទទេ រួចចុច "Save"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ហើយមិន Save

    *   **Technical Notes:**
        - Billing Information (ឈ្មោះហាង, អាសយដ្ឋាន) ត្រូវរក្សាទុកដាច់ដោយឡែកពី ចុងភៅ Profile ក្នុង Table `billing_info` ភ្ជាប់ជាមួយ `ចុងភៅ_id`
        - Invoice ត្រូវ Snapshot ព័ត៌មាន Billing នៅពេលបង្កើត (Copy ទិន្នន័យចូលទៅក្នុង `invoices` Table ផ្ទាល់) មិនមែន Reference ទៅ `billing_info` ដោយផ្ទាល់ ដើម្បីរក្សា Integrity របស់ឯកសារពន្ធ/គណនេយ្យ

---

*   **US-25: Request Refund**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ស្នើសុំទាមទារប្រាក់មកវិញ (Refund) សម្រាប់ប្រតិបត្តិការណាមួយ**, ដើម្បី **ទទួលបានប្រាក់វិញក្នុងករណីមានការកាត់ប្រាក់ខុសប្រក្រតី**។

    *   **Acceptance Criteria:**

        **Scenario 1: ស្នើសុំ Refund ជោគជ័យ**
        - **Given** ចុងភៅ មើលព័ត៌មានលម្អិតនៃប្រតិបត្តិការដែលជោគជ័យ (Status = `success`) និងស្ថិតក្នុងលក្ខខណ្ឌអនុញ្ញាតឱ្យ Refund (ឧ. ក្នុងរយៈពេល 7 ថ្ងៃ)
        - **When** ចុងភៅ ចុច "Request Refund" ហើយបំពេញមូលហេតុ រួច Submit
        - **Then** ប្រព័ន្ធបង្កើត Refund Request ជាមួយ Status `pending` ហើយជូនដំណឹងទៅ Admin/Support ដើម្បីត្រួតពិនិត្យ

        **Scenario 2: ប្រតិបត្តិការហួសកាលកំណត់ស្នើសុំ Refund**
        - **Given** ប្រតិបត្តិការនោះកន្លងផុតកាលកំណត់ស្នើសុំ Refund (ឧ. លើសពី 7 ថ្ងៃ)
        - **When** ចុងភៅ ព្យាយាមចុច "Request Refund"
        - **Then** ប៊ូតុងមិនបង្ហាញ ឬបង្ហាញ Error ជូនដំណឹងអំពីលក្ខខណ្ឌពេលវេលា

        **Scenario 3: Admin អនុម័ត Refund**
        - **Given** Refund Request ស្ថិតក្នុងស្ថានភាព `pending`
        - **When** Admin ត្រួតពិនិត្យ ហើយចុច "Approve"
        - **Then** ប្រព័ន្ធហៅ Payment Gateway Refund API ដោយស្វ័យប្រវត្តិ, ប្តូរ Status ទៅ `refunded`, ហើយជូនដំណឹងទៅ ចុងភៅ ថាប្រាក់ត្រូវបានប្រគល់មកវិញ

        **Scenario 4: Admin បដិសេធ Refund**
        - **Given** Refund Request ស្ថិតក្នុងស្ថានភាព `pending`
        - **When** Admin ចុច "Reject" ព្រមទាំងបញ្ចូលមូលហេតុ
        - **Then** ប្រព័ន្ធប្តូរ Status ទៅ `rejected` ហើយជូនដំណឹងទៅ ចុងភៅ ព្រមទាំងមូលហេតុបដិសេធ

    *   **Technical Notes:**
        - Table `refund_requests` ត្រូវមាន Field `status` (`pending`/`approved`/`rejected`/`refunded`), `reason`, `reviewed_by` (Admin ID), `reviewed_at`
        - Refund Policy Window (ឧ. 7 ថ្ងៃ) ត្រូវកំណត់ជា Configurable Value មិនមែន Hardcode ក្នុង Code
        - ការហៅ Payment Gateway Refund API ត្រូវប្រើ Idempotency Key ដូចគ្នានឹង Payment Process ដើម្បីជៀសវាង Refund ស្ទួន
        - ត្រូវ Sync Subscription Access បន្ទាប់ពី Refund ជោគជ័យ (ឧ. ប្រសិនបើ Refund ពេញ Subscription អាចត្រូវប្តូរទៅ `expired`/`canceled` ភ្លាមៗ អាស្រ័យលើគោលការណ៍អាជីវកម្ម)

---