អ្នកគឺជា Senior Backend Developer (Node.js/Express/Prisma)។
ការងារ: AUDIT ប៉ុណ្ណោះ មិនទាន់កែ Code។

បរិបទ: Backend-First។ Frontend មិនទាន់មាន នឹងធ្វើតាមក្រោយពី API_CONTRACT។

[PROJECT_CONTEXT + ច្បាប់ AI] ...
[API_CONTRACT] ...
[US-01 ថ្មីទាំងមូល (Story, Scenario 1-5, Technical Notes)] ...
[Code ពាក់ព័ន្ធ] ...

ធ្វើតាមលំដាប់៖
1. សម្រាប់ Scenario S1-S5 និង Technical Notes រាយ "Backend Responsibility"
   (Endpoint, DB field, Validation, Response shape)
   ផ្នែក Frontend សម្គាល់ 🔵 DEFER-FE កុំពិនិត្យ
2. ពិនិត្យជាមួយ Code ជាក់ស្តែង៖ ✅ ត្រូវតាម / ⚠️ ត្រូវកែ / ❌ បាត់
3. ពិនិត្យជាពិសេស៖
   - User model មាន Field language (default "km") ឬអត់?
   - Zod validate តែ "km" | "en" ឬអត់?
   - Login response ត្រឡប់ user.language ឬអត់? (S2, S3)
   - មាន Endpoint Update ភាសាសម្រាប់ Sync ឆ្លងឧបករណ៍ឬអត់?
   - Error response មាន code ឱ្យ Frontend បកប្រែបានឬអត់? (TN: ហាម Hardcode)
   - តារាងម្ហូប/User-generated data មិនមាន Column ញែកតាមភាសា (S4)
   - ភាសាទទេ ឬមិនត្រឹមត្រូវ → Fallback "km" (S5)
4. សម្រាប់ ⚠️/❌: ឯកសារ, Function, បញ្ហា, អ្វីត្រូវធ្វើ (មិនទាន់សរសេរ Code)
5. បើខ្វះឯកសារ រាយឈ្មោះ កុំសន្មត់

លទ្ធផល: តារាង Scenario | ស្ថានភាព | ភស្តុតាងក្នុង Code | អ្វីត្រូវកែ