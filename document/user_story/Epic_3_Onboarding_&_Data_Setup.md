## Epic 3: Onboarding & Data Setup

*   **US-10: First-Time Onboarding Wizard**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅដែលទើបប្រើប្រព័ន្ធថ្មី**, ខ្ញុំចង់ **ទទួលបានការណែនាំជាជំហានៗ (Wizard) នៅពេល Log in ចូលប្រើលើកដំបូង**, ដើម្បី **ឱ្យខ្ញុំយល់ពីលំហូរការងារចម្បងៗ ជាជាងចូលមកឃើញអេក្រង់ទទេស្អាត**។

    *   **Acceptance Criteria:**

        **Scenario 1: Wizard បង្ហាញឡើងស្វ័យប្រវត្តិសម្រាប់ ចុងភៅ ថ្មី**
        - **Given** ចុងភៅទើប Login ចូលជាលើកដំបូង (បន្ទាប់ពី Verify Email ជោគជ័យ) ហើយមិនទាន់ធ្លាប់ឃើញ Wizard
        - **When** ប្រព័ន្ធនាំចូល Dashboard
        - **Then** Onboarding Wizard បង្ហាញឡើងភ្លាមៗ ដោយបង្ហាញជំហានៗនៃលំហូរការងារចម្បង (ឧ. បង្កើតគ្រឿងផ្សំ → បង្កើតមុខម្ហូប → គណនាតារាង)

        **Scenario 2: រំលង (Skip) Wizard**
        - **Given** Wizard កំពុងបង្ហាញ
        - **When** ចុងភៅចុច "Skip" ឬ "Close"
        - **Then** Wizard បិទបាត់ភ្លាមៗ ហើយប្រព័ន្ធកត់ត្រាថា ចុងភៅ នេះបានឃើញ Wizard រួច (មិនបង្ហាញម្តងទៀតលើកក្រោយ)

        **Scenario 3: ដំណើរការ Wizard រហូតដល់ចប់**
        - **Given** ចុងភៅកំពុងដំណើរការតាមជំហាននីមួយៗក្នុង Wizard
        - **When** ចុងភៅចុច "Next" រហូតដល់ជំហានចុងក្រោយ ហើយចុច "Finish"
        - **Then** Wizard បិទបាត់ ហើយប្រព័ន្ធកត់ត្រាថា Onboarding បានបញ្ចប់ (Completed) សម្រាប់ ចុងភៅ នេះ

        **Scenario 4: Wizard មិនបង្ហាញឡើងវិញសម្រាប់ ចុងភៅ ចាស់**
        - **Given** ចុងភៅ ធ្លាប់បញ្ចប់ ឬ Skip Wizard រួចហើយ
        - **When** ចុងភៅ Login ចូលប្រព័ន្ធនៅពេលក្រោយ (Session ថ្មី)
        - **Then** Dashboard បង្ហាញធម្មតាដោយគ្មាន Wizard លេចឡើងទៀត

        **Scenario 5: ចុងភៅចង់មើល Wizard ឡើងវិញដោយស្ម័គ្រចិត្ត**
        - **Given** ចុងភៅ ធ្លាប់ Skip ឬបញ្ចប់ Wizard រួច
        - **When** ចុងភៅ ចុច Menu "How it works" / "Show Tutorial" (ប្រសិនបើមាន Option នេះ)
        - **Then** Wizard បង្ហាញឡើងវិញពីជំហានទី 1

    *   **Technical Notes:**
        - បន្ថែម Field `has_completed_onboarding` (Boolean) ក្នុង ចុងភៅ Table ដើម្បីតាមដានស្ថានភាព
        - Wizard Content (Text, Image, Step Order) គួររៀបចំជា Config/JSON ដាច់ដោយឡែក ដើម្បីងាយកែប្រែ/បន្ថែមជំហាននាពេលអនាគត ដោយមិនចាំបាច់ Deploy Code ថ្មី
        - ត្រូវអនុលោមតាម i18n Framework (Epic 1) ព្រោះ Content របស់ Wizard ត្រូវបកប្រែបានទាំងខ្មែរ/អង់គ្លេស

---

*   **US-11: Seed Standard Presets (Unit / Category / Ingredient)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឃើញមានទិន្នន័យរង្វាស់រង្វាល់, ក្រុម, និងគ្រឿងផ្សំស្តង់ដារ មានស្រាប់តាំងពីដំបូង**, ដើម្បី **កុំឱ្យខ្ញុំចំណាយពេលវាយបញ្ចូលពាក្យទូទៅដោយខ្លួនឯងឡើងវិញ**។

    *   **Acceptance Criteria:**

        **Scenario 1: ទិន្នន័យ Presets មានស្រាប់ភ្លាមៗសម្រាប់ Account ថ្មី**
        - **Given** ចុងភៅ ថ្មីទើបបញ្ចប់ការចុះឈ្មោះ ហើយចូលទំព័រគ្រប់គ្រងគ្រឿងផ្សំជាលើកដំបូង
        - **When** ចុងភៅ មើលបញ្ជី Unit (ឧ. គីឡូក្រាម, លីត្រ), Category, និង Ingredient ស្តង់ដារ
        - **Then** ទិន្នន័យទាំងនោះបង្ហាញឡើងស្រាប់ ដោយ ចុងភៅ មិនចាំបាច់បង្កើតដោយខ្លួនឯង

        **Scenario 2: ចុងភៅ អាចប្រើ Preset រួមផ្សំជាមួយទិន្នន័យផ្ទាល់ខ្លួន**
        - **Given** Preset Ingredient មានស្រាប់ (ឧ. "សាច់មាន់")
        - **When** ចុងភៅ បន្ថែម Ingredient ថ្មីរបស់ខ្លួន (ឧ. "ត្រីអន្ទង់ក្រៀម")
        - **Then** ទាំង Preset និង Ingredient ថ្មីបង្ហាញរួមគ្នាក្នុងបញ្ជីតែមួយ ដោយមិនប៉ះទង្គិចគ្នា

        **Scenario 3: ចុងភៅ កែប្រែ ឬលុប Preset របស់ខ្លួន (Copy-on-write)**
        - **Given** ចុងភៅ ចង់កែប្រែ Unit/Category/Ingredient ដែលជា Preset ស្តង់ដារ
        - **When** ចុងភៅ ធ្វើការកែប្រែ ឬលុប
        - **Then** ការផ្លាស់ប្តូរប៉ះពាល់តែចំពោះ Account របស់ ចុងភៅ នោះប៉ុណ្ណោះ ដោយមិនប៉ះពាល់ Preset ដើមសម្រាប់ Account ផ្សេងទៀត

        **Scenario 4: Re-deploy Seed Script មិនបង្កើតទិន្នន័យស្ទួន**
        - **Given** Seed Script ធ្លាប់ដំណើរការរួចម្តងហើយសម្រាប់ Preset ស្តង់ដារ
        - **When** ក្រុម Dev Deploy កំណែថ្មីនៃប្រព័ន្ធ ហើយ Seed Script ដំណើរការម្តងទៀត
        - **Then** ចំនួន Preset នៅតែដដែល (មិនកើនច្រើនដងស្ទួន) ដោយប្រើ Logic `upsert`

    *   **Technical Notes:**
        - Seed Script ត្រូវប្រើ `upsert` (Update or Insert) ដោយផ្អែកលើ Unique Key (ឧ. `code` ឬ `slug`) មិនមែន Auto-increment ID ដើម្បីជៀសវាងទិន្នន័យស្ទួននៅពេល Deploy ដដែលៗ
        - គួរញែក Preset ជា Global/System-level data (មិនចង Foreign Key ទៅ ចុងភៅ ជាក់លាក់) ខណៈ Custom Data របស់ ចុងភៅ ត្រូវចង Foreign Key ទៅ `ចុងភៅ_id`
        - Field `is_preset` (Boolean) ឬ `source` (`system` / `ចុងភៅ`) ត្រូវបន្ថែមក្នុង Table ដើម្បីញែក UI (ឧ. បង្ហាញ Icon/Badge សម្គាល់ថាជា Preset) និងកំណត់សិទ្ធិកែប្រែ/លុប
        - Preset Data (ឈ្មោះ Unit/Category/Ingredient) ត្រូវផ្គូផ្គងជាមួយ i18n Framework (Epic 1) ដើម្បីអាចបង្ហាញបានទាំងខ្មែរ/អង់គ្លេស

---