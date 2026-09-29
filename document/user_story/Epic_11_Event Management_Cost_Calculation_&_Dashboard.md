## Epic 11: Event Management, Cost Calculation & Dashboard

*   **US-50: Create & Manage Event**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **បង្កើតកម្មវិធី (Event) ដោយកំណត់ឈ្មោះ កាលបរិច្ឆេទ និងចំនួនតុ**, ដើម្បី **រៀបចំចាត់ចែងមុខម្ហូប និងទិន្នន័យចំណាយសម្រាប់កម្មវិធីនីមួយៗដាច់ដោយឡែកពីគ្នា**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្កើត Event ជោគជ័យ**
        - **Given** ចុងភៅ នៅទំព័រ "Create Event" ហើយបំពេញឈ្មោះ, កាលបរិច្ឆេទ, និងចំនួនតុ
        - **When** ចុងភៅ ចុច "Save"
        - **Then** Event ថ្មីត្រូវបានបង្កើត ហើយបង្ហាញនៅក្នុងបញ្ជី Event ទាំងអស់

        **Scenario 2: ទុក Field ចាំបាច់ជាទទេ**
        - **Given** ចុងភៅ កំពុងបំពេញ Form Create Event
        - **When** ចុងភៅ ទុកឈ្មោះ ឬចំនួនតុជាទទេ រួចចុច "Save"
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ហើយមិនអនុញ្ញាតឱ្យបង្កើត Event

        **Scenario 3: បញ្ចូលចំនួនតុមិនត្រឹមត្រូវ**
        - **Given** ចុងភៅ កំពុងបំពេញ Field ចំនួនតុ
        - **When** ចុងភៅ វាយបញ្ចូលលេខ 0 ឬលេខអវិជ្ជមាន
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ថាចំនួនតុត្រូវធំជាង 0

        **Scenario 4: កែប្រែ Event ដែលមានស្រាប់**
        - **Given** ចុងភៅ កំពុងមើលព័ត៌មានលម្អិត Event ណាមួយ
        - **When** ចុងភៅ កែឈ្មោះ, កាលបរិច្ឆេទ, ឬចំនួនតុ រួចចុច "Save"
        - **Then** ព័ត៌មាន Event ត្រូវបានធ្វើបច្ចុប្បន្នភាព ព្រមទាំងគណនាចំណាយឡើងវិញ (ភ្ជាប់ US-53) ប្រសិនបើចំនួនតុផ្លាស់ប្តូរ

    *   **Technical Notes:**
        - Table `events` ត្រូវមាន Field `name`, `event_date`, `table_count`, `ចុងភៅ_id`, `status`
        - ការផ្លាស់ប្តូរ `table_count` ត្រូវ Trigger ការគណនាឡើងវិញនៃ Shopping List/Cost (US-53) ព្រោះជា Multiplier ចម្បង
        - Event ត្រូវជា Container ចម្បងផ្ទុក Dish/Menu Set ដែលបានជ្រើសរើស (ភ្ជាប់ US-52)

---

*   **US-51: Clone / Duplicate Event**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចចម្លង (Clone) កម្មវិធីចាស់ណាមួយទៅជាកម្មវិធីថ្មីមួយទៀត**, ដើម្បី **រៀបចំពិធីដែលមានលក្ខណៈស្រដៀងគ្នាបានរហ័ស ដោយមិនចាំបាច់អង្គុយរើសមុខម្ហូបឡើងវិញតាំងពីដើម**។

    *   **Acceptance Criteria:**

        **Scenario 1: Clone Event ជោគជ័យ**
        - **Given** ចុងភៅ កំពុងមើលបញ្ជី Event
        - **When** ចុងភៅ ចុច "Clone" លើ Event ណាមួយ
        - **Then** Event ថ្មីត្រូវបានបង្កើត ដោយចម្លងមុខម្ហូប/Menu Set ដែលបានជ្រើសរើសទាំងអស់ដូចដើម ប៉ុន្តែដាក់ឈ្មោះថ្មី (ឧ. "ឈ្មោះដើម (Copy)") និងស្នើសុំកាលបរិច្ឆេទថ្មី

        **Scenario 2: កែប្រែ Event ថ្មីដោយឯករាជ្យពី Event ដើម**
        - **Given** Event ថ្មីត្រូវបានបង្កើតដោយ Clone រួច
        - **When** ចុងភៅ កែប្រែមុខម្ហូប ឬចំនួនតុរបស់ Event ថ្មីនេះ
        - **Then** Event ដើមមិនត្រូវបានប៉ះពាល់ឡើយ

    *   **Technical Notes:**
        - Clone ត្រូវជា Deep Copy (Event + Event-Dish Junction Records) មិនមែន Reference ទៅ Event ដើម
        - ត្រូវ Prompt ចុងភៅ ឱ្យបញ្ចូលកាលបរិច្ឆេទ Event ថ្មីភ្លាមៗពេល Clone (មិនចម្លងកាលបរិច្ឆេទចាស់ដោយស្វ័យប្រវត្តិ) ដើម្បីជៀសវាងច្រឡំ

---

*   **US-52: Add Dishes / Menu Set to Event**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ជ្រើសរើសបន្ថែមមុខម្ហូបរាយ ឬទាញយកកញ្ចប់ម៉ឺនុយ (Menu Set) ទាំងមូលចូលទៅក្នុងកម្មវិធី**, ដើម្បី **កំណត់មុខម្ហូបជូនភ្ញៀវបានយ៉ាងរហ័ស**។

    *   **Acceptance Criteria:**

        **Scenario 1: បន្ថែមមុខម្ហូបរាយម្តងមួយៗ**
        - **Given** ចុងភៅ កំពុងកែប្រែ Event
        - **When** ចុងភៅ ជ្រើសរើសមុខម្ហូបរាយពីបញ្ជីទាំងអស់ ហើយបន្ថែមចូល Event
        - **Then** មុខម្ហូបនោះត្រូវបានបញ្ចូលទៅក្នុង Event ភ្លាមៗ

        **Scenario 2: ទាញយក Menu Set ទាំងមូលចូល Event**
        - **Given** ចុងភៅ កំពុងកែប្រែ Event
        - **When** ចុងភៅ ជ្រើសរើស Menu Set ណាមួយ ហើយចុច "Add Menu Set"
        - **Then** មុខម្ហូបទាំងអស់ក្នុង Menu Set នោះត្រូវបានបញ្ចូលចូល Event ក្នុងពេលតែមួយ

        **Scenario 3: បន្ថែមមុខម្ហូបស្ទួន (ធ្លាប់មានក្នុង Event រួច)**
        - **Given** មុខម្ហូបណាមួយត្រូវបានបន្ថែមចូល Event រួចហើយ (ដោយផ្ទាល់ ឬតាម Menu Set)
        - **When** ចុងភៅ ព្យាយាមបន្ថែមមុខម្ហូបដដែលនោះម្តងទៀត
        - **Then** ប្រព័ន្ធរារាំង ឬបញ្ជូនសារ ថាមុខម្ហូបនេះមានក្នុង Event រួចហើយ (មិនបន្ថែមស្ទួន)

    *   **Technical Notes:**
        - Junction Table `event_dishes` (`event_id`, `dish_id`) ត្រូវមាន Unique Constraint លើគូនេះ ដើម្បីការពារស្ទួន
        - ការបន្ថែម Menu Set ត្រូវ "Expand" ជា Individual Dish Records ចូល `event_dishes` (មិនរក្សា Reference ទៅ Menu Set ដោយផ្ទាល់) ដើម្បីអនុញ្ញាតឱ្យកែប្រែឯករាជ្យក្រោយបន្ថែម

---

*   **US-53: View Event Cost Calculation (Auto-Shopping List)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលការគណនាចំណាយ ដែលប្រព័ន្ធបូកសរុបគ្រឿងផ្សំចេញជាបញ្ជីទិញទំនិញ ព្រមទាំងគុណនឹងចំនួនតុដោយស្វ័យប្រវត្តិ**, ដើម្បី **ដឹងច្បាស់ថាត្រូវដើរទិញអ្វីខ្លះ ចំនួនប៉ុន្មាន និងត្រៀមថវិកាសរុបប៉ុន្មាន**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្កើត Shopping List ដោយបូក/គុណត្រឹមត្រូវ**
        - **Given** Event មានមុខម្ហូបជាច្រើនប្រើគ្រឿងផ្សំដូចគ្នាមួយចំនួន (ឧ. ខ្ទឹមស ប្រើក្នុងច្រើនមុខម្ហូប) និងកំណត់ចំនួនតុ
        - **When** ចុងភៅ មើលទំព័រ "Cost Calculation / Shopping List"
        - **Then** ប្រព័ន្ធ Group គ្រឿងផ្សំដូចគ្នាបូកសរុបបរិមាណពីគ្រប់មុខម្ហូបចូលគ្នាជាមួយជួរតែមួយ រួចគុណនឹងចំនួនតុ ដើម្បីបានចំនួនត្រូវទិញសរុប

        **Scenario 2: បង្ហាញថវិកាសរុប**
        - **Given** Shopping List ត្រូវបានគណនារួច
        - **When** ចុងភៅ មើលទំព័រនេះ
        - **Then** ប្រព័ន្ធបង្ហាញចំនួនទឹកប្រាក់សរុប (Total Budget) ដែលត្រូវការសម្រាប់ Event នេះ

        **Scenario 3: ការគណនាធ្វើបច្ចុប្បន្នភាពភ្លាមៗនៅពេលកែប្រែចំនួនតុ ឬមុខម្ហូប**
        - **Given** ចុងភៅ កំពុងមើល Shopping List
        - **When** ចុងភៅ ត្រឡប់ទៅកែប្រែចំនួនតុ ឬបន្ថែម/ដកមុខម្ហូបចេញពី Event
        - **Then** Shopping List ត្រូវបានគណនាឡើងវិញឆ្លុះបញ្ចាំងតម្លៃ/បរិមាណថ្មីភ្លាមៗ

    *   **Technical Notes:**
        - Logic Aggregation: សម្រាប់គ្រឿងផ្សំនីមួយៗ គណនា `SUM(quantity_used ទាំងអស់ក្នុងគ្រប់ Dish នៃ Event) × table_count`
        - ត្រូវប្រែក្លាយ Unit ទាំងអស់ទៅជា Base Unit រួម (ដោយប្រើ Conversion Rate ពី US-27) មុន Group/Sum ដើម្បីជៀសវាងកំហុសបូកបញ្ចូល Unit ខុសគ្នា
        - Query នេះជា Heavy Aggregation គួរ Optimize ដោយប្រើ SQL Aggregation Function (`GROUP BY`, `SUM`) នៅ Database Level ជាជាង Loop គណនានៅ Application Layer

---

*   **US-54: View Dashboard (Overview)**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលទំព័រ Dashboard សង្ខេបនៅពេលបើកចូលប្រព័ន្ធដំបូង**, ដើម្បី **ឃើញទិដ្ឋភាពរួមនៃការងារប្រចាំខែ និងដឹងពីកាលវិភាគកម្មវិធីដែលជិតមកដល់**។

    *   **Acceptance Criteria:**

        **Scenario 1: Dashboard បង្ហាញ Event ជិតមកដល់**
        - **Given** ចុងភៅ មាន Event ដែលកំណត់កាលបរិច្ឆេទនាពេលអនាគត
        - **When** ចុងភៅ Login ចូល Dashboard
        - **Then** ប្រព័ន្ធបង្ហាញបញ្ជី Event ជិតមកដល់តាមលំដាប់កាលបរិច្ឆេទ (ជិតបំផុតមុន)

        **Scenario 2: Dashboard បង្ហាញសង្ខេបស្ថិតិប្រចាំខែ**
        - **Given** ចុងភៅ មាន Event ធ្លាប់បញ្ចប់ក្នុងខែបច្ចុប្បន្ន
        - **When** ចុងភៅ មើល Dashboard
        - **Then** ប្រព័ន្ធបង្ហាញស្ថិតិសង្ខេប (ឧ. ចំនួន Event ក្នុងខែនេះ, ចំណាយសរុបប្រចាំខែ)

        **Scenario 3: Empty State សម្រាប់ ចុងភៅ ថ្មី**
        - **Given** ចុងភៅ ថ្មីមិនទាន់មាន Event ណាមួយសោះ
        - **When** ចុងភៅ ចូល Dashboard
        - **Then** ប្រព័ន្ធបង្ហាញ Empty State ជាមួយ Call-to-Action "Create your first Event"

    *   **Technical Notes:**
        - Dashboard Query ត្រូវ Aggregate ទិន្នន័យពី `events` Table (Filter តាម `ចុងភៅ_id`, ចាត់ថ្នាក់តាមខែ/កាលបរិច្ឆេទ)
        - គួរ Cache/Optimize Dashboard Query ព្រោះទាញយករាល់ពេល Login (Query ញឹកញាប់)

---

*   **US-55: Create & Save Vendor Presets (View & Report Templates)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចងក្រង និងរក្សាទុកក្រុមគ្រឿងផ្សំទៅជាទម្រង់អ្នកលក់ (Vendor Presets ឧ. ម៉ូយសាច់)**, ដើម្បី **ប្រើជាជម្រើស Filter មើលទិន្នន័យ ឬ Print Report ដោយមិនបាច់រើសក្រុមគ្រឿងផ្សំឡើងវិញរាល់ដង**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្កើត Vendor Preset ថ្មីជោគជ័យ**
        - **Given** ចុងភៅ កំពុងមើលបញ្ជីគ្រឿងផ្សំក្នុង Shopping List
        - **When** ចុងភៅ ជ្រើសរើសគ្រឿងផ្សំមួយចំនួន ដាក់ឈ្មោះ Template (ឧ. "ម៉ូយសាច់") ហើយចុច "Save Template"
        - **Then** Vendor Preset ថ្មីត្រូវបានរក្សាទុក ហើយបង្ហាញក្នុង Dropdown Template Manager សម្រាប់ប្រើលើកក្រោយ

        **Scenario 2: កែប្រែ Template ជាបណ្តោះអាសន្នដោយមិន Auto-save**
        - **Given** ចុងភៅ ជ្រើសរើស Template ដែលមានស្រាប់ ហើយចុច `[+]`/`[x]` ដើម្បីបន្ថែម/ដកគ្រឿងផ្សំមួយចំនួន
        - **When** ចុងភៅ មិនចុច "Save Template" ជាថ្មី (គ្រាន់តែបន្តទៅ Print/View)
        - **Then** ការផ្លាស់ប្តូរនោះមានប្រសិទ្ធភាពសម្រាប់ Session/View បច្ចុប្បន្នប៉ុណ្ណោះ ដោយ Template ដើមមិនត្រូវបានកែប្រែ

        **Scenario 3: លុប Vendor Preset**
        - **Given** ចុងភៅ មើលបញ្ជី Template ដែលបានរក្សាទុក
        - **When** ចុងភៅ ចុច "Delete" លើ Template ណាមួយ ហើយបញ្ជាក់
        - **Then** Template នោះត្រូវបានលុបចេញពីបញ្ជី ដោយមិនប៉ះពាល់ដល់គ្រឿងផ្សំ ឬ Event ដែលពាក់ព័ន្ធ

    *   **Technical Notes:**
        - Table `vendor_presets` (`id`, `name`, `ចុងភៅ_id`) និង Junction Table `vendor_preset_ingredients` (`preset_id`, `ingredient_id`) ត្រូវរក្សា Group គ្រឿងផ្សំ
        - ការកែប្រែបណ្តោះអាសន្ន (Ad-hoc Edit មិន Save) ត្រូវគ្រប់គ្រងជា Frontend/Local State ប៉ុណ្ណោះ មិនហៅ API Update Template ដើមទេ លុះត្រាតែ ចុងភៅ ចុច "Save" ជាក់ស្តែង

---

*   **US-56: View & Filter Shopping List by Vendor Presets**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលបញ្ជីទិញទំនិញនៅលើអេក្រង់ ដោយជ្រើសរើសមើលតាមក្រុម ឬទម្រង់អ្នកលក់ដែលខ្ញុំបានរក្សាទុក**, ដើម្បី **ងាយស្រួលផ្ទៀងផ្ទាត់ទិន្នន័យឱ្យបានច្បាស់លាស់ មុននឹងសម្រេចចិត្ត Print**។

    *   **Acceptance Criteria:**

        **Scenario 1: Filter Shopping List តាម Vendor Preset**
        - **Given** ចុងភៅ កំពុងមើល Shopping List ពេញលេញរបស់ Event
        - **When** ចុងភៅ ជ្រើសរើស Vendor Preset ណាមួយ (ឧ. "ម៉ូយសាច់") ពី Dropdown
        - **Then** ប្រព័ន្ធបង្ហាញតែគ្រឿងផ្សំដែលមាននៅក្នុង Preset នោះប៉ុណ្ណោះ ព្រមទាំងបរិមាណដែលបានគណនារួច (US-53)

        **Scenario 2: មើលបញ្ជីទាំងអស់ (No Filter)**
        - **Given** ចុងភៅ មិនបានជ្រើសរើស Vendor Preset ណាមួយ
        - **When** ចុងភៅ មើលទំព័រ Shopping List
        - **Then** ប្រព័ន្ធបង្ហាញគ្រឿងផ្សំទាំងអស់ដោយមិន Filter

        **Scenario 3: គ្រឿងផ្សំមួយចំនួនមិនមានក្នុង Preset ណាមួយសោះ**
        - **Given** Shopping List មានគ្រឿងផ្សំមួយចំនួនមិនត្រូវបានចាត់ចូល Vendor Preset ណាមួយ
        - **When** ចុងភៅ Filter តាម Preset ជាក់លាក់
        - **Then** គ្រឿងផ្សំដែលមិនស្ថិតក្នុង Preset នោះមិនបង្ហាញ ប៉ុន្តែ ចុងភៅ អាចជ្រើសរើស Filter "Uncategorized" ដើម្បីមើលពួកវាដាច់ដោយឡែក

    *   **Technical Notes:**
        - Filter ត្រូវធ្វើនៅ Frontend ដោយផ្អែកលើទិន្នន័យ Shopping List ដែលទាញយករួច (មិនចាំបាច់ហៅ API ថ្មីរាល់ពេល Filter) ដើម្បីល្បឿនលឿន
        - ត្រូវមាន Option "Uncategorized"/"All" ជា Default Filter State

---

*   **US-57: Quick Edit Report Items Before Export**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចកែប្រែបញ្ជីគ្រឿងផ្សំ (ថែម/ដក) ភ្លាមៗនៅក្នុងទំព័រ Preview មុននឹងចុច Generate ជា PDF**, ដើម្បី **មានភាពបត់បែនក្នុងករណីមានការផ្លាស់ប្តូរជាក់ស្តែង ដោយមិនប៉ះពាល់ដល់ Template ដើម**។

    *   **Acceptance Criteria:**

        **Scenario 1: បន្ថែម/ដកគ្រឿងផ្សំក្នុងទំព័រ Preview**
        - **Given** ចុងភៅ កំពុងមើលទំព័រ Preview មុន Generate PDF
        - **When** ចុងភៅ ថែម ឬដកគ្រឿងផ្សំណាមួយ ក៏ដូចជាកែបរិមាណ
        - **Then** ការផ្លាស់ប្តូរនោះមានប្រសិទ្ធភាពសម្រាប់ PDF ដែលនឹង Generate តែប៉ុណ្ណោះ ដោយ Vendor Preset ដើម (US-55) មិនត្រូវបានប៉ះពាល់

        **Scenario 2: Reset Preview ត្រឡប់ទៅទិន្នន័យដើម**
        - **Given** ចុងភៅ បានធ្វើការកែប្រែមួយចំនួនក្នុង Preview
        - **When** ចុងភៅ ចុច "Reset"/"Undo All"
        - **Then** Preview ត្រឡប់ទៅបង្ហាញទិន្នន័យដើមពី Shopping List/Template ដដែល

    *   **Technical Notes:**
        - ការកែប្រែក្នុង Preview ត្រូវគ្រប់គ្រងជា Local/Session State ប៉ុណ្ណោះ (មិន Persist ទៅ Database) លុះត្រាតែមាន Action "Save as Template" ជាក់ស្តែងដាច់ដោយឡែក
        - State នេះត្រូវបញ្ជូនទៅ PDF Generation Service (US-58) នៅពេលចុច "Generate" ចុងក្រោយ

---

*   **US-58: Generate Custom PDF Purchasing Report (A4)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ចុចបង្កើតរបាយការណ៍បញ្ជាទិញជាទម្រង់ PDF ទំហំ A4 សម្រាប់ក្រុមគ្រឿងផ្សំណាមួយដែលខ្ញុំបានជ្រើសរើស**, ដើម្បី **Print ក្រដាសនេះ ឬផ្ញើតាម Telegram ទៅឱ្យម៉ូយនីមួយៗរៀបចំអីវ៉ាន់ទុកឱ្យខ្ញុំយ៉ាងងាយស្រួល**។

> **PDF Layout (Business Secret):** ត្រូវបង្ហាញតែ "ឈ្មោះគ្រឿងផ្សំ" និង "ចំនួន" ប៉ុណ្ណោះ **(លាក់តម្លៃទិញចូលដាច់ខាត)**។

    *   **Acceptance Criteria:**

        **Scenario 1: Generate PDF ជោគជ័យ**
        - **Given** ចុងភៅ កំពុងមើលទំព័រ Preview (ដែលបានកែប្រែ ឬមិនកែក៏បាន)
        - **When** ចុងភៅ ចុច "Generate PDF"
        - **Then** ប្រព័ន្ធបង្កើត File PDF ទំហំ A4 មាន "ឈ្មោះគ្រឿងផ្សំ" និង "ចំនួន" ប៉ុណ្ណោះ ដោយពុំមានតម្លៃទិញចូលបង្ហាញឡើយ

        **Scenario 2: Download PDF**
        - **Given** PDF ត្រូវបាន Generate ជោគជ័យ
        - **When** ចុងភៅ ចុច "Download"
        - **Then** File PDF ត្រូវបានទាញយកទៅកាន់ឧបករណ៍របស់ ចុងភៅ

        **Scenario 3: ផ្ញើ PDF តាម Telegram ដោយផ្ទាល់**
        - **Given** PDF ត្រូវបាន Generate ជោគជ័យ ហើយ ចុងភៅ បានភ្ជាប់ Telegram Account/Bot រួច
        - **When** ចុងភៅ ចុច "Send via Telegram"
        - **Then** File PDF ត្រូវបានផ្ញើទៅកាន់ Telegram Chat/Channel ដែលបានកំណត់ដោយផ្ទាល់ពីប្រព័ន្ធ

    *   **Technical Notes:**
        - PDF Generation Service (ឧ. Puppeteer, wkhtmltopdf ឬ Library ស្រដៀងគ្នា) ត្រូវរចនា Template A4 ដាច់ដោយឡែក ដែល Hardcode Field បង្ហាញ (ឈ្មោះ, ចំនួន) ដោយមិន Query/Pass Field តម្លៃចូល Template ជាដាច់ខាត (ការពារ Business Secret Leak)
        - Integration ជាមួយ Telegram Bot API ត្រូវការ ចុងភៅ ភ្ជាប់ Bot Token/Chat ID ជាមុន (ដាច់ដោយឡែកជា Setting)
        - PDF File ត្រូវរក្សាទុកបណ្តោះអាសន្ន (Temp Storage) សម្រាប់ Download/Send រួចលុបចោលក្រោយពេលកំណត់ ដើម្បីសន្សំទំហំផ្ទុក

---

*   **US-59: Export Cost Report to Excel/CSV**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ ឬម្ចាស់ហាង**, ខ្ញុំចង់ **អាចទាញយកទិន្នន័យចំណាយ (Cost Data) នៃកម្មវិធីនីមួយៗ ឬរបាយការណ៍ចំណាយប្រចាំខែចេញជាទម្រង់ឯកសារ Excel ឬ CSV**, ដើម្បី **យកទិន្នន័យទាំងនោះទៅធ្វើបញ្ជីគណនេយ្យ ទូទាត់ និងវិភាគប្រាក់ចំណេញ-ខាត នៅក្នុងកុំព្យូទ័របានកាន់តែងាយស្រួល និងលម្អិត**។

    *   **Acceptance Criteria:**

        **Scenario 1: Export Excel/CSV ជោគជ័យសម្រាប់ Event តែមួយ**
        - **Given** ចុងភៅ កំពុងមើលព័ត៌មានលម្អិត Event ណាមួយ
        - **When** ចុងភៅ ចុច "Export to Excel" ឬ "Export to CSV"
        - **Then** ប្រព័ន្ធបង្កើត File Excel/CSV មាន Column (ឈ្មោះម្ហូប, គ្រឿងផ្សំ, បរិមាណ, តម្លៃរាយ, តម្លៃសរុប) គ្រប់ជួរតាមទិន្នន័យ Event នោះ

        **Scenario 2: Export របាយការណ៍ចំណាយប្រចាំខែ**
        - **Given** ចុងភៅ នៅទំព័រ Dashboard/Report ហើយជ្រើសរើសខែជាក់លាក់
        - **When** ចុងភៅ ចុច "Export Monthly Report"
        - **Then** ប្រព័ន្ធបង្កើត File Excel/CSV រួមទិន្នន័យរបស់គ្រប់ Event ក្នុងខែនោះ ព្រមទាំងសរុបចំណាយសរុបប្រចាំខែ

        **Scenario 3: Export ខណៈគ្មានទិន្នន័យ (Empty Month/Event)**
        - **Given** ខែ ឬ Event ដែលជ្រើសរើសគ្មានទិន្នន័យចំណាយណាមួយ
        - **When** ចុងភៅ ចុច "Export"
        - **Then** ប្រព័ន្ធបង្ហាញសារជូនដំណឹងថាគ្មានទិន្នន័យសម្រាប់ Export ជាជាងបង្កើត File ទទេ

    *   **Technical Notes:**
        - ត្រូវប្រើ Library Generate Excel (ឧ. `exceljs`, `SheetJS`) ឬ CSV Writer នៅ Backend ដើម្បីធានាទិន្នន័យត្រឹមត្រូវ (ជៀសវាង Encoding Issue សម្រាប់អក្សរខ្មែរ - ត្រូវប្រើ UTF-8 with BOM សម្រាប់ CSV)
        - Excel Export ត្រូវផ្ទុយពី PDF (US-58) ដោយបង្ហាញ Column តម្លៃពេញលេញ (Column Set ខុសគ្នាទាំងស្រុងរវាង PDF Template និង Excel Template)
        - Query សម្រាប់ Monthly Report ត្រូវ Aggregate ទិន្នន័យឆ្លងកាត់ Event ច្រើន (Group By Event, Sum Cost) ក្នុង Time Range ដែលបានកំណត់

---