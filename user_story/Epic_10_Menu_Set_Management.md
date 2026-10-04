## Epic 10: Menu Set Management

*   **US-45: Create & Manage Menu Set**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **បង្កើតកញ្ចប់ម៉ឺនុយ (Menu Set) ដោយការផ្សំមុខម្ហូបជាច្រើនចូលគ្នា**, ដើម្បី **ងាយស្រួលទាញយកទៅប្រើប្រាស់ម្តងមួយកញ្ចប់នៅពេលរៀបចំកម្មវិធី ជំនួសការរើសម្តងមួយៗ**។

    *   **Acceptance Criteria:**

        **Scenario 1: បង្កើត Menu Set ជោគជ័យ**
        - **Given** ចុងភៅ នៅទំព័រ "Create Menu Set" ហើយបំពេញឈ្មោះកញ្ចប់
        - **When** ចុងភៅ ជ្រើសរើសមុខម្ហូបពីបញ្ជីរួម (យ៉ាងតិចមួយ) បញ្ចូលទៅក្នុងកញ្ចប់ រួចចុច "Save"
        - **Then** Menu Set ថ្មីត្រូវបានបង្កើត ព្រមទាំងផ្ទុកមុខម្ហូបទាំងអស់ដែលបានជ្រើសរើស

        **Scenario 2: មិនបានជ្រើសរើសមុខម្ហូបណាមួយសោះ**
        - **Given** ចុងភៅ កំពុងបង្កើត Menu Set
        - **When** ចុងភៅ ចុច "Save" ដោយមិនទាន់បន្ថែមមុខម្ហូបណាមួយ
        - **Then** ប្រព័ន្ធបង្ហាញ Validation Error ថាត្រូវការមុខម្ហូបយ៉ាងតិចមួយ ហើយមិនអនុញ្ញាតឱ្យ Save

        **Scenario 3: បន្ថែមមុខម្ហូបដដែលស្ទួនចូល Set តែមួយ**
        - **Given** មុខម្ហូបណាមួយត្រូវបានបន្ថែមចូល Menu Set រួចហើយ
        - **When** ចុងភៅ ព្យាយាមបន្ថែមមុខម្ហូបដដែលនោះម្តងទៀត
        - **Then** ប្រព័ន្ធរារាំង ឬបង្ហាញសារជូនដំណឹងថាមុខម្ហូបនេះមានក្នុងកញ្ចប់រួចហើយ

    *   **Technical Notes:**
        - Table `menu_sets` និង Junction Table `menu_set_dishes` (`menu_set_id`, `dish_id`) ត្រូវរក្សាទំនាក់ទំនង Many-to-Many
        - Constraint Unique លើគូ (`menu_set_id`, `dish_id`) ដើម្បីការពារការបន្ថែមមុខម្ហូបស្ទួនចូល Set តែមួយ

---

*   **US-46: Auto-Calculate Menu Set Total Cost**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **មើលឃើញថ្លៃដើមសរុបនៃកញ្ចប់ម៉ឺនុយនីមួយៗ ដែលបូកបញ្ចូលគ្នាដោយស្វ័យប្រវត្តិ**, ដើម្បី **ដឹងច្បាស់ពីចំណាយសរុបប្រចាំតុ និងងាយស្រួលកំណត់តម្លៃលក់ជូនភ្ញៀវ**។

    *   **Acceptance Criteria:**

        **Scenario 1: គណនាថ្លៃដើមសរុបជោគជ័យ**
        - **Given** Menu Set មានមុខម្ហូបជាច្រើនដែលនីមួយៗមានថ្លៃដើមផ្ទាល់ខ្លួន
        - **When** ចុងភៅ មើលព័ត៌មានលម្អិត Menu Set នោះ
        - **Then** ប្រព័ន្ធបង្ហាញថ្លៃដើមសរុប (Total Cost) ដែលបូកបញ្ចូលថ្លៃដើមមុខម្ហូបទាំងអស់ក្នុងកញ្ចប់ដោយស្វ័យប្រវត្តិ

        **Scenario 2: ថ្លៃដើមសរុបធ្វើបច្ចុប្បន្នភាពតាមការផ្លាស់ប្តូរថ្លៃមុខម្ហូប**
        - **Given** មុខម្ហូបណាមួយក្នុង Menu Set មានថ្លៃដើមផ្លាស់ប្តូរ (ភ្ជាប់ជាមួយ US-42 Dynamic Costing)
        - **When** ចុងភៅ មើល Menu Set នោះម្តងទៀត
        - **Then** ថ្លៃដើមសរុបត្រូវបានគណនាឡើងវិញដោយស្វ័យប្រវត្តិ ឆ្លុះបញ្ចាំងតម្លៃថ្មីបំផុត

    *   **Technical Notes:**
        - Total Cost របស់ Menu Set ត្រូវគណនាជា Real-time (Computed on Read) ដោយបូក Total Cost របស់ Dish នីមួយៗពី US-42 មិនរក្សាទុកជា Static Value
        - ត្រូវពិចារណា Performance ចំពោះ Menu Set ដែលមានមុខម្ហូបច្រើន (Batch Query ជំនួស N+1 Query ក្នុងការទាញថ្លៃដើមមុខម្ហូបនីមួយៗ)

---

*   **US-47: Customize Existing Menu Set**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចកែប្រែបន្ថែម ដកចេញ ឬផ្លាស់ប្តូរមុខម្ហូបណាមួយនៅក្នុងឈុតនោះបានដោយសេរី**, ដើម្បី **តម្រូវតាមចំណង់ចំណូលចិត្តភ្ញៀវ មុននឹងទាញយកកញ្ចប់នោះទៅប្រើ**។

    *   **Acceptance Criteria:**

        **Scenario 1: បន្ថែម/ដកមុខម្ហូបចេញពី Menu Set ដែលមានស្រាប់**
        - **Given** ចុងភៅ កំពុងកែប្រែ Menu Set ដែលមានស្រាប់
        - **When** ចុងភៅ បន្ថែមមុខម្ហូបថ្មី ឬដកមុខម្ហូបចាស់ចេញ រួចចុច "Save"
        - **Then** Menu Set ត្រូវបានធ្វើបច្ចុប្បន្នភាព ព្រមទាំងគណនាថ្លៃដើមសរុបឡើងវិញភ្លាមៗ

        **Scenario 2: ការកែប្រែមួយ Menu Set មិនប៉ះពាល់ Event/Order ចាស់ដែលធ្លាប់ប្រើ Menu Set នេះរួច**
        - **Given** Menu Set នេះធ្លាប់ត្រូវបានប្រើក្នុងកម្មវិធី/Order ណាមួយរួចហើយ
        - **When** ចុងភៅ កែប្រែមុខម្ហូបក្នុង Menu Set ថ្មីនាពេលបច្ចុប្បន្ន
        - **Then** ព័ត៌មាន Order ចាស់ត្រូវរក្សា Snapshot ដើមទុក ដោយមិនផ្លាស់ប្តូរតាមការកែប្រែថ្មីនេះ

    *   **Technical Notes:**
        - ត្រូវពិចារណា Snapshot Pattern ចំពោះ Order/Event ដែលភ្ជាប់ជាមួយ Menu Set (Copy ទិន្នន័យមុខម្ហូប/ថ្លៃនៅពេលបញ្ជាទិញ ជំនួស Live Reference) ដើម្បីការពារប្រវត្តិសាស្ត្រ Order ខូច
        - Update Menu Set ត្រូវប្រើ Strategy ស្រដៀង US-39 (Replace All Junction Records ក្នុង Transaction តែមួយ)

---

*   **US-48: Two-pane View / Drag & Drop for Menu Set**
    *   **Priority:** Should
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ប្រើប្រាស់ទម្រង់បែងចែកអេក្រង់ជាពីរ ឬមុខងារអូសទម្លាក់ (Drag & Drop)**, ដើម្បី **ងាយស្រួលទាញមុខម្ហូបពីបញ្ជីរួម បញ្ចូលទៅក្នុងកញ្ចប់ម៉ឺនុយបានរហ័ស**។

    *   **Acceptance Criteria:**

        **Scenario 1: អូសមុខម្ហូបពី Pane ឆ្វេងទៅ Pane ស្តាំជោគជ័យ**
        - **Given** ចុងភៅ កំពុងមើល Two-pane View (ឆ្វេង=បញ្ជីមុខម្ហូបទាំងអស់, ស្តាំ=កញ្ចប់ Menu)
        - **When** ចុងភៅ អូស (Drag) មុខម្ហូបពី Pane ឆ្វេង ទៅទម្លាក់ (Drop) ក្នុង Pane ស្តាំ
        - **Then** មុខម្ហូបនោះត្រូវបានបន្ថែមចូល Menu Set ភ្លាមៗ ដោយបង្ហាញនៅ Pane ស្តាំ

        **Scenario 2: អូសមុខម្ហូបចេញពី Pane ស្តាំដើម្បីដក**
        - **Given** Menu Set មានមុខម្ហូបនៅ Pane ស្តាំ
        - **When** ចុងភៅ អូសមុខម្ហូបនោះចេញពី Pane ស្តាំ (ឬចុចប៊ូតុង "Remove")
        - **Then** មុខម្ហូបនោះត្រូវបានដកចេញពី Menu Set ភ្លាមៗ

        **Scenario 3: ប្រើប្រាស់ជំនួស Drag & Drop លើ Mobile/Touch Device**
        - **Given** ចុងភៅ កំពុងប្រើប្រាស់ឧបករណ៍ដែលមិនងាយធ្វើ Drag & Drop (ឧ. Mobile)
        - **When** ចុងភៅ ចុចប៊ូតុង "Add"/"+" នៅលើមុខម្ហូបក្នុង Pane ឆ្វេង
        - **Then** មុខម្ហូបនោះត្រូវបានបន្ថែមចូល Menu Set ដូចលទ្ធផលនៃការអូសដែរ (Fallback Interaction)

    *   **Technical Notes:**
        - ត្រូវប្រើ Library Drag & Drop ស្តង់ដារ (ឧ. `dnd-kit`, `react-beautiful-dnd`) ដែលគាំទ្រទាំង Mouse និង Touch Event
        - ចាំបាច់ត្រូវមាន Accessible Fallback (ប៊ូតុង Add/Remove) សម្រាប់ឧបករណ៍/Browser ដែលមិនគាំទ្រ Drag & Drop ពេញលេញ ឬអ្នកប្រើប្រាស់ដែលប្រើ Keyboard Navigation

---

*   **US-49: Real-time & Sticky Total Cost Highlight**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **ឃើញថ្លៃដើមសរុបបង្ហាញជាប់ជានិច្ចនៅផ្នែកខាងលើ/ក្រោម និងលោតផ្លាស់ប្តូរលេខភ្លាមៗ**, ដើម្បី **ងាយស្រួលតាមដានការប្រែប្រួលចំណាយ ពេលកំពុងចុចថែម/ដកមុខម្ហូប**។

    *   **Acceptance Criteria:**

        **Scenario 1: Total Cost បង្ហាញភ្លាមៗនៅពេលបន្ថែម/ដកមុខម្ហូប**
        - **Given** ចុងភៅ កំពុងបង្កើត/កែប្រែ Menu Set
        - **When** ចុងភៅ បន្ថែម ឬដកមុខម្ហូបចេញ
        - **Then** លេខ Total Cost នៅ Sticky Bar ត្រូវផ្លាស់ប្តូរភ្លាមៗ (Real-time) ដោយមិនចាំបាច់ Reload ឬចុច Refresh

        **Scenario 2: Sticky Bar នៅតែបង្ហាញជាប់ខណៈ Scroll**
        - **Given** បញ្ជីមុខម្ហូបនៅ Pane ណាមួយវែងជាងអេក្រង់
        - **When** ចុងភៅ Scroll ចុះក្រោម ឬឡើងលើ
        - **Then** ប្រអប់ "Total Cost" នៅតែបង្ហាញជាប់ទីតាំងដដែល (Fixed/Sticky) មិនរំកិលតាម Scroll

        **Scenario 3: Animation/Highlight ពេលលេខផ្លាស់ប្តូរ**
        - **Given** Total Cost កំពុងបង្ហាញលេខមួយ
        - **When** លេខនោះផ្លាស់ប្តូរដោយសារមានការបន្ថែម/ដកមុខម្ហូប
        - **Then** ប្រព័ន្ធបង្ហាញ Visual Feedback តូចមួយ (ឧ. ពណ៌លោត ឬ Animation ខ្លីៗ) ដើម្បីទាក់ទាញការចាប់អារម្មណ៍ទៅលេខថ្មី

    *   **Technical Notes:**
        - Total Cost ត្រូវគណនានៅ Frontend State ជា Real-time ពេលកំពុងកែប្រែ (មិនរង់ចាំ API Round-trip រាល់ពេលបន្ថែម/ដក) រួចទើប Sync ទៅ Backend នៅពេល Save ជាចុងក្រោយ
        - CSS `position: sticky` ឬ `fixed` ត្រូវប្រើសម្រាប់ Total Cost Bar ព្រមទាំងគិតគូរ Z-index មិនឱ្យត្រូវបាំងដោយ Element ផ្សេង
        - Animation ត្រូវប្រើ CSS Transition ស្រាលៗ (ឧ. Fade/Color pulse) ជៀសវាង Distracting UI

---