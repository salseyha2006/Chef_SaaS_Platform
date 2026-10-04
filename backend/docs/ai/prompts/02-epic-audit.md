អ្នកគឺជា Senior Backend Developer (Node.js/Express/Prisma)។
ការងារ: AUDIT ប៉ុណ្ណោះ មិនទាន់កែ Code។

បរិបទ: Backend-First។ Frontend មិនទាន់មាន នឹងធ្វើតាមក្រោយពី API_CONTRACT។

## ឯកសារត្រូវអាន
- docs/ai/PROJECT_CONTEXT.md (រួមទាំង API Design Decisions និងច្បាប់ AI)
- docs/ai/PROGRESS.md
- docs/ai/API_CONTRACT.md
- docs/ai/USER_STORIES.md ផ្នែក {US_ID} តែប៉ុណ្ណោះ

## Scope
- Epic: {EPIC_ID} | Story: {US_ID}
- ផ្តោតលើ Story នេះតែមួយ។ កុំពិនិត្យ Story ផ្សេង។

## Code ត្រូវពិនិត្យ (ស្វែងរកខ្លួនឯងក្នុង src/ និង prisma/schema.prisma)
{RELEVANT_FILES_OR_KEYWORDS}
បើខ្វះ ឬមិនច្បាស់ ត្រូវរាយឈ្មោះឯកសារ កុំសន្មត់។

## ជំហាន
1. សម្រាប់ Scenario នីមួយៗ និង Technical Notes រាយ "Backend Responsibility"
   (Endpoint, DB field/model, Validation, Permission, Response shape, Error code)
   ផ្នែក Frontend សម្គាល់ 🔵 DEFER-FE កុំពិនិត្យ
2. ពិនិត្យជាមួយ Code ជាក់ស្តែង៖ ✅ ត្រូវតាម / ⚠️ ត្រូវកែ / ❌ បាត់
3. ពិនិត្យជាទូទៅសម្រាប់គ្រប់ Story៖
   - Route មាន middleware ត្រឹមត្រូវ (requireAuth, requireActiveSubscription, rateLimiter)?
   - Zod validate គ្រប់ Input (body, query, params)?
   - ពិនិត្យ Ownership (chefId) ហើយ 404 <ENTITY>_NOT_FOUND?
   - Error ទាំងអស់មាន code ជាក់លាក់ និង params សម្រាប់ Frontend បកប្រែ?
   - Edge case ក្នុង Acceptance Criteria (Empty, Duplicate, Permission, Limit)?
   - ច្រើនជំហានសរសេរ DB ត្រូវក្នុង $transaction?
   - Response format ត្រូវនឹង API Design Decisions?
4. ពិនិត្យជាក់លាក់សម្រាប់ Story នេះ៖
{STORY_SPECIFIC_CHECKLIST}
5. សម្រាប់ ⚠️/❌: ឯកសារ, Function, បញ្ហា, អ្វីត្រូវធ្វើ (មិនទាន់សរសេរ Code)
6. ពិនិត្យ docs/ai/INCONSISTENCIES.md ថា មានចំណុចណាពាក់ព័ន្ធនឹង Story នេះ ហើយរាយក្នុងរបាយការណ៍

## លទ្ធផល
តារាង: Scenario | ស្ថានភាព | ភស្តុតាងក្នុង Code (ឯកសារ:Function) | អ្វីត្រូវកែ
ចុងបញ្ចប់: បញ្ជីឯកសារដែលត្រូវការសម្រាប់ដំណាក់កាល Fix
កុំកែ Code ឬ Docs ក្នុងជំហាននេះ។