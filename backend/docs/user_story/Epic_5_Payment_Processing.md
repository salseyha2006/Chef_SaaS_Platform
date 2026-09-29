## Epic 5: Payment Processing

*   **US-18: Select Payment Method**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ជ្រើសរើសមធ្យោបាយបង់ប្រាក់ (Visa/Mastercard, ABA PayWay, Wing)**, ដើម្បី **បង់ថ្លៃសេវាកម្មតាមមធ្យោបាយដែលខ្ញុំងាយស្រួល**។

    *   **Acceptance Criteria:**

        **Scenario 1: ជ្រើសរើស Payment Method ជោគជ័យ**
        - **Given** ចុងភៅ នៅទំព័រ Checkout/Subscribe
        - **When** ចុងភៅ ជ្រើសរើសមធ្យោបាយបង់ប្រាក់មួយក្នុងចំណោម Visa/Mastercard, ABA PayWay, ឬ Wing
        - **Then** ប្រព័ន្ធបង្ហាញ Form/Redirect ដែលត្រូវនឹងមធ្យោបាយនោះ (ឧ. Card Input Form សម្រាប់ Visa, Redirect ទៅ App សម្រាប់ ABA PayWay)

        **Scenario 2: រក្សាទុក Payment Method សម្រាប់លើកក្រោយ**
        - **Given** ចុងភៅ បញ្ចប់ទូទាត់ជាមួយ Card ជោគជ័យ ហើយបានយល់ព្រម Checkbox "Save this card"
        - **When** ចុងភៅ ត្រឡប់មក Subscribe/Renew ម្តងទៀតលើកក្រោយ
        - **Then** ប្រព័ន្ធបង្ហាញ Card ដែលធ្លាប់រក្សាទុក (បង្ហាញតែលេខ 4 ខ្ទង់ចុងក្រោយ) ជាជម្រើសរហ័ស ដោយមិនតម្រូវឱ្យវាយបញ្ចូលឡើងវិញ

        **Scenario 3: មិនមាន Payment Method ត្រូវបានជ្រើសរើស**
        - **Given** ចុងភៅ នៅទំព័រ Checkout
        - **When** ចុងភៅ ចុច "Confirm/Pay" ដោយមិនទាន់ជ្រើសរើសមធ្យោបាយបង់ប្រាក់
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Message ដោយមិនអនុញ្ញាតឱ្យបន្ត

    *   **Technical Notes:**
        - Card Information ត្រូវរក្សាទុកជា Token តាមរយៈ Payment Gateway (ឧ. Stripe Token/Vault) ជាដាច់ខាត មិនរក្សាទុក Card Number ពិតប្រាកដក្នុង Database ខ្លួនឯង (PCI-DSS Compliance)
        - Integration ត្រូវគាំទ្រច្រើន Provider (Stripe សម្រាប់ Visa/Mastercard, ABA PayWay API, Wing API) ដូច្នេះគួររចនា Payment Service ជា Abstraction Layer ដើម្បីងាយបន្ថែម Provider ថ្មីនាពេលអនាគត

---

*   **US-19: Process Payment (Auto-charge)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ប្រព័ន្ធ (System)**, ខ្ញុំចង់ **ដំណើរការកាត់ប្រាក់ដោយស្វ័យប្រវត្តិ**, ដើម្បី **គិតប្រាក់ពីចុងភៅតាមវដ្តនៃការបង់ប្រាក់នីមួយៗបានត្រឹមត្រូវទាន់ពេលវេលា**។

    *   **Acceptance Criteria:**

        **Scenario 1: Auto-charge ជោគជ័យនៅថ្ងៃបន្តកញ្ចប់**
        - **Given** ចុងភៅ មាន Subscription `active` ជាមួយ `auto_renew = true` និង Payment Method ត្រឹមត្រូវ
        - **When** ដល់កាលបរិច្ឆេទ Renewal (Scheduled Job ដំណើរការ)
        - **Then** ប្រព័ន្ធកាត់ប្រាក់ដោយស្វ័យប្រវត្តិតាមរយៈ Payment Gateway ហើយបន្ត `subscription_end_date` ទៅវដ្តបន្ទាប់ដោយស្វ័យប្រវត្តិ

        **Scenario 2: Auto-charge បរាជ័យ**
        - **Given** ដល់កាលបរិច្ឆេទ Renewal ប៉ុន្តែ Card របស់ ចុងភៅ ត្រូវបានបដិសេធ (ឧ. Card ផុតកំណត់, គ្មានសមតុល្យគ្រប់គ្រាន់)
        - **When** ប្រព័ន្ធព្យាយាមកាត់ប្រាក់
        - **Then** ប្រព័ន្ធកត់ត្រា Payment Status ជា `failed`, ជូនដំណឹងទៅ ចុងភៅ តាមអ៊ីមែលភ្លាមៗ, ហើយបើក Flow Retry (ភ្ជាប់ជាមួយ US-20)

        **Scenario 3: Job ដំណើរការស្ទួន (Idempotency)**
        - **Given** Scheduled Job សម្រាប់កាត់ប្រាក់មួយ Subscription ធ្លាប់ដំណើរការជោគជ័យរួចសម្រាប់វដ្តនោះ
        - **When** Job ដំណើរការឡើងវិញដោយចៃដន្យ (ឧ. Server Restart, Retry Mechanism) សម្រាប់វដ្តដដែល
        - **Then** ប្រព័ន្ធមិនកាត់ប្រាក់ស្ទួនម្តងទៀតទេ ដោយផ្អែកលើ Idempotency Key/ការត្រួតពិនិត្យប្រតិបត្តិការចុងក្រោយ

    *   **Technical Notes:**
        - ត្រូវប្រើ Scheduled Job/Cron ត្រួតពិនិត្យ Subscription ដែលដល់កាលកំណត់ជារៀងរាល់ថ្ងៃ ហើយហៅ Payment Gateway Charge API
        - ការហៅ Charge API ត្រូវប្រើ Idempotency Key ដើម្បីការពារការកាត់ប្រាក់ស្ទួន ក្នុងករណី Job ដំណើរការច្រើនដង
        - លទ្ធផលទាំងអស់ (Success/Failed) ត្រូវកត់ត្រាក្នុង Table `payment_transactions` ភ្ជាប់ជាមួយ `subscription_id`

---

*   **US-20: Retry Failed Payment**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មានឱកាសបង់ប្រាក់ម្តងទៀតនៅពេលការកាត់ប្រាក់លើកមុនបរាជ័យ**, ដើម្បី **រក្សាសិទ្ធិប្រើប្រាស់កញ្ចប់សេវាកម្មរបស់ខ្ញុំ កុំឱ្យរអាក់រអួល**។

    *   **Acceptance Criteria:**

        **Scenario 1: Retry ដោយស្វ័យប្រវត្តិ**
        - **Given** Auto-charge បរាជ័យលើកទី 1
        - **When** ប្រព័ន្ធព្យាយាមកាត់ប្រាក់ម្តងទៀតដោយស្វ័យប្រវត្តិតាមកាលកំណត់ (ឧ. 1 ថ្ងៃក្រោយ, 3 ថ្ងៃក្រោយ)
        - **Then** ប្រព័ន្ធព្យាយាមកាត់ប្រាក់ជាថ្មី ហើយបើជោគជ័យ Subscription ត្រូវបានបន្តភ្លាមៗ

        **Scenario 2: ចុងភៅ Retry ដោយដៃដោយប្តូរ Payment Method**
        - **Given** Payment Status ជា `failed` ហើយ ចុងភៅ ចង់ Retry ដោយខ្លួនឯង
        - **When** ចុងភៅ ចូល Billing Settings, ធ្វើបច្ចុប្បន្នភាព Payment Method ថ្មី ហើយចុច "Retry Payment"
        - **Then** ប្រព័ន្ធព្យាយាមកាត់ប្រាក់ភ្លាមៗជាមួយ Payment Method ថ្មី ហើយបើជោគជ័យ Subscription ត្រូវបានបន្ត

        **Scenario 3: Retry លើសចំនួនកំណត់ ហើយចូល Graceful Lockout**
        - **Given** ប្រព័ន្ធបាន Retry កាត់ប្រាក់លើសចំនួនកំណត់ (ឧ. 3 ដង) ដោយបរាជ័យទាំងអស់
        - **When** លើសកាលកំណត់ Retry ចុងក្រោយ
        - **Then** Subscription Status ប្តូរទៅ `expired` ស្វ័យប្រវត្តិ ហើយចូល Graceful Lockout (ភ្ជាប់ជាមួយ US-17)

    *   **Technical Notes:**
        - Retry Schedule ត្រូវកំណត់ជា Configurable (ចំនួនដង, ចន្លោះពេលរវាងការ Retry) មិនមែន Hardcode
        - Notification (Email/In-app) ត្រូវផ្ញើរាល់ពេល Retry បរាជ័យ ដើម្បីជម្រុញ ចុងភៅ ឱ្យធ្វើសកម្មភាព (Update Card)
        - Retry Attempt Count ត្រូវកត់ត្រា Field `retry_count` ភ្ជាប់ជាមួយ Subscription/Payment Cycle បច្ចុប្បន្ន ហើយ Reset ពេលចាប់ផ្តើមវដ្តថ្មី

---

*   **US-21: Payment Confirmation**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ទទួលបានការបញ្ជាក់ (Email & Success Message) នៅពេលបង់ប្រាក់ជោគជ័យ**, ដើម្បី **មានឯកសារយោង និងស្ងប់ចិត្តថាការបង់ប្រាក់ត្រូវបានទទួលស្គាល់**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្ហាញ Success Message ភ្លាមៗ**
        - **Given** ចុងភៅ ទើបទូទាត់ប្រាក់ជោគជ័យ (Manual ឬ Auto-charge)
        - **When** Payment Gateway បញ្ជាក់ Transaction ជោគជ័យ
        - **Then** ប្រព័ន្ធបង្ហាញ Success Screen/Message ភ្លាមៗ ព្រមទាំងព័ត៌មានសង្ខេប (កញ្ចប់, ចំនួនទឹកប្រាក់, កាលបរិច្ឆេទបន្ត)

        **Scenario 2: ផ្ញើ Email Receipt/Invoice**
        - **Given** ការទូទាត់ត្រូវបានបញ្ជាក់ជោគជ័យ
        - **When** ប្រព័ន្ធដំណើរការចប់ Transaction
        - **Then** Email Receipt/Invoice ត្រូវផ្ញើទៅ ចុងភៅ ក្នុងរយៈពេលឆាប់ (ឧ. ក្នុងរយៈពេលពីរបីនាទី) មាន Detail គ្រប់គ្រាន់ (ថ្ងៃខែ, ចំនួនទឹកប្រាក់, កញ្ចប់, Transaction ID)

        **Scenario 3: មិនទទួលបាន Email ជោគជ័យ (Delivery Failure)**
        - **Given** ការទូទាត់ត្រូវបានបញ្ជាក់ជោគជ័យ ប៉ុន្តែសេវាផ្ញើ Email បរាជ័យ (ឧ. Email Server Down)
        - **When** ចុងភៅ ចូល Billing History
        - **Then** ចុងភៅ នៅតែអាចមើលឃើញ/ទាញយក (Download) Invoice ដដែលបានពី Dashboard ដោយផ្ទាល់ ដោយមិនពឹងផ្អែកតែលើ Email

    *   **Technical Notes:**
        - Invoice/Receipt ត្រូវបង្កើតជា PDF ដោយស្វ័យប្រវត្តិ ហើយរក្សាទុក Record ក្នុង Table `invoices` ភ្ជាប់ជាមួយ `payment_transaction_id`
        - Email Sending ត្រូវប្រើ Queue/Async Job (មិនមែន Synchronous ក្នុង Request តែមួយ) ដើម្បីជៀសវាង Delay ចំពោះ ចុងភៅ Flow, ព្រមទាំងគាំទ្រ Retry ករណី Send បរាជ័យ
        - Billing History Page ត្រូវអនុញ្ញាតឱ្យ ចុងភៅ មើល/Download Invoice ចាស់ៗទាំងអស់ដោយផ្ទាល់ពី Dashboard

---