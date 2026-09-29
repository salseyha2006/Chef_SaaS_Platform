# Chef SaaS Platform — API Documentation

## Epic 7-8: Unit/Category Configuration & Ingredient Management

Base URLs: `/api/v1/units`, `/api/v1/categories`, `/api/v1/ingredients`

---

### 1. Browse Units (with selected state)
**US-26**

`GET /api/v1/units`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Units fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Kilogram",
      "abbreviation": "kg",
      "unitType": "weight",
      "conversionRate": 1000,
      "isSelected": true
    }
  ]
}
```

---

### 2. Create Unit Inline
**US-26, US-27**

`POST /api/v1/units`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "Bunch",
  "abbreviation": "bunch",
  "unitType": "count",
  "conversionRate": 1
}
```
> `conversionRate` is mandatory (US-27).

**Response `201`**
```json
{
  "success": true,
  "message": "Unit created and added to your list",
  "data": {
    "id": "uuid",
    "name": "Bunch",
    "abbreviation": "bunch",
    "unitType": "count",
    "conversionRate": 1
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 409 | This unit already exists |
| 400 | Validation failed |

---

### 3. Select Existing Unit
**US-26, US-29**

`POST /api/v1/units/:unitId/select`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Unit added to your list",
  "data": { "id": "uuid", "chefId": "uuid", "unitId": "uuid", "isActive": true }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Unit not found |

---

### 4. Deselect (Hide) Unit
**US-30**

`PATCH /api/v1/units/:unitId/deselect`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Unit hidden from your list",
  "data": { "id": "uuid", "isActive": false }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | This unit is not in your list |

---

### 5. Browse Categories (with selected state)
**US-28**

`GET /api/v1/categories`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    { "id": "uuid", "name": "Meat", "isSelected": true }
  ]
}
```

---

### 6. Create Category Inline
**US-28**

`POST /api/v1/categories`
**Auth:** Bearer Token

**Request Body**
```json
{ "name": "Beverage" }
```

**Response `201`**
```json
{
  "success": true,
  "message": "Category created and added to your list",
  "data": { "id": "uuid", "name": "Beverage" }
}
```

**Errors**
| Status | Message |
|---|---|
| 409 | This category already exists |

---

### 7. Select Existing Category
**US-29**

`POST /api/v1/categories/:categoryId/select`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Category added to your list",
  "data": { "id": "uuid", "categoryId": "uuid", "isActive": true }
}
```

---

### 8. Deselect (Hide) Category
**US-30**

`PATCH /api/v1/categories/:categoryId/deselect`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Category hidden from your list",
  "data": { "id": "uuid", "isActive": false }
}
```

---

### 9. Browse Global Ingredient Presets (Tree View)
**US-31, US-32**

`GET /api/v1/ingredients/presets`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Ingredient presets fetched successfully",
  "data": [
    {
      "category": "Meat",
      "items": [
        {
          "id": "uuid",
          "name": "Pork Belly",
          "defaultUnit": { "id": "uuid", "name": "Kilogram" },
          "isImported": true
        }
      ]
    }
  ]
}
```

---

### 10. Import Ingredients (Custom Pricing & Unit)
**US-31, US-33**

`POST /api/v1/ingredients/import`
**Auth:** Bearer Token

**Request Body**
```json
{
  "items": [
    { "ingredientId": "uuid", "purchasePrice": 8.5, "unitId": "uuid" },
    { "ingredientId": "uuid", "purchasePrice": 2.0, "unitId": "uuid" }
  ]
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Ingredients imported to your stock successfully",
  "data": [
    { "id": "uuid", "chefId": "uuid", "ingredientId": "uuid", "purchasePrice": 8.5, "unitId": "uuid", "isActive": true }
  ]
}
```

**Errors**
| Status | Message |
|---|---|
| 400 | One or more ingredients do not exist |

---

### 11. View My Ingredient Inventory
**US-34**

`GET /api/v1/ingredients/my-stock?categoryId=<uuid>`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "My ingredient inventory fetched successfully",
  "data": [
    {
      "chefIngredientId": "uuid",
      "ingredientId": "uuid",
      "name": "Pork Belly",
      "category": "Meat",
      "purchasePrice": 8.5,
      "unit": { "id": "uuid", "name": "Kilogram", "abbreviation": "kg" }
    }
  ]
}
```

---

### 12. Update My Ingredient (Price/Unit)
**US-33**

`PATCH /api/v1/ingredients/my-stock/:ingredientId`
**Auth:** Bearer Token

**Request Body**
```json
{ "purchasePrice": 9.0, "unitId": "uuid" }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Ingredient stock updated successfully",
  "data": { "id": "uuid", "purchasePrice": 9.0, "unitId": "uuid" }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | This ingredient is not in your stock |

---

### 13. Archive My Ingredient (Soft Delete)
**US-35**

`PATCH /api/v1/ingredients/my-stock/:ingredientId/archive`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Ingredient archived from your stock",
  "data": { "id": "uuid", "isActive": false }
}
```

---

### 14. Delete My Ingredient (Hard Delete)
**US-36**

`DELETE /api/v1/ingredients/my-stock/:ingredientId`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Ingredient permanently deleted from your stock",
  "data": null
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | This ingredient is not in your stock |
| 409 | Cannot delete: this ingredient is used in N dish(es). Archive it instead. |

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | `/units` | Bearer | US-26 |
| 2 | POST | `/units` | Bearer | US-26, US-27 |
| 3 | POST | `/units/:unitId/select` | Bearer | US-26, US-29 |
| 4 | PATCH | `/units/:unitId/deselect` | Bearer | US-30 |
| 5 | GET | `/categories` | Bearer | US-28 |
| 6 | POST | `/categories` | Bearer | US-28 |
| 7 | POST | `/categories/:categoryId/select` | Bearer | US-29 |
| 8 | PATCH | `/categories/:categoryId/deselect` | Bearer | US-30 |
| 9 | GET | `/ingredients/presets` | Bearer | US-31, US-32 |
| 10 | POST | `/ingredients/import` | Bearer | US-31, US-33 |
| 11 | GET | `/ingredients/my-stock` | Bearer | US-34 |
| 12 | PATCH | `/ingredients/my-stock/:ingredientId` | Bearer | US-33 |
| 13 | PATCH | `/ingredients/my-stock/:ingredientId/archive` | Bearer | US-35 |
| 14 | DELETE | `/ingredients/my-stock/:ingredientId` | Bearer | US-36 |