## Epic 12: Procurement & Purchase Tracking

*   **US-60: Mark Items as Purchased (Check-off)**
    *   **Priority:** Must
    *   **Story:** ក្នុងនាមជា **ចុងភៅ**, ខ្ញុំចង់ **អាចចុចគ្រីស (Tick/Check) លើមុខគ្រឿងផ្សំណាមួយនៅក្នុងបញ្ជីទិញទំនិញថាបាន "ទិញរួចរាល់"**, ដើម្បី **តាមដានវឌ្ឍនភាពនៃការទិញជាក់ស្តែង (ដឹងច្បាស់ថាសល់អ្វីមិនទាន់ទិញ) និងការពារការទិញជាន់គ្នា**។

    *   **Acceptance Criteria:**

        **Scenario 1: គ្រីសសម្គាល់ថាទិញរួច**
        - **Given** User កំពុងមើលបញ្ជីទិញទំនិញរបស់ Event ណាមួយ
        - **When** User ចុច Checkbox នៅជាប់គ្រឿងផ្សំណាមួយ
        - **Then** ជួរនោះប្តូររូបរាងភ្លាមៗ (អក្សរព្រាល/ឆូតកណ្តាល) ហើយរុញទៅផ្នែកខាងក្រោមគេនៃបញ្ជី, ព្រមទាំង Progress Bar ធ្វើបច្ចុប្បន្នភាព

        **Scenario 2: ដកគ្រីសចេញវិញ (Undo)**
        - **Given** គ្រឿងផ្សំណាមួយត្រូវបានគ្រីសថាទិញរួច
        - **When** User ចុច Checkbox នោះម្តងទៀតដើម្បីដកគ្រីស
        - **Then** ជួរនោះត្រឡប់ទៅរូបរាងធម្មតា ហើយត្រឡប់ទៅទីតាំងដើមក្នុងបញ្ជី (មិនទាន់ទិញ), Progress Bar ធ្វើបច្ចុប្បន្នភាពថយក្រោយ

        **Scenario 3: Progress Bar បង្ហាញភាគរយត្រឹមត្រូវ**
        - **Given** Shopping List មានចំនួនធាតុសរុប N ធាតុ
        - **When** User គ្រីសរួច M ធាតុ
        - **Then** Progress Bar បង្ហាញ M/N ជាភាគរយ (ឧ. "60% Completed - 6/10 items")

        **Scenario 4: គ្រីសរួចទាំងអស់ (100% Complete)**
        - **Given** User គ្រីសគ្រឿងផ្សំចុងក្រោយក្នុងបញ្ជី
        - **When** Progress Bar ឡើងដល់ 100%
        - **Then** ប្រព័ន្ធបង្ហាញសារជូនដំណឹងជោគជ័យ (ឧ. "ទិញគ្រប់គ្រាន់ហើយ!") ឬ Visual Feedback ដទៃទៀត

        **Scenario 5: ស្ថានភាព Check-off រក្សាទុកឆ្លងកាត់ Session/Device**
        - **Given** User គ្រីសគ្រឿងផ្សំមួយចំនួន ហើយបិទ App/Browser ចោល
        - **When** User បើក App/Browser ម្តងទៀត ហើយចូលមើលបញ្ជីទិញទំនិញរបស់ Event ដដែល
        - **Then** ស្ថានភាព Check-off ដែលធ្លាប់កត់ត្រា នៅតែបង្ហាញត្រឹមត្រូវ (Persisted, មិនបាត់)

    *   **Technical Notes:**
        - Field `is_purchased` (Boolean) និង `purchased_at` (Timestamp) ត្រូវបន្ថែមក្នុង Table ដែលតំណាងធាតុ Shopping List (ភ្ជាប់ជាមួយ `event_id` និង `ingredient_id`)
        - State Check-off ត្រូវរក្សាទុកនៅ Backend (Database) មិនមែន Local Storage ប៉ុណ្ណោះ ដើម្បីអនុញ្ញាតឱ្យ Sync ឆ្លងកាត់ឧបករណ៍ (ឧ. ចុងភៅ Check ពី Mobile ខណៈមើលពី Tablet)
        - Toggle Check-off ត្រូវជា API Endpoint រហ័ស (Lightweight, PATCH Request តែ Field `is_purchased`) ជៀសវាង Latency ខ្ពស់ពេលចុចញឹកញាប់
        - Progress Bar Percentage ត្រូវគណនានៅ Frontend ដោយផ្អែកលើទិន្នន័យដែលទាញយករួច (មិនចាំបាច់ហៅ API ដាច់ដោយឡែកសម្រាប់ %)

---