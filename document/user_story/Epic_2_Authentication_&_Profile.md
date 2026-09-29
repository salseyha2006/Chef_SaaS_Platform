## Epic 2: Authentication & Profile

*   **US-02: Chef Registration (Email)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចុះឈ្មោះបង្កើតគណនីថ្មីតាមរយៈអ៊ីមែល**, ដើម្បី **អាចចូលប្រើប្រាស់ប្រព័ន្ធ គ្រប់គ្រងទិន្នន័យគ្រឿងផ្សំ និងបន្តទៅជ្រើសរើសកញ្ចប់សេវាកម្មបាន**។

    *   **Acceptance Criteria:**

        **Scenario 1: ចុះឈ្មោះជោគជ័យដោយប្រើអ៊ីមែលថ្មី**
        - **Given** ចុងភៅនៅទំព័រ Register ហើយបញ្ចូលអ៊ីមែលដែលមិនទាន់មានក្នុងប្រព័ន្ធ
        - **When** ចុងភៅបំពេញឈ្មោះ, អ៊ីមែល, និងលេខសម្ងាត់ (ត្រូវតាមលក្ខខណ្ឌ) រួចចុច "Register"
        - **Then** ប្រព័ន្ធបង្កើតគណនីថ្មីជោគជ័យ ហើយផ្ញើលេខកូដ/តំណ Verification ទៅអ៊ីមែលនោះ

        **Scenario 2: ចុះឈ្មោះបរាជ័យ ព្រោះអ៊ីមែលមានរួចហើយ**
        - **Given** អ៊ីមែលដែលបញ្ចូលមានក្នុងប្រព័ន្ធរួចហើយ
        - **When** ចុងភៅចុច "Register"
        - **Then** ប្រព័ន្ធបង្ហាញ Error Message ថា "អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ" ហើយមិនបង្កើតគណនីថ្មី

        **Scenario 3: Validate ទម្រង់អ៊ីមែល និងកម្រិតលេខសម្ងាត់**
        - **Given** ចុងភៅបញ្ចូលអ៊ីមែលខុសទម្រង់ (ឧ. "abc@") ឬលេខសម្ងាត់ខ្សោយ (តិចជាង 8 តួ)
        - **When** ចុងភៅចុច "Register"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Message ភ្លាមៗ (Inline) ដោយមិនអនុញ្ញាតឱ្យ Submit Form

        **Scenario 4: Password និង Confirm Password មិនត្រូវគ្នា**
        - **Given** ចុងភៅបំពេញ Password និង Confirm Password ខុសគ្នា
        - **When** ចុងភៅចុច "Register"
        - **Then** ប្រព័ន្ធបង្ហាញ Error "Password មិនត្រូវគ្នា" ហើយរារាំង Submit

    *   **Technical Notes:**
        - Password ត្រូវ Hash ដោយ `bcrypt` មុននឹងរក្សាទុកក្នុង Database, មិនរក្សាទុកជា Plain Text ជាដាច់ខាត
        - Email field ត្រូវមាន Unique Constraint នៅកម្រិត Database
        - គណនីថ្មីត្រូវកំណត់ Status ជា `pending_verification` រហូតទាល់តែបញ្ជាក់អ៊ីមែលរួច (ភ្ជាប់ជាមួយ US-04)
        - Rate limit ការស្នើសុំ Register ពី IP/Device តែមួយ ដើម្បីការពារ Bot/Spam Account

---

*   **US-03: Register / Login via Google**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចុះឈ្មោះ ឬ ចូលគណនី (Login) តាមរយៈគណនី Google**, ដើម្បី **សន្សំពេលវេលា និងអាចចូលប្រើប្រាស់បានរហ័ស**។

    *   **Acceptance Criteria:**

        **Scenario 1: Login/Register ជោគជ័យតាម Google ជាលើកដំបូង**
        - **Given** ចុងភៅមិនទាន់មានគណនីក្នុងប្រព័ន្ធ (ដោយប្រើអ៊ីមែល Google នោះ)
        - **When** ចុងភៅចុច "Login via Google" ហើយអនុញ្ញាត (Authorize) តាម Google Consent Screen
        - **Then** ប្រព័ន្ធបង្កើតគណនីថ្មីស្វ័យប្រវត្តិ (ដោយប្រើអ៊ីមែល/ឈ្មោះពី Google) ហើយចូលប្រើប្រាស់ភ្លាមៗដោយមិនចាំបាច់ Verify Email

        **Scenario 2: Login ជោគជ័យសម្រាប់ចុងភៅចាស់**
        - **Given** អ៊ីមែល Google ដូចគ្នានេះធ្លាប់បានចុះឈ្មោះក្នុងប្រព័ន្ធរួចហើយ (មិនថាតាម Email ឬ Google)
        - **When** ចុងភៅចុច "Login via Google"
        - **Then** ប្រព័ន្ធភ្ជាប់ចូល (Link) ទៅគណនីដដែល ហើយ Login ចូលដោយផ្ទាល់ដោយមិនបង្កើតគណនីស្ទួន

        **Scenario 3: ចុងភៅបដិសេធ (Deny) សិទ្ធិលើ Google Consent Screen**
        - **Given** ចុងភៅចុច "Login via Google"
        - **When** ចុងភៅចុច "Cancel"/"Deny" នៅលើ Google Consent Screen
        - **Then** ប្រព័ន្ធនាំចុងភៅត្រឡប់មកទំព័រ Login វិញ ដោយបង្ហាញសារជូនដំណឹងសមរម្យ (មិនមែន Error System)

    *   **Technical Notes:**
        - ប្រើ OAuth 2.0 (Google Identity Services) ដើម្បីទទួល ID Token ហើយ Verify Signature នៅ Backend
        - Field `auth_provider` (`local` / `google`) និង `google_id` ត្រូវបន្ថែមក្នុង User Table ដើម្បីតាមដានវិធីចូល
        - ករណី Merge គណនី (Email ដូចគ្នា ប៉ុន្តែផ្សេង Provider) ត្រូវកំណត់ច្បាស់ថាភ្ជាប់ដោយស្វ័យប្រវត្តិ ឬតម្រូវឱ្យ Confirm ជាមុន

---

*   **US-04: Email Verification**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ទទួលបានតំណភ្ជាប់ ឬលេខកូដ (OTP) ដើម្បីផ្ទៀងផ្ទាត់អ៊ីមែល**, ដើម្បី **បញ្ជាក់ថាខ្ញុំជាម្ចាស់គណនីពិតប្រាកដ**។

    *   **Acceptance Criteria:**

        **Scenario 1: ផ្ទៀងផ្ទាត់អ៊ីមែលជោគជ័យ**
        - **Given** ចុងភៅទទួលបានលេខ OTP/តំណភ្ជាប់ក្នុងអ៊ីមែលបន្ទាប់ពី Register
        - **When** ចុងភៅវាយបញ្ចូល OTP ត្រឹមត្រូវ (ឬចុចលើតំណ) មុនផុតកំណត់
        - **Then** ស្ថានភាពគណនីប្តូរទៅ `verified` ហើយចុងភៅអាច Login ចូលប្រើប្រាស់ពេញលេញបាន

        **Scenario 2: OTP ខុស**
        - **Given** ចុងភៅវាយបញ្ចូល OTP
        - **When** លេខ OTP ដែលបញ្ចូលមិនត្រូវនឹងលេខដែលបានផ្ញើ
        - **Then** ប្រព័ន្ធបង្ហាញ Error "លេខកូដមិនត្រឹមត្រូវ" ហើយអនុញ្ញាតឱ្យព្យាយាមម្តងទៀត

        **Scenario 3: OTP ផុតកំណត់ពេលវេលា**
        - **Given** OTP ត្រូវបានផ្ញើទៅចុងភៅជាង 5 នាទីមុន (ឬតាមរយៈពេលកំណត់)
        - **When** ចុងភៅព្យាយាមប្រើ OTP នោះ
        - **Then** ប្រព័ន្ធបដិសេធ ហើយបង្ហាញ Option "ផ្ញើកូដម្តងទៀត" (Resend)

        **Scenario 4: កំណត់ចំនួនដងក្នុងការស្នើសុំ Resend OTP**
        - **Given** ចុងភៅបានចុច "Resend OTP" ច្រើនដងជាប់គ្នាក្នុងរយៈពេលខ្លី
        - **When** ចំនួនស្នើសុំលើសកម្រិតកំណត់ (ឧ. 3 ដងក្នុង 10 នាទី)
        - **Then** ប្រព័ន្ធរារាំងការស្នើសុំបន្ថែម ហើយបង្ហាញពេលវេលានៅសល់ត្រូវរង់ចាំ

    *   **Technical Notes:**
        - OTP ត្រូវជាលេខ 6 ខ្ទង់ ដែលបង្កើតដោយ Random ដ៏មានសុវត្ថិភាព (Cryptographically secure) និងផុតកំណត់ក្នុងរយៈពេលខ្លី (ឧ. 5-10 នាទី)
        - រក្សាទុក OTP ជា Hash ក្នុង Database/Cache (ឧ. Redis) ភ្ជាប់ជាមួយ Expiry Time, មិនរក្សាទុកជា Plain Text
        - Rate Limiting លើការស្នើសុំ Resend (តាម User និង IP) ដើម្បីការពារការបំពានផ្ញើអ៊ីមែលច្រើនពេក
        - គណនីដែលមិនទាន់ Verify អាចកំណត់ឱ្យលុបស្វ័យប្រវត្តិ (Cleanup Job) ក្រោយពេលកំណត់ណាមួយ (ឧ. 7 ថ្ងៃ)

---

*   **US-05: Login with Account Lockout & Rate Limiting**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចូលប្រើប្រាស់គណនីដោយប្រើអ៊ីមែល និងលេខសម្ងាត់ ព្រមទាំងមានប្រព័ន្ធការពារការវាយខុសច្រើនដង**, ដើម្បី **ការពារការលួចចូលពីជនខិលខូច**។

    *   **Acceptance Criteria:**

        **Scenario 1: Login ជោគជ័យ**
        - **Given** ចុងភៅមានគណនីដែល Verify រួច
        - **When** ចុងភៅវាយបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់ត្រឹមត្រូវ
        - **Then** ប្រព័ន្ធអនុញ្ញាតឱ្យចូលប្រើប្រាស់ ហើយនាំទៅ Dashboard

        **Scenario 2: Login ខុសលេខសម្ងាត់ (ក្រោមកម្រិតកំណត់)**
        - **Given** ចុងភៅវាយបញ្ចូលលេខសម្ងាត់ខុស
        - **When** ចំនួនដងខុសនៅតែក្រោមកម្រិតកំណត់ (ឧ. តិចជាង 5 ដង)
        - **Then** ប្រព័ន្ធបង្ហាញ Error "អ៊ីមែល ឬលេខសម្ងាត់មិនត្រឹមត្រូវ" ដោយអនុញ្ញាតឱ្យព្យាយាមម្តងទៀត

        **Scenario 3: គណនីត្រូវបានចាក់សោ (Lockout) បន្ទាប់ពីវាយខុសច្រើនដង**
        - **Given** ចុងភៅវាយលេខសម្ងាត់ខុសជាប់គ្នាដល់កម្រិតកំណត់ (ឧ. 5 ដង)
        - **When** ចុងភៅព្យាយាម Login ជាលើកទី 6
        - **Then** ប្រព័ន្ធចាក់សោគណនីជាបណ្តោះអាសន្ន (ឧ. 15 នាទី) ហើយបង្ហាញសារជូនដំណឹងអំពីរយៈពេលនៅសល់

        **Scenario 4: ព្យាយាម Login ខណៈគណនីកំពុងចាក់សោ**
        - **Given** គណនីកំពុងស្ថិតក្នុងស្ថានភាព Lockout
        - **When** ចុងភៅព្យាយាម Login ទោះបីជាមានលេខសម្ងាត់ត្រឹមត្រូវក៏ដោយ
        - **Then** ប្រព័ន្ធបដិសេធការចូល ហើយបង្ហាញពេលវេលានៅសល់ត្រូវរង់ចាំ

    *   **Technical Notes:**
        - តាមដានចំនួន Failed Login Attempts តាម User (Field `failed_login_count`, `locked_until`) ក្នុង Database ឬ Cache (Redis)
        - Reset ចំនួន Failed Attempts វិញទៅ 0 នៅពេល Login ជោគជ័យ ឬក្រោយផុតកំណត់ Lockout
        - Rate Limiting បន្ថែមតាម IP Address ដើម្បីទប់ស្កាត់ Brute-force ពី Source តែមួយ
        - Session/Token (JWT) ត្រូវកំណត់ Expiry Time សមស្រប ព្រមទាំងគាំទ្រ Refresh Token

---

*   **US-06: Forgot / Reset Password (OTP)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ស្នើសុំកំណត់លេខសម្ងាត់ថ្មីតាមរយៈកូដ OTP ដែលផ្ញើចូលអ៊ីមែល**, ដើម្បី **អាចយកគណនីមកប្រើប្រាស់វិញបានយ៉ាងរហ័ស**។

    *   **Acceptance Criteria:**

        **Scenario 1: ស្នើសុំ Reset Password ជោគជ័យ**
        - **Given** ចុងភៅចុច "Forgot Password" ហើយបញ្ចូលអ៊ីមែលដែលមានក្នុងប្រព័ន្ធ
        - **When** ចុងភៅចុច "Submit"
        - **Then** ប្រព័ន្ធផ្ញើ OTP ទៅអ៊ីមែលនោះ ហើយនាំទៅទំព័របញ្ចូល OTP

        **Scenario 2: បញ្ចូលអ៊ីមែលដែលមិនមានក្នុងប្រព័ន្ធ**
        - **Given** ចុងភៅបញ្ចូលអ៊ីមែលមិនមានក្នុងប្រព័ន្ធ
        - **When** ចុងភៅចុច "Submit"
        - **Then** ប្រព័ន្ធបង្ហាញសារទូទៅ (ឧ. "ប្រសិនបើអ៊ីមែលមានក្នុងប្រព័ន្ធ លេខកូដនឹងត្រូវផ្ញើទៅ") ដោយមិនបញ្ជាក់ថាអ៊ីមែលមាន/គ្មានក្នុងប្រព័ន្ធ (ការពារ Email Enumeration)

        **Scenario 3: កំណត់លេខសម្ងាត់ថ្មីជោគជ័យ**
        - **Given** ចុងភៅបញ្ចូល OTP ត្រឹមត្រូវ
        - **When** ចុងភៅកំណត់លេខសម្ងាត់ថ្មី (ត្រូវតាមលក្ខខណ្ឌសុវត្ថិភាព) ហើយចុច "Confirm"
        - **Then** ប្រព័ន្ធធ្វើបច្ចុប្បន្នភាពលេខសម្ងាត់ថ្មី ហើយនាំទៅទំព័រ Login ព្រមទាំង Invalidate Session ចាស់ទាំងអស់

        **Scenario 4: OTP ខុស ឬផុតកំណត់ពេលវេលា**
        - **Given** ចុងភៅបញ្ចូល OTP
        - **When** OTP ខុស ឬលើសរយៈពេលកំណត់
        - **Then** ប្រព័ន្ធបង្ហាញ Error ហើយមិនអនុញ្ញាតឱ្យបន្តទៅជំហានកំណត់លេខសម្ងាត់ថ្មី

    *   **Technical Notes:**
        - Flow ត្រូវប្រើ OTP Mechanism ដូចគ្នានឹង US-04 (Hash, Expiry, Rate Limit)
        - បន្ទាប់ពី Reset Password ជោគជ័យ ត្រូវ Invalidate គ្រប់ Session/Token ចាស់ ដើម្បីបង្ខំឱ្យ Login ចូលឡើងវិញនៅគ្រប់ឧបករណ៍
        - មិនត្រូវបញ្ជាក់ (Leak) ថាអ៊ីមែលមាន/គ្មានក្នុងប្រព័ន្ធ តាមរយៈ Response Message ឬ Response Time ខុសគ្នា

---

*   **US-07: Update Own Profile**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចកែប្រែព័ត៌មានផ្ទាល់ខ្លួន (ឈ្មោះទូទៅ ឬរូបតំណាង)**, ដើម្បី **បង្ហាញអត្តសញ្ញាណច្បាស់លាស់**។

    *   **Acceptance Criteria:**

        **Scenario 1: កែប្រែឈ្មោះ ឬរូបតំណាងជោគជ័យ**
        - **Given** ចុងភៅនៅទំព័រ Profile Settings
        - **When** ចុងភៅកែឈ្មោះ និង/ឬ Upload រូបភាពថ្មី (ត្រឹមទំហំ/ប្រភេទដែលអនុញ្ញាត) រួចចុច "Save"
        - **Then** ព័ត៌មានត្រូវបានធ្វើបច្ចុប្បន្នភាព ហើយបង្ហាញនៅលើ Navigation Bar/Profile ភ្លាមៗ

        **Scenario 2: Upload រូបភាពដែលហួសទំហំ ឬខុសប្រភេទ**
        - **Given** ចុងភៅជ្រើសរើសរូបភាពដែលមានទំហំហួស Limit (ឧ. > 5MB) ឬមិនមែន Format រូបភាព (ឧ. .pdf)
        - **When** ចុងភៅព្យាយាម Upload
        - **Then** ប្រព័ន្ធបដិសេធ ហើយបង្ហាញ Error ជូនដំណឹងអំពីលក្ខខណ្ឌ File ដែលអនុញ្ញាត

        **Scenario 3: ទុកឈ្មោះជា Field ទទេ**
        - **Given** ចុងភៅចង់រក្សាទុក Form ដោយទុក Field ឈ្មោះជាទទេ
        - **When** ចុងភៅចុច "Save"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ថាឈ្មោះមិនអាចទទេបាន ហើយមិន Save

    *   **Technical Notes:**
        - Upload រូបភាពត្រូវរក្សាទុកនៅ Object Storage (ឧ. S3/Cloud Storage) មិនមែនផ្ទុកផ្ទាល់ក្នុង Database
        - ត្រូវធ្វើ Image Resize/Compression ស្វ័យប្រវត្តិមុនរក្សាទុក ដើម្បីកាត់បន្ថយទំហំ Load
        - Validate File Type (jpg, png, webp) និង Max Size នៅ Frontend និង Backend ទាំងពីរ

---

*   **US-08: Change / Set Password**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចផ្លាស់ប្តូរលេខសម្ងាត់ ឬបង្កើតលេខសម្ងាត់ថ្មី (សម្រាប់អ្នក Login តាម Google)**, ដើម្បី **បង្កើនសុវត្ថិភាពគណនី**។

    *   **Acceptance Criteria:**

        **Scenario 1: ផ្លាស់ប្តូរលេខសម្ងាត់ជោគជ័យ (User ចុះឈ្មោះតាម Email)**
        - **Given** ចុងភៅនៅទំព័រ Security Settings ហើយចង់ផ្លាស់ប្តូរលេខសម្ងាត់
        - **When** ចុងភៅបញ្ចូលលេខសម្ងាត់ចាស់ត្រឹមត្រូវ និងលេខសម្ងាត់ថ្មី (ត្រូវតាមលក្ខខណ្ឌ) រួចចុច "Save"
        - **Then** ប្រព័ន្ធធ្វើបច្ចុប្បន្នភាពលេខសម្ងាត់ថ្មី ហើយបង្ហាញសារជោគជ័យ

        **Scenario 2: បញ្ចូលលេខសម្ងាត់ចាស់ខុស**
        - **Given** ចុងភៅព្យាយាមផ្លាស់ប្តូរលេខសម្ងាត់
        - **When** លេខសម្ងាត់ចាស់ដែលបញ្ចូលមិនត្រឹមត្រូវ
        - **Then** ប្រព័ន្ធបង្ហាញ Error ហើយមិនធ្វើបច្ចុប្បន្នភាព

        **Scenario 3: បង្កើតលេខសម្ងាត់ដំបូងសម្រាប់ User ចូលតាម Google**
        - **Given** User Login ចូលដោយ Google ហើយមិនធ្លាប់មានលេខសម្ងាត់ (Provider = google)
        - **When** User ចូលទំព័រ "Set Password" ហើយកំណត់លេខសម្ងាត់ថ្មី (មិនតម្រូវឱ្យវាយលេខចាស់)
        - **Then** ប្រព័ន្ធរក្សាទុកលេខសម្ងាត់ថ្មី ដើម្បីអនុញ្ញាតឱ្យ Login តាមអ៊ីមែល/លេខសម្ងាត់បន្ថែមពី Google

    *   **Technical Notes:**
        - ត្រូវពិនិត្យ Field `auth_provider` ដើម្បីសម្រេចថាបង្ហាញ Flow "Change Password" (មាន Old Password) ឬ "Set Password" (គ្មាន Old Password)
        - Password ថ្មីត្រូវ Hash ដដែលដោយប្រើ `bcrypt`/Argon2
        - ផ្តល់ Password Strength Indicator នៅ Frontend ដើម្បីណែនាំចុងភៅ

---

*   **US-09: Logout**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចាកចេញពីប្រព័ន្ធ (Logout)**, ដើម្បី **ការពារកុំឱ្យអ្នកដទៃចូលប្រើប្រាស់គណនី និងទិន្នន័យរបស់ខ្ញុំបាន នៅពេលខ្ញុំឈប់ប្រើប្រាស់ឧបករណ៍នោះ**។

    *   **Acceptance Criteria:**

        **Scenario 1: Logout ជោគជ័យ**
        - **Given** ចុងភៅកំពុង Login ចូលប្រព័ន្ធ
        - **When** ចុងភៅចុច "Logout"
        - **Then** ប្រព័ន្ធលុប Session/Token នៅ Client ហើយនាំត្រឡប់ទៅទំព័រ Login

        **Scenario 2: ព្យាយាមចូលប្រើ Page ដែលត្រូវការសិទ្ធិ ក្រោយ Logout**
        - **Given** ចុងភៅទើប Logout ចេញ
        - **When** ចុងភៅចុច Back Button ឬបញ្ចូល URL ដែលត្រូវការសិទ្ធិ Login (ឧ. Dashboard)
        - **Then** ប្រព័ន្ធបញ្ជូនចុងភៅត្រឡប់ទៅទំព័រ Login វិញ ដោយមិនអនុញ្ញាតឱ្យមើលទិន្នន័យ

    *   **Technical Notes:**
        - ត្រូវ Invalidate Token (ឧ. Blacklist JWT ក្នុង Redis រហូតដល់ Expiry ដើម) ឬ Revoke Refresh Token នៅ Backend មិនមែនលុបតែ Local Storage/Cookie
        - Clear Local Storage/Session Storage/Cookie ទាំងអស់ដែលទាក់ទងនឹង Auth Session នៅ Client
        - ករណីមាន Multi-tab Login, ត្រូវពិចារណា Broadcast Logout Event ទៅគ្រប់ Tab (ឧ. តាម `storage` event)

---