# 7_PENDING_BACKEND_9E.md — US-44.1 Fixed Dish (`calculationType`) — រង់ចាំ Backend

ស្ថានភាព: **Frontend មិនទាន់ធ្វើ** (ពន្យារពេល) ដោយសារ Backend មិនទាន់រួច។ ឯកសារនេះជា Spec សម្រាប់សរសេរ Backend ។

## 1. `schema.prisma` diff

```diff
 enum PresetSource {
   PRESET
   CUSTOM
 }
+
+// US-44.1: PER_TABLE = គុណនឹងចំនួនតុ (លំនាំដើម) · FIXED = គិតតែ ១ ដងក្នុងមួយកម្មវិធី
+enum DishCalculationType {
+  PER_TABLE
+  FIXED
+}
```

```diff
 model Dish {
   ...
   tags        String[] @default([])
+  calculationType DishCalculationType @default(PER_TABLE)
```

`@default(PER_TABLE)` ធ្វើឱ្យ Record ចាស់ Migrate ជា `PER_TABLE` ស្វ័យប្រវត្តិ។

## 2. Migration

```bash
cd backend
npx prisma migrate dev --name add_dish_calculation_type
npx prisma generate
```

```sql
CREATE TYPE "DishCalculationType" AS ENUM ('PER_TABLE', 'FIXED');
ALTER TABLE "dishes" ADD COLUMN "calculationType" "DishCalculationType" NOT NULL DEFAULT 'PER_TABLE';
```

⚠️ បើ Project ធ្លាប់ប្រើ `prisma db push` ដោយគ្មាន Migration History → `migrate dev` អាចស្នើ Reset DB (បាត់ទិន្នន័យ) — កុំយល់ព្រមលើ Production។

## 3. Controller ដែលត្រូវកែ (សូមផ្ញើ Controller/Service/Validator មកមុនសរសេរ Code ពេញ)

| ចំណុច | ការកែ |
|---|---|
| Create/Update Dish (+ Zod) | ទទួល និងរក្សា `calculationType` (`'PER_TABLE' \| 'FIXED'`) |
| Dish list/detail | ត្រឡប់ `calculationType` (+ ស្នើ `usage:{menuSetCount,eventCount}` សម្រាប់ Warning US-44.1 S4) |
| Duplicate (US-40) | ចម្លង `calculationType` |
| `GET /events/:id/cost-calculation` | គុណ `tableCount` តែម្ហូប `PER_TABLE`; `FIXED` ×1 |
| `GET /events/:id/shopping-list` និង `vendor/:id` | ដូចខាងលើ (`quantityPerTable`, `totalQuantity`, `totalPrice`) |
| `GET /events/:id/reports/excel` | ដូចខាងលើ |
| `GET /dashboard` `monthlySpending` | ពិនិត្យថាគុណ `tableCount` ត្រូវ |
| `MenuSet.totalCost` | **សំណួរបើក**: គួរបូកម្ហូបថេរ ១ ដងទេ? (ស្នើ: បូក ១ ដង) |
| Recalc ពេលកែ `purchasePrice` | មិនអើពើ `calculationType` |

## 4. Frontend ដែលនឹងធ្វើពេល Backend រួច
Field ក្នុង Form Dish (Per Table / Fixed) · Badge "Fixed" · Filter ប្រភេទ (US-44.1 S5) · Warning Confirm ពេលប្តូរប្រភេទ (S4) · `toDish` ដែលអាន `calculationType` រួចរាល់ស្រាប់ (Normalize អក្សរតូច)។
