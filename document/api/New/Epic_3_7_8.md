# Chef SaaS Platform — API Documentation

## Epic 3, 7, 8: Onboarding, Unit/Category/Ingredient (Copy-on-Write)

---

### Onboarding

`PATCH /api/v1/onboarding/complete`
**Auth:** Bearer Token — US-10

**Response `200`**
```json
{ "success": true, "message": "Onboarding marked as completed", "data": { "hasCompletedOnboarding": true } }
```

---

### Units

`GET /api/v1/units/presets` — Bearer — US-26, US-31 style
Global Catalog, flagged `isImported`
```json
{ "data": [{ "id": "uuid", "name": "Kilogram", "abbreviation": "kg", "unitType": "weight", "conversionRate": 1000, "isImported": false }] }
```

`GET /api/v1/units` — Bearer
This chef's own units (imported + custom)
```json
{ "data": [{ "id": "uuid", "chefId": "uuid", "name": "Kilogram", "abbreviation": "kg", "unitType": "weight", "conversionRate": 1000, "source": "PRESET", "sourcePresetId": "uuid", "isActive": true }] }
```

`POST /api/v1/units` — Bearer — US-26, US-27 (custom)
Body: `{ "name": "Bunch", "abbreviation": "bunch", "unitType": "count", "conversionRate": 1 }`
Errors: 409 `UNIT_EXISTS`

`POST /api/v1/units/presets/:presetId/import` — Bearer — US-26, US-29 (copy from catalog)
Errors: 404 `UNIT_NOT_FOUND`, 409 `UNIT_ALREADY_IMPORTED`

`PATCH /api/v1/units/:id` — Bearer — US-11 Scenario 3 (edit own copy, never the preset)
Body (all optional): `{ "name", "abbreviation", "unitType", "conversionRate" }`
Errors: 404 `UNIT_NOT_FOUND`, 409 `UNIT_EXISTS`

`PATCH /api/v1/units/:id/archive` — Bearer — US-30 (soft delete, own copy only)

---

### Categories
Same shape as Units.

`GET /api/v1/categories/presets` · `GET /api/v1/categories` ·
`POST /api/v1/categories` (409 `CATEGORY_EXISTS`) ·
`POST /api/v1/categories/presets/:presetId/import` (404 `CATEGORY_NOT_FOUND`, 409 `CATEGORY_ALREADY_IMPORTED`) ·
`PATCH /api/v1/categories/:id` (404 `CATEGORY_NOT_FOUND`, 409 `CATEGORY_EXISTS`) ·
`PATCH /api/v1/categories/:id/archive`

---

### Ingredients

`GET /api/v1/ingredients/presets` — Bearer — US-31, US-32
Grouped by category, flagged `isImported`
```json
{ "data": [{ "category": "Meat", "items": [{ "id": "uuid", "name": "Pork Belly", "defaultUnit": { "id": "uuid", "name": "Kilogram" }, "isImported": true }] }] }
```

`POST /api/v1/ingredients/import` — Bearer — US-31, US-33
Body:
```json
{ "items": [{ "ingredientId": "<presetId>", "purchasePrice": 8.5, "unitId": "<chefUnitId>" }] }
```
> `unitId` ត្រូវជា `ChefUnit.id` (ផ្ទាល់ខ្លួន Chef) មិនមែន Global `Unit.id` ទេ។ Category ចម្លងស្វ័យប្រវត្តិ។ Preset ដែល Import រួចហើយ ត្រូវរំលង (Skip) ស្ងាត់ៗ មិនមែន Error ទេ។

`POST /api/v1/ingredients` — Bearer — 🆕 US-11 Scenario 2 (brand-new custom ingredient)
Body: `{ "name": "ត្រីអន្ទង់ក្រៀម", "purchasePrice": 15, "unitId": "<chefUnitId>", "categoryId": "<chefCategoryId>?" }`
Errors: 409 `INGREDIENT_EXISTS`, 400 `UNIT_NOT_IN_LIST` / `CATEGORY_NOT_IN_LIST`

`GET /api/v1/ingredients/my-stock?categoryId=` — Bearer — US-34
```json
{ "data": [{ "id": "uuid", "name": "Pork Belly", "category": "Meat", "purchasePrice": 8.5, "unit": { "id": "uuid", "name": "Kilogram", "abbreviation": "kg" }, "source": "PRESET" }] }
```
> ⚠️ `id` ទីនេះគឺ **ChefIngredient id** — ប្រើវាសម្រាប់ PATCH/DELETE ខាងក្រោម (មិនមែន `ingredientId` ទៀតទេ)

`PATCH /api/v1/ingredients/my-stock/:id` — Bearer — US-33, US-11 Scenario 3 (full edit — Copy-on-Write)
Body (all optional): `{ "name", "purchasePrice", "unitId", "categoryId" }`
Errors: 404 `STOCK_INGREDIENT_NOT_FOUND`, 409 `INGREDIENT_EXISTS`

`PATCH /api/v1/ingredients/my-stock/:id/archive` — Bearer — US-35

`DELETE /api/v1/ingredients/my-stock/:id` — Bearer — US-36
Errors: 409 `INGREDIENT_IN_USE` (params: `count`)

---

## Epic 11: Event, Vendor Preset & Reports (field rename)

`GET /api/v1/events/:id/cost-calculation` — Bearer — US-53

⚠️ **ផ្លាស់ប្តូរ Field៖** `items[].ingredientId` → **`items[].chefIngredientId`**

```json
{
  "data": {
    "eventId": "uuid", "eventName": "Sok Family Wedding", "tableCount": 20,
    "items": [{
      "chefIngredientId": "uuid",
      "ingredientName": "Beef Shank",
      "unit": { "id": "uuid", "name": "Kilogram", "abbreviation": "kg" },
      "unitPrice": 12.0, "quantityPerTable": 0.3, "totalQuantity": 6, "totalPrice": 72.0
    }],
    "grandTotal": 850.0
  }
}
```

`POST /api/v1/vendor-presets` — Bearer — US-55
⚠️ **ផ្លាស់ប្តូរ Field៖** Body ប្តូរពី `ingredientIds` → **`chefIngredientIds`**
```json
{ "name": "ម៉ូយសាច់", "chefIngredientIds": ["<chefIngredientId>"] }
```
Errors: 409 `VENDOR_PRESET_EXISTS`, 400 `STOCK_INGREDIENT_NOT_FOUND`

`GET /api/v1/vendor-presets` — Bearer
`PATCH /api/v1/vendor-presets/:id` — Bearer (Body ដូចគ្នា `chefIngredientIds`)
`DELETE /api/v1/vendor-presets/:id` — Bearer

`GET /api/v1/events/:eventId/shopping-list/vendor/:vendorPresetId` — Bearer — US-56
Response `items[]` ប្រើ `chefIngredientId` ដូចគ្នា

`POST /api/v1/events/:eventId/reports/pdf` — Bearer — US-57, US-58 (មិនប្តូរ — Name+Quantity ជា Text ធម្មតា)
`GET /api/v1/events/:eventId/reports/excel` — Bearer — US-59 (Bug Fix៖ ដំណើរការជោគជ័យឥឡូវ)

---

## Epic 12: Procurement (field + param rename)

`GET /api/v1/events/:eventId/shopping-list` — Bearer — US-60
Response `items[]` ប្រើ `chefIngredientId` + `isPurchased`

⚠️ **ផ្លាស់ប្តូរ Route Param៖** `:ingredientId` → **`:chefIngredientId`**

`PATCH /api/v1/events/:eventId/shopping-list/:chefIngredientId/toggle-purchased` — Bearer — US-60
Body: `{ "isPurchased": true }`
Errors: 404 `EVENT_NOT_FOUND` / `INGREDIENT_NOT_FOUND` (សូមចំណាំ៖ ត្រូវសាកល្បងផងដែរថា Chef ម្នាក់មិនអាច Toggle Ingredient របស់ Chef ដទៃបាន)

---

## Error Codes ថ្មីទាំងអស់ (Copy-on-Write Refactor)

| Code | Status | Params |
|---|---|---|
| `UNIT_ALREADY_IMPORTED` | 409 | — |
| `CATEGORY_ALREADY_IMPORTED` | 409 | — |
| `INGREDIENT_EXISTS` | 409 | — |