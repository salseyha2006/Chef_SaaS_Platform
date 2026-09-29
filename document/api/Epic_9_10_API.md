# Chef SaaS Platform — API Documentation

## Epic 9-10: Dish/Recipe Management & Menu Set Management

Base URLs: `/api/v1/dishes`, `/api/v1/menu-sets`

---

### 1. List Dishes
`GET /api/v1/dishes?tag=<string>&archived=<true|false>`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Dishes fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Lok Lak",
      "description": "Cambodian stir-fried beef",
      "imageUrl": "https://res.cloudinary.com/.../loklak.jpg",
      "tags": ["Main"],
      "totalCost": 4.25,
      "isArchived": false
    }
  ]
}
```

---

### 2. Create Dish (Recipe)
**US-37**

`POST /api/v1/dishes`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "Lok Lak",
  "description": "Cambodian stir-fried beef",
  "imageUrl": "https://res.cloudinary.com/.../loklak.jpg",
  "tags": ["Main"],
  "ingredients": [
    { "chefIngredientId": "uuid", "quantityUsed": 0.3 },
    { "chefIngredientId": "uuid", "quantityUsed": 0.02 }
  ]
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Dish created successfully",
  "data": {
    "id": "uuid",
    "name": "Lok Lak",
    "totalCost": 4.25,
    "isArchived": false
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 400 | One or more ingredients are not in your stock |

---

### 3. View Dish Details & Cost Breakdown
**US-38**

`GET /api/v1/dishes/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Dish detail fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Lok Lak",
    "description": "Cambodian stir-fried beef",
    "imageUrl": "https://...",
    "tags": ["Main"],
    "totalCost": 4.25,
    "isArchived": false,
    "costBreakdown": [
      {
        "ingredientName": "Beef Shank",
        "quantityUsed": 0.3,
        "unit": "kg",
        "unitPrice": 12.0,
        "subtotal": 3.6,
        "percentageOfTotal": 84.7
      }
    ]
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Dish not found |

---

### 4. Edit Dish / Recipe
**US-39, US-42**

`PATCH /api/v1/dishes/:id`
**Auth:** Bearer Token

**Request Body** *(all fields optional)*
```json
{
  "name": "Lok Lak (Updated)",
  "ingredients": [
    { "chefIngredientId": "uuid", "quantityUsed": 0.35 }
  ]
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Dish updated successfully",
  "data": { "id": "uuid", "name": "Lok Lak (Updated)", "totalCost": 4.55 }
}
```

---

### 5. Duplicate Dish (Clone)
**US-40**

`POST /api/v1/dishes/:id/duplicate`
**Auth:** Bearer Token

**Response `201`**
```json
{
  "success": true,
  "message": "Dish duplicated successfully",
  "data": { "id": "uuid", "name": "Lok Lak (Copy)", "totalCost": 4.25 }
}
```

---

### 6. Archive Dish
**US-41**

`PATCH /api/v1/dishes/:id/archive`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Dish archived successfully",
  "data": { "id": "uuid", "isArchived": true }
}
```

---

### 7. Delete Dish
**US-41**

`DELETE /api/v1/dishes/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Dish deleted successfully",
  "data": null
}
```

**Errors**
| Status | Message |
|---|---|
| 409 | Cannot delete: this dish is used in N menu set(s). Archive it instead. |

---

### 8. List Menu Sets
`GET /api/v1/menu-sets?archived=<true|false>`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Menu sets fetched successfully",
  "data": [
    { "id": "uuid", "name": "Wedding Set A", "totalCost": 25.5, "isArchived": false }
  ]
}
```

---

### 9. Create Menu Set
**US-45**

`POST /api/v1/menu-sets`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "Wedding Set A",
  "dishIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Menu set created successfully",
  "data": { "id": "uuid", "name": "Wedding Set A", "totalCost": 25.5 }
}
```

**Errors**
| Status | Message |
|---|---|
| 400 | One or more dishes do not belong to you or do not exist |

---

### 10. View Menu Set Detail
**US-46, US-49**

`GET /api/v1/menu-sets/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Menu set detail fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Wedding Set A",
    "totalCost": 25.5,
    "isArchived": false,
    "dishes": [
      { "dishId": "uuid", "name": "Lok Lak", "imageUrl": "https://...", "cost": 4.25, "sortOrder": 0 }
    ]
  }
}
```

---

### 11. Customize Menu Set
**US-47, US-46**

`PATCH /api/v1/menu-sets/:id`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "Wedding Set A (Deluxe)",
  "dishIds": ["uuid1", "uuid2", "uuid4"]
}
```
> Sending `dishIds` replaces the full member list, preserving the order given (supports drag & drop reordering from the Frontend).

**Response `200`**
```json
{
  "success": true,
  "message": "Menu set updated successfully",
  "data": { "id": "uuid", "name": "Wedding Set A (Deluxe)", "totalCost": 28.0 }
}
```

---

### 12. Archive Menu Set
`PATCH /api/v1/menu-sets/:id/archive`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Menu set archived successfully",
  "data": { "id": "uuid", "isArchived": true }
}
```

---

### 13. Delete Menu Set
`DELETE /api/v1/menu-sets/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Menu set deleted successfully",
  "data": null
}
```

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | `/dishes` | Bearer | — (US-44 view toggle is Frontend-only) |
| 2 | POST | `/dishes` | Bearer | US-37 |
| 3 | GET | `/dishes/:id` | Bearer | US-38 |
| 4 | PATCH | `/dishes/:id` | Bearer | US-39, US-42 |
| 5 | POST | `/dishes/:id/duplicate` | Bearer | US-40 |
| 6 | PATCH | `/dishes/:id/archive` | Bearer | US-41 |
| 7 | DELETE | `/dishes/:id` | Bearer | US-41 |
| 8 | GET | `/menu-sets` | Bearer | US-45 |
| 9 | POST | `/menu-sets` | Bearer | US-45 |
| 10 | GET | `/menu-sets/:id` | Bearer | US-46, US-49 |
| 11 | PATCH | `/menu-sets/:id` | Bearer | US-47, US-46 |
| 12 | PATCH | `/menu-sets/:id/archive` | Bearer | — |
| 13 | DELETE | `/menu-sets/:id` | Bearer | — |