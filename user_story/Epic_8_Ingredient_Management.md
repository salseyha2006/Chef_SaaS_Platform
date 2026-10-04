## Epic 8: Ingredient Management

*   **US-31: Browse Global Ingredient Presets**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ស្វែងរក និងជ្រើសរើសគ្រឿងផ្សំពីបញ្ជីស្តង់ដាររួម តាមរយៈទម្រង់ Tree View ដែលមាន Checkbox**, ដើម្បី **អាចទាញយកគ្រឿងផ្សំជាច្រើនមុខក្នុងពេលតែមួយបានយ៉ាងរហ័ស (Multi-select)**។

    *   **Acceptance Criteria:**

        **Scenario 1: បើក Tree View និងឃើញក្រុមគ្រឿងផ្សំ**
        - **Given** ចុងភៅ ចុចប៊ូតុង "Browse Presets" នៅទំព័រ Ingredient Management
        - **When** Modal/Panel Tree View បង្ហាញឡើង
        - **Then** ប្រព័ន្ធបង្ហាញគ្រឿងផ្សំស្តង់ដារទាំងអស់ ដាក់ជាក្រុមតាម Category / Sub Category ដែលអាច Collapse/Expand បាន

        **Scenario 2: ជ្រើសរើសច្រើនមុខក្នុងពេលតែមួយ (Multi-select)**
        - **Given** ចុងភៅ កំពុងមើល Tree View
        - **When** ចុងភៅ ចុច Checkbox លើគ្រឿងផ្សំច្រើនមុខ (ឧ. "សាច់មាន់", "ខ្ទឹមស", "ម្រេច")
        - **Then** Checkbox ទាំងអស់ត្រូវជាប់សញ្ញាគ្រីស ហើយប្រព័ន្ធរាប់ និងបង្ហាញចំនួនដែលបានជ្រើសរើស (ឧ. "3 ជ្រើសរើសរួច")

        **Scenario 3: ជ្រើសរើសទាំង Category (Select All in Group)**
        - **Given** ចុងភៅ កំពុងមើល Category ណាមួយក្នុង Tree View (ឧ. "សាច់")
        - **When** ចុងភៅ ចុច Checkbox នៅកម្រិត Category (Parent Checkbox)
        - **Then** គ្រឿងផ្សំទាំងអស់ក្នុង Category នោះត្រូវជាប់សញ្ញាគ្រីសទាំងអស់ (Cascade Select)

        **Scenario 4: ស្វែងរកគ្រឿងផ្សំក្នុង Tree View**
        - **Given** ចុងភៅ កំពុងមើល Tree View ដែលមានគ្រឿងផ្សំច្រើន
        - **When** ចុងភៅ វាយពាក្យស្វែងរកក្នុង Search Box (ឧ. "សាច់")
        - **Then** Tree View ត្រង និងបង្ហាញតែគ្រឿងផ្សំ/ក្រុមដែលត្រូវនឹងពាក្យស្វែងរក ដោយ Expand ក្រុមដែលពាក់ព័ន្ធស្វ័យប្រវត្តិ

    *   **Technical Notes:**
        - Tree View Data ត្រូវទាញយកជា Hierarchical Structure (Category / Sub Category → Ingredient) តាមរយៈ API តែមួយ ដើម្បីជៀសវាង N+1 Request
        - Component Tree View ត្រូវ Support Parent-Child Checkbox State (Indeterminate State ពេលជ្រើសរើសមិនពេញ Category)
        - Search ត្រូវ Implement ជា Client-side Filter (ប្រសិនបើទិន្នន័យមិនច្រើនពេក) ឬ Debounced Server-side Search (ប្រសិនបើទិន្នន័យច្រើន)

---

*   **US-32: Sync Preset Checkbox State (Prevent Duplicates)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឱ្យប្រព័ន្ធបង្ហាញសញ្ញាគ្រីសជាប់ជានិច្ច លើគ្រឿងផ្សំណាដែលខ្ញុំធ្លាប់រើសចូលស្តុករួចហើយ**, ដើម្បី **ដឹងថាគ្រឿងផ្សំនោះមានក្នុងស្តុករួចហើយ និងការពារកុំឱ្យចុចទាញយកស្ទួនគ្នា**។

    *   **Acceptance Criteria:**

        **Scenario 1: គ្រឿងផ្សំដែលធ្លាប់ទាញរួច បង្ហាញជាប់សញ្ញាគ្រីស**
        - **Given** ចុងភៅ ធ្លាប់ទាញយកគ្រឿងផ្សំ "សាច់មាន់" ចូលស្តុករួចហើយ
        - **When** ចុងភៅ បើក Tree View ម្តងទៀត
        - **Then** "សាច់មាន់" បង្ហាញជាប់សញ្ញាគ្រីស ហើយ Checkbox ស្ថិតក្នុងស្ថានភាព Disabled

        **Scenario 2: ព្យាយាមចុចយកគ្រឿងផ្សំដែលមានរួច**
        - **Given** Checkbox នៃគ្រឿងផ្សំណាមួយបង្ហាញ Disabled ព្រោះមានក្នុងស្តុករួច
        - **When** ចុងភៅ ចុចលើ Checkbox នោះ
        - **Then** ប្រព័ន្ធមិនអនុញ្ញាតឱ្យធ្វើសកម្មភាព (No-op) ដោយអាចមាន Tooltip "មានក្នុងស្តុករួចហើយ"

        **Scenario 3: State ធ្វើបច្ចុប្បន្នភាពភ្លាមៗបន្ទាប់ពី Import ជោគជ័យ**
        - **Given** ចុងភៅ ទើបជ្រើសរើសគ្រឿងផ្សំថ្មី ហើយបញ្ចប់ Import Workflow (US-33) ជោគជ័យ
        - **When** ចុងភៅ បើក Tree View ម្តងទៀតដោយមិនចាំបាច់ Refresh ទាំង Page
        - **Then** គ្រឿងផ្សំដែលទើប Import រួច ត្រូវបង្ហាញជាប់សញ្ញាគ្រីស និង Disabled ភ្លាមៗ

    *   **Technical Notes:**
        - ត្រូវ Query Junction Table (ឧ. `ចុងភៅ_ingredients`) ដើម្បីកំណត់ State របស់ Checkbox នីមួយៗ ធៀបនឹង Preset ទាំងអស់
        - Disable Logic ត្រូវ Implement ទាំង Frontend និង Backend (Validation មិនអនុញ្ញាតឱ្យ Import ស្ទួន)
        - បន្ទាប់ពី Import ជោគជ័យ ត្រូវ Invalidate/Refresh Cache របស់ Tree View State (ឧ. React Query Invalidation) ដើម្បីធានា Sync ភ្លាមៗ

---

*   **US-33: Set Custom Pricing & Unit (Import Workflow)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **វាយបញ្ចូល "តម្លៃទិញចូល" និងជ្រើសរើស "ឯកតា" សម្រាប់តែគ្រឿងផ្សំដែលខ្ញុំទើបបានរើសពី Preset**, ដើម្បី **ធានាថាគ្រឿងផ្សំក្នុងឃ្លាំង មានទិន្នន័យតម្លៃត្រឹមត្រូវតាមការទិញជាក់ស្តែង**។

    *   **Acceptance Criteria:**

        **Scenario 1: បំពេញតម្លៃ និងឯកតាសម្រាប់គ្រឿងផ្សំដែលបានជ្រើសរើសទាំងអស់**
        - **Given** ចុងភៅ បានជ្រើសរើសគ្រឿងផ្សំច្រើនមុខពី Tree View (US-31) ហើយចុច "Next/Import"
        - **When** ប្រព័ន្ធបង្ហាញ Form តារាងសម្រាប់បំពេញ "តម្លៃទិញចូល" និង "ឯកតា" សម្រាប់គ្រឿងផ្សំនីមួយៗ ហើយ ចុងភៅ បំពេញគ្រប់ជួរ រួចចុច "Confirm Import"
        - **Then** គ្រឿងផ្សំទាំងអស់ត្រូវបានបញ្ចូលទៅក្នុងស្តុករបស់ ចុងភៅ ជាមួយតម្លៃ/ឯកតាដែលបានកំណត់

        **Scenario 2: ទុក Field តម្លៃ ឬឯកតាមួយចំនួនជាទទេ**
        - **Given** ចុងភៅ កំពុងបំពេញ Form តម្លៃ/ឯកតាសម្រាប់គ្រឿងផ្សំច្រើនមុខ
        - **When** ចុងភៅ ទុកគ្រឿងផ្សំណាមួយគ្មានតម្លៃ ឬគ្មានឯកតា រួចចុច "Confirm Import"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ចង្អុលទៅជួរនោះជាក់លាក់ ហើយមិនអនុញ្ញាតឱ្យ Import រហូតទាល់តែបំពេញគ្រប់

        **Scenario 3: ជ្រើសរើសឯកតាមិនមាន ហើយបង្កើតថ្មីភ្លាមៗក្នុង Import Workflow**
        - **Given** ចុងភៅ កំពុងបំពេញ Field ឯកតាសម្រាប់គ្រឿងផ្សំមួយ
        - **When** ចុងភៅ វាយបញ្ចូលឈ្មោះ Unit ថ្មីមិនទាន់មាន ហើយបង្កើត (ភ្ជាប់ជាមួយ Logic US-26/US-27)
        - **Then** Unit ថ្មីត្រូវបានបង្កើត ហើយកំណត់ភ្ជាប់ជាមួយគ្រឿងផ្សំនោះក្នុង Form ភ្លាមៗ

        **Scenario 4: បោះបង់ Import Workflow**
        - **Given** ចុងភៅ កំពុងបំពេញ Form តម្លៃ/ឯកតា
        - **When** ចុងភៅ ចុច "Cancel"
        - **Then** ប្រព័ន្ធបិទ Form ដោយមិន Import គ្រឿងផ្សំណាមួយ ហើយ Checkbox ក្នុង Tree View ត្រឡប់ទៅស្ថានភាពដើម (មិនជាប់សញ្ញាគ្រីស)

    *   **Technical Notes:**
        - ការ Import គ្រឿងផ្សំច្រើនមុខ ត្រូវប្រើ Batch/Transaction (All-or-Nothing) ដើម្បីជៀសវាងទិន្នន័យ Partial Import ក្នុងករណី Error កណ្តាលផ្លូវ
        - Field `purchase_price`, `unit_id` ត្រូវរក្សាទុកក្នុង Table `ចុងភៅ_ingredients` ភ្ជាប់ជាមួយ `ingredient_preset_id` និង `ចុងភៅ_id`
        - Validate Price ត្រូវធំជាង 0 ទាំង Frontend និង Backend

---

*   **US-34: Manage My Ingredient Inventory**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលបញ្ជីគ្រឿងផ្សំនៅក្នុងស្តុកផ្ទាល់ខ្លួនរបស់ខ្ញុំ ដែលមានបង្ហាញតម្លៃ និងអាច Filter តាមក្រុមបាន**, ដើម្បី **ងាយស្រួលគ្រប់គ្រងតម្លៃដើម និងទាញយកទៅគណនាថ្លៃដើមមុខម្ហូប**។

    *   **Acceptance Criteria:**

        **Scenario 1: មើលបញ្ជីស្តុកគ្រឿងផ្សំជោគជ័យ**
        - **Given** ចុងភៅ មានគ្រឿងផ្សំក្នុងស្តុករួចហើយ
        - **When** ចុងភៅ ចូលទំព័រ "My Ingredients"
        - **Then** ប្រព័ន្ធបង្ហាញបញ្ជីគ្រឿងផ្សំទាំងអស់ ព្រមទាំងតម្លៃទិញចូល, ឯកតា, និង Category

        **Scenario 2: Filter បញ្ជីតាម Category**
        - **Given** ចុងភៅ មានគ្រឿងផ្សំច្រើន Category ក្នុងស្តុក
        - **When** ចុងភៅ ជ្រើសរើស Category ណាមួយពី Filter Dropdown
        - **Then** បញ្ជីបង្ហាញតែគ្រឿងផ្សំដែលស្ថិតក្នុង Category នោះប៉ុណ្ណោះ

        **Scenario 3: កែប្រែតម្លៃគ្រឿងផ្សំដោយផ្ទាល់ពីបញ្ជី**
        - **Given** ចុងភៅ កំពុងមើលបញ្ជីគ្រឿងផ្សំ
        - **When** ចុងភៅ ចុចលើតម្លៃ ហើយកែជាតម្លៃថ្មី រួច Confirm
        - **Then** តម្លៃថ្មីត្រូវបានរក្សាទុកភ្លាមៗ ដោយបង្ហាញ Timestamp កាលបរិច្ឆេទកែប្រែចុងក្រោយ (Last Updated)

        **Scenario 4: បញ្ជីទទេ (No Ingredients Yet)**
        - **Given** ចុងភៅ ថ្មីមិនទាន់ធ្លាប់ Import គ្រឿងផ្សំណាមួយ
        - **When** ចុងភៅ ចូលទំព័រ "My Ingredients"
        - **Then** ប្រព័ន្ធបង្ហាញ Empty State ជាមួយ Call-to-Action "Browse Presets" ណែនាំឱ្យទៅ US-31

    *   **Technical Notes:**
        - Query Ingredient Inventory ត្រូវ Filter តាម `ចុងភៅ_id` និង `status = active` (មិនរួម Archived តាម US-35) ជា Default
        - ត្រូវ Implement Pagination/Lazy Loading ប្រសិនបើចំនួនគ្រឿងផ្សំច្រើន
        - កែប្រែតម្លៃត្រូវកត់ត្រា `updated_at` និងអាចពិចារណា Log History តម្លៃចាស់ សម្រាប់ Audit Trail នាពេលអនាគត

---

*   **US-35: Hide/Archive Ingredient via Uncheck**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ដកសញ្ញាគ្រីស (Uncheck) នៅក្នុង Preset ដើម្បីបញ្ឈប់ការបង្ហាញគ្រឿងផ្សំនោះនៅក្នុងស្តុករបស់ខ្ញុំ**, ដើម្បី **រក្សាភាពស្រឡះក្នុងបញ្ជី ប៉ុន្តែប្រព័ន្ធនៅតែរក្សាទិន្នន័យតម្លៃរបស់វាទុកកុំឱ្យប៉ះពាល់ការគណនាចាស់ៗ**។

    *   **Acceptance Criteria:**

        **Scenario 1: Archive គ្រឿងផ្សំជោគជ័យ**
        - **Given** គ្រឿងផ្សំណាមួយកំពុងបង្ហាញជាប់សញ្ញាគ្រីសក្នុង Preset (មានក្នុងស្តុក)
        - **When** ចុងភៅ ដកសញ្ញាគ្រីស (Uncheck) ចេញ
        - **Then** គ្រឿងផ្សំនោះលែងបង្ហាញនៅក្នុងបញ្ជី "My Ingredients" សកម្ម ប៉ុន្តែទិន្នន័យនៅតែមានក្នុង Database

        **Scenario 2: គ្រឿងផ្សំដែល Archive រួច នៅតែបង្ហាញត្រឹមត្រូវលើមុខម្ហូបចាស់**
        - **Given** មុខម្ហូបណាមួយធ្លាប់ប្រើគ្រឿងផ្សំដែលឥឡូវត្រូវបាន Archive
        - **When** ចុងភៅ មើលព័ត៌មានលម្អិតមុខម្ហូបនោះ
        - **Then** គ្រឿងផ្សំនោះនៅតែបង្ហាញឈ្មោះ/តម្លៃដដែលក្នុងគណនាថ្លៃដើមចាស់ ដោយមិនប៉ះពាល់

        **Scenario 3: Warning ពេល Archive គ្រឿងផ្សំកំពុងប្រើប្រាស់សកម្ម**
        - **Given** គ្រឿងផ្សំណាមួយកំពុងភ្ជាប់ជាមួយមុខម្ហូបដែលកំពុងសកម្ម
        - **When** ចុងភៅ ព្យាយាម Uncheck គ្រឿងផ្សំនោះ
        - **Then** ប្រព័ន្ធបង្ហាញ Warning Confirm (ឧ. "គ្រឿងផ្សំនេះកំពុងប្រើប្រាស់ដោយ N មុខម្ហូប, នៅតែលាក់ដែរឬទេ?") មុនអនុញ្ញាតឱ្យបន្ត

    *   **Technical Notes:**
        - Archive ត្រូវជា Soft Delete ដោយប្រើ Field `status` (`active`/`archived`) លើ Table `ចុងភៅ_ingredients`, មិនលុប Record ចេញ
        - Query សម្រាប់ Recipe Cost Calculation ចាស់ៗ ត្រូវអាច Reference ទៅគ្រឿងផ្សំដែល Archived បាន (មិន Filter តាម Status)
        - ធ្វើតាម Pattern ដូចគ្នានឹង US-30 (Unit/Category Soft Delete)

---

*   **US-36: Permanently Delete Ingredient (Hard Delete)**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មានជម្រើសអាចលុបគ្រឿងផ្សំចោលទាំងស្រុងចេញពីស្តុករបស់ខ្ញុំ**, ដើម្បី **សម្អាតទិន្នន័យក្នុងករណីដែលចុចរើសខុស ឬមិនទាន់បានយកទៅភ្ជាប់ជាមួយមុខម្ហូបណាមួយសោះ**។

    *   **Acceptance Criteria:**

        **Scenario 1: លុបចោលជោគជ័យ (គ្មានទំនាក់ទំនងជាមួយមុខម្ហូប)**
        - **Given** គ្រឿងផ្សំណាមួយមិនទាន់ត្រូវបានប្រើប្រាស់ក្នុងមុខម្ហូបណាមួយសោះ
        - **When** ចុងភៅ ចុច "Delete Permanently" ហើយបញ្ជាក់ (Confirm)
        - **Then** ប្រព័ន្ធលុប Record ចេញពី Database ជាអចិន្ត្រៃយ៍ ហើយ Checkbox ក្នុង Preset (US-32) ត្រឡប់ទៅមិនជាប់សញ្ញាគ្រីសវិញ (អាចទាញយកម្តងទៀតបាន)

        **Scenario 2: ព្យាយាមលុបចោលគ្រឿងផ្សំដែលកំពុងប្រើប្រាស់ (Guard)**
        - **Given** គ្រឿងផ្សំណាមួយកំពុងភ្ជាប់ជាមួយមុខម្ហូបយ៉ាងតិចមួយ
        - **When** ចុងភៅ ចុច "Delete Permanently"
        - **Then** ប្រព័ន្ធបដិសេធ ហើយបង្ហាញ Error ណែនាំឱ្យប្រើ "Archive" (US-35) ជំនួសវិញ ដើម្បីការពារទិន្នន័យមុខម្ហូបខូច

        **Scenario 3: Confirm Dialog មុនលុប**
        - **Given** ចុងភៅ ចុច "Delete Permanently" លើគ្រឿងផ្សំដែលអាចលុបបាន
        - **When** ប្រព័ន្ធបង្ហាញ Confirm Dialog ព្រមានថាសកម្មភាពនេះមិនអាចត្រឡប់វិញបាន (Irreversible)
        - **Then** ការលុបនឹងកើតឡើងលុះត្រាតែ ចុងភៅ ចុច Confirm ជាលើកចុងក្រោយ

    *   **Technical Notes:**
        - Hard Delete ត្រូវត្រួតពិនិត្យ Foreign Key Reference ទៅ Recipe/Menu Table ជាមុន ដើម្បីរារាំង Delete ប្រសិនបើមាន Dependency (Referential Integrity Check នៅ Backend)
        - Endpoint Delete ត្រូវតម្រូវ Confirmation Flag/Double-check ជៀសវាង Accidental Delete តាម API ដោយផ្ទាល់
        - ភ្ជាប់ជាមួយ US-32: បន្ទាប់ពី Hard Delete ជោគជ័យ ត្រូវ Invalidate Cache Checkbox State ភ្លាមៗ

---