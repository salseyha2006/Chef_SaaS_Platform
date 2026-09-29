## Epic 7: Unit & Category Configuration

*   **US-26: Select & Create Units Inline**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ជ្រើសរើស Unit ពី Preset ឬបង្កើត Unit ថ្មីភ្លាមៗនៅពេលកំណត់តម្លៃគ្រឿងផ្សំ**, ដើម្បី **សន្សំពេលវេលាដោយមិនបាច់ចូលទៅកាន់ទំព័រគ្រប់គ្រង Unit ផ្សេង**។

    *   **Acceptance Criteria:**

        **Scenario 1: ជ្រើសរើស Unit ពី Preset ដោយផ្ទាល់**
        - **Given** ចុងភៅ កំពុងបំពេញ Form បង្កើត/កែប្រែគ្រឿងផ្សំ
        - **When** ចុងភៅ ចុចលើ Field Unit ហើយជ្រើសរើស Unit ណាមួយពី Dropdown Preset (ឧ. "គីឡូក្រាម")
        - **Then** Unit នោះត្រូវបានកំណត់ភ្ជាប់ជាមួយគ្រឿងផ្សំភ្លាមៗ ដោយមិនចាំបាច់ Reload Form

        **Scenario 2: បង្កើត Unit ថ្មីភ្លាមៗ (Inline Create)**
        - **Given** ចុងភៅ កំពុងស្វែងរក Unit ក្នុង Dropdown ប៉ុន្តែរកមិនឃើញ Unit ដែលចង់បាន
        - **When** ចុងភៅ វាយបញ្ចូលឈ្មោះ Unit ថ្មី (ឧ. "ម្សៅ") ហើយចុច Option "Create new: ម្សៅ"
        - **Then** ប្រព័ន្ធបង្ហាញ Modal/Form តូចសម្រាប់បញ្ចូល Conversion Rate (ភ្ជាប់ជាមួយ US-27) មុននឹងបញ្ចូល Unit ថ្មីនោះទៅក្នុងបញ្ជី ហើយជ្រើសរើសវាដោយស្វ័យប្រវត្តិ

        **Scenario 3: បោះបង់ការបង្កើត Unit ថ្មី**
        - **Given** Modal បង្កើត Unit ថ្មីកំពុងបង្ហាញ
        - **When** ចុងភៅ ចុច "Cancel"
        - **Then** ប្រព័ន្ធបិទ Modal ដោយមិនបង្កើត Unit ថ្មី ហើយត្រឡប់ទៅ Form គ្រឿងផ្សំវិញ (Field Unit នៅតែទទេ)

    *   **Technical Notes:**
        - Component Dropdown ត្រូវជា Combobox (Searchable + Creatable) ដើម្បីអនុញ្ញាតទាំងស្វែងរក និងបង្កើតថ្មីក្នុង UI តែមួយ
        - Unit ថ្មីដែលបង្កើតតាមរបៀបនេះ ត្រូវកំណត់ `source = ចុងភៅ` (ភ្ជាប់ជាមួយ Logic Preset ក្នុង US-11) ចងភ្ជាប់ជាមួយ `ចុងភៅ_id`
        - ត្រូវហៅ API បង្កើត Unit ជា Async ជាមុននឹង Set Value ចូល Form គ្រឿងផ្សំ ដើម្បីធានាថា Unit ត្រូវបានរក្សាទុកមុនប្រើប្រាស់

---

*   **US-27: Enforce Unit Conversion Rate**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឱ្យប្រព័ន្ធទាមទារ "អត្រាបំប្លែង (Conversion Rate)" ជាដាច់ខាតពេលបង្កើត Unit ថ្មី**, ដើម្បី **ធានាថាប្រព័ន្ធអាចយកខ្នាតរបស់ខ្ញុំទៅគណនាថ្លៃដើមបានត្រឹមត្រូវ**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្កើត Unit ថ្មីជោគជ័យជាមួយ Conversion Rate**
        - **Given** ចុងភៅ កំពុងបង្កើត Unit ថ្មី ហើយកំណត់ Base Unit (ឧ. "គីឡូក្រាម") និង Conversion Rate (ឧ. 1 កញ្ចប់ = 0.5 គីឡូក្រាម)
        - **When** ចុងភៅ ចុច "Save"
        - **Then** Unit ថ្មីត្រូវបានបង្កើតដោយភ្ជាប់ Conversion Rate ត្រឹមត្រូវ ហើយអាចប្រើសម្រាប់គណនាថ្លៃដើមភ្លាមៗ

        **Scenario 2: ទុក Conversion Rate ជាទទេ**
        - **Given** ចុងភៅ កំពុងបំពេញ Form បង្កើត Unit ថ្មី
        - **When** ចុងភៅ ទុក Field Conversion Rate ជាទទេ ហើយចុច "Save"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ថា "Conversion Rate ត្រូវការចាំបាច់" ហើយមិនអនុញ្ញាតឱ្យ Save

        **Scenario 3: បញ្ចូល Conversion Rate ជាលេខអវិជ្ជមាន ឬសូន្យ**
        - **Given** ចុងភៅ កំពុងបំពេញ Field Conversion Rate
        - **When** ចុងភៅ វាយបញ្ចូលលេខ 0 ឬលេខអវិជ្ជមាន (ឧ. -1)
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ថា Conversion Rate ត្រូវធំជាង 0 ហើយមិនអនុញ្ញាតឱ្យ Save

    *   **Technical Notes:**
        - Field `conversion_rate` (Decimal, > 0) ត្រូវជា NOT NULL នៅកម្រិត Database ផងដែរ (មិនត្រឹមតែ Frontend Validation)
        - Conversion Rate ត្រូវផ្គូផ្គងជាមួយ Base Unit ជាក់លាក់ណាមួយ (ឧ. `base_unit_id`) ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធគណនាបំប្លែងចូល/ចេញរវាង Unit ផ្សេងៗបានត្រឹមត្រូវ
        - ត្រូវសរសេរ Unit Test ចំពោះ Logic គណនាបំប្លែង Unit ដើម្បីធានាភាពត្រឹមត្រូវនៃការគណនាថ្លៃដើម (Cost Calculation)

---

*   **US-28: Auto-assign & Inline Custom Categories**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឱ្យប្រព័ន្ធកំណត់ Category ដោយស្វ័យប្រវត្តិពេលរើសពី Preset និងអាចវាយបង្កើតថ្មីបានភ្លាមៗ**, ដើម្បី **រៀបចំគ្រឿងផ្សំឱ្យមានសណ្តាប់ធ្នាប់**។

    *   **Acceptance Criteria:**

        **Scenario 1: Category ត្រូវកំណត់ស្វ័យប្រវត្តិពេលរើស Ingredient ពី Preset**
        - **Given** ចុងភៅ ជ្រើសរើសគ្រឿងផ្សំពី Preset (ឧ. "សាច់មាន់")
        - **When** ប្រព័ន្ធបញ្ចូលគ្រឿងផ្សំនោះទៅក្នុងបញ្ជី
        - **Then** Category របស់គ្រឿងផ្សំនោះ (ឧ. "សាច់") ត្រូវបានកំណត់ស្វ័យប្រវត្តិដោយមិនតម្រូវឱ្យ ចុងភៅ ជ្រើសរើសដោយដៃ

        **Scenario 2: បង្កើត Category ថ្មីភ្លាមៗ (Inline Create)**
        - **Given** ចុងភៅ កំពុងកែប្រែ Category របស់គ្រឿងផ្សំណាមួយ ហើយ Category ដែលចង់បានមិនមានក្នុងបញ្ជី
        - **When** ចុងភៅ វាយបញ្ចូលឈ្មោះ Category ថ្មី ហើយចុច Option "Create new"
        - **Then** Category ថ្មីត្រូវបានបង្កើត ហើយកំណត់ភ្ជាប់ជាមួយគ្រឿងផ្សំនោះភ្លាមៗ

        **Scenario 3: ចុងភៅ កែប្តូរ Category ដោយដៃបន្ទាប់ពី Auto-assign**
        - **Given** Category ត្រូវបានកំណត់ស្វ័យប្រវត្តិរួច
        - **When** ចុងភៅ ចង់ប្តូរទៅ Category ផ្សេង ហើយជ្រើសរើស Category ថ្មីពី Dropdown
        - **Then** ប្រព័ន្ធអនុញ្ញាតឱ្យប្តូរបាន ហើយរក្សាទុក Category ថ្មីនោះជំនួសការកំណត់ស្វ័យប្រវត្តិ

    *   **Technical Notes:**
        - Preset Ingredient ត្រូវមាន Field `default_category_id` ភ្ជាប់ស្រាប់ ដើម្បីអនុញ្ញាតឱ្យប្រព័ន្ធ Auto-assign តាម Mapping នេះ
        - Component Dropdown ត្រូវជា Combobox (Searchable + Creatable) ដូចគ្នានឹង US-26
        - Category ថ្មីដែលបង្កើតតាមរបៀបនេះ ត្រូវកំណត់ `source = ចុងភៅ` ចងភ្ជាប់ជាមួយ `ចុងភៅ_id`

---

*   **US-29: Prevent Duplicate Preset Selection (Unit & Category)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឱ្យប្រព័ន្ធបង្ហាញសញ្ញាគ្រីសជាប់ និងបិទមិនឱ្យគ្រីសយក Unit/Category ណាដែលបានទាញយកមកប្រើរួចហើយ**, ដើម្បី **ការពារកុំឱ្យមានទិន្នន័យខ្នាត ឬក្រុមស្ទួនគ្នា**។

    *   **Acceptance Criteria:**

        **Scenario 1: Preset ដែលបានជ្រើសរើសរួចត្រូវបង្ហាញជាប់សញ្ញាគ្រីស និងបិទ**
        - **Given** ចុងភៅ ធ្លាប់ជ្រើសរើស Unit "គីឡូក្រាម" ពី Preset រួចហើយ
        - **When** ចុងភៅ បើកមើលបញ្ជី Preset ម្តងទៀត
        - **Then** Unit "គីឡូក្រាម" បង្ហាញសញ្ញាគ្រីស (Checked) ជាប់ ហើយ Checkbox/Option នោះស្ថិតក្នុងស្ថានភាព Disabled (មិនអាចដកគ្រីសពីទីនេះបាន)

        **Scenario 2: ព្យាយាមជ្រើសរើស Preset ដែលបានប្រើរួច**
        - **Given** Unit/Category ណាមួយបានបង្ហាញជា Disabled ព្រោះបានប្រើរួច
        - **When** ចុងភៅ ព្យាយាមចុចលើ Checkbox នោះ
        - **Then** ប្រព័ន្ធមិនអនុញ្ញាតឱ្យធ្វើសកម្មភាពអ្វីទាំងអស់ (No-op) ដោយអាចមាន Tooltip ជូនដំណឹងថា "កំពុងប្រើប្រាស់រួចហើយ"

        **Scenario 3: Preset ក្លាយជាអាចជ្រើសរើសបានវិញ បន្ទាប់ពី Uncheck/Archive**
        - **Given** ចុងភៅ បាន Archive (Uncheck) Unit ណាមួយចេញ (ភ្ជាប់ជាមួយ US-30)
        - **When** ចុងភៅ បើកមើលបញ្ជី Preset ម្តងទៀត
        - **Then** Unit នោះលែងបង្ហាញសញ្ញាគ្រីស ហើយអាចជ្រើសរើសយកមកប្រើម្តងទៀតបាន

    *   **Technical Notes:**
        - ត្រូវ Query ស្ថានភាព "ប្រើរួច/មិនទាន់ប្រើ" របស់ Preset នីមួយៗ ដោយផ្អែកលើ Junction/Reference Table ចងភ្ជាប់ Preset ទៅ `ចុងភៅ_id` (ឧ. `ចុងភៅ_units`, `ចុងភៅ_categories`)
        - Disable Logic ត្រូវ Implement ទាំង Frontend (UX) និង Backend (Validation) ដើម្បីការពារការ Bypass ការហៅ API ដោយផ្ទាល់
        - State របស់ Checkbox ត្រូវ Sync ជាមួយ Real-time Data ពេល Modal Preset បើកម្តងទៀត (ជៀសវាង Stale Cache)

---

*   **US-30: Hide/Archive via Uncheck (Soft Delete)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **គ្រាន់តែដកសញ្ញាគ្រីស នៅក្នុងបញ្ជី Preset ដើម្បីលាក់ Unit/Category នោះ**, ដើម្បី **លាក់ទិន្នន័យដែលលែងប្រើ (Archive) ដោយមិនប៉ះពាល់ទិន្នន័យចាស់ៗ**។

    *   **Acceptance Criteria:**

        **Scenario 1: Uncheck ដើម្បី Archive ជោគជ័យ**
        - **Given** Unit/Category ណាមួយកំពុងបង្ហាញជាមាន Checked (កំពុងប្រើប្រាស់)
        - **When** ចុងភៅ ដកសញ្ញាគ្រីស (Uncheck) ចេញ
        - **Then** ប្រព័ន្ធកំណត់ Status ជា `archived`/`hidden` សម្រាប់ ចុងភៅ នេះ ហើយ Unit/Category នោះលែងបង្ហាញនៅក្នុង Dropdown ជម្រើសសកម្ម (Active) ថ្មីៗទៀត

        **Scenario 2: ទិន្នន័យចាស់ដែលធ្លាប់ប្រើ Unit/Category ដែល Archive រួច នៅតែបង្ហាញត្រឹមត្រូវ**
        - **Given** មានគ្រឿងផ្សំមួយចំនួនធ្លាប់ប្រើ Unit "គីឡូក្រាម" ដែលឥឡូវត្រូវបាន Archive
        - **When** ចុងភៅ មើលបញ្ជីគ្រឿងផ្សំចាស់ៗទាំងនោះ
        - **Then** Unit "គីឡូក្រាម" នៅតែបង្ហាញត្រឹមត្រូវលើទិន្នន័យចាស់ ដោយមិនត្រូវបានលុប ឬបង្ហាញ Error

        **Scenario 3: មិនអនុញ្ញាតឱ្យ Archive Unit ដែលកំពុងប្រើប្រាស់សកម្ម (Optional Guard)**
        - **Given** Unit ណាមួយកំពុងភ្ជាប់ជាមួយគ្រឿងផ្សំដែលកំពុងសកម្ម (Active Recipe/Ingredient)
        - **When** ចុងភៅ ព្យាយាម Uncheck Unit នោះ
        - **Then** ប្រព័ន្ធបង្ហាញ Warning Confirm (ឧ. "Unit នេះកំពុងប្រើប្រាស់ដោយ N គ្រឿងផ្សំ, នៅតែ Archive ដែរឬទេ?") មុនអនុញ្ញាតឱ្យបន្ត

    *   **Technical Notes:**
        - Archive ត្រូវជា Soft Delete ដោយប្រើ Field `status` (`active`/`archived`) ឬ `deleted_at` (Nullable Timestamp) មិនមែនលុប Record ចេញពី Database ជាដាច់ខាត
        - Query ទាញយក Dropdown សម្រាប់ការបញ្ចូលទិន្នន័យថ្មី ត្រូវ Filter តែ `status = active` ប៉ុណ្ណោះ ខណៈ Query សម្រាប់បង្ហាញទិន្នន័យចាស់ (Historical) មិនត្រូវ Filter តាម Status នេះ
        - Foreign Key Constraint ត្រូវរចនាឱ្យគាំទ្រ Soft Delete (មិនប្រើ `ON DELETE CASCADE`) ដើម្បីការពារទិន្នន័យប្រវត្តិសាស្ត្របាត់បង់

---