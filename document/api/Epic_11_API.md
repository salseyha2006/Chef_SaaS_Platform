# Chef SaaS Platform — API Documentation

## Epic 11: Event Management, Cost Calculation & Dashboard

Base URLs: `/api/v1/events`, `/api/v1/vendor-presets`, `/api/v1/dashboard`

---

### 1. Create Event
**US-50**

`POST /api/v1/events`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "Sok Family Wedding",
  "eventDate": "2026-11-15T00:00:00.000Z",
  "tableCount": 20
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": { "id": "uuid", "name": "Sok Family Wedding", "eventDate": "2026-11-15T00:00:00.000Z", "tableCount": 20 }
}
```

---

### 2. List Events
`GET /api/v1/events?upcoming=true`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": [
    { "id": "uuid", "name": "Sok Family Wedding", "eventDate": "2026-11-15T00:00:00.000Z", "tableCount": 20 }
  ]
}
```

---

### 3. View Event Detail
`GET /api/v1/events/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Event detail fetched successfully",
  "data": {
    "id": "uuid",
    "name": "Sok Family Wedding",
    "eventDate": "2026-11-15T00:00:00.000Z",
    "tableCount": 20,
    "dishes": [{ "dish": { "id": "uuid", "name": "Lok Lak" } }],
    "menuSets": [{ "menuSet": { "id": "uuid", "name": "Wedding Set A" } }]
  }
}
```

---

### 4. Update Event
`PATCH /api/v1/events/:id`
**Auth:** Bearer Token

**Request Body** *(all fields optional)*
```json
{ "tableCount": 25 }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": { "id": "uuid", "tableCount": 25 }
}
```

---

### 5. Clone / Duplicate Event
**US-51**

`POST /api/v1/events/:id/clone`
**Auth:** Bearer Token

**Request Body** *(optional overrides)*
```json
{ "name": "Sok Family Wedding (Backup Plan)", "eventDate": "2026-11-20T00:00:00.000Z" }
```

**Response `201`**
```json
{
  "success": true,
  "message": "Event cloned successfully",
  "data": { "id": "uuid", "name": "Sok Family Wedding (Backup Plan)" }
}
```

---

### 6. Add Dishes / Menu Sets to Event
**US-52**

`POST /api/v1/events/:id/items`
**Auth:** Bearer Token

**Request Body**
```json
{
  "dishIds": ["uuid1", "uuid2"],
  "menuSetIds": ["uuid3"]
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Items added to event successfully",
  "data": {
    "id": "uuid",
    "dishes": [{ "dish": { "id": "uuid1", "name": "Lok Lak" } }],
    "menuSets": [{ "menuSet": { "id": "uuid3", "name": "Wedding Set A" } }]
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 400 | One or more dishes are invalid / One or more menu sets are invalid |

---

### 7. Remove Dish / Menu Set from Event
**US-52**

`DELETE /api/v1/events/:id/dishes/:dishId`
`DELETE /api/v1/events/:id/menu-sets/:menuSetId`
**Auth:** Bearer Token

**Response `200`**
```json
{ "success": true, "message": "Dish removed from event", "data": null }
```

---

### 8. View Event Cost Calculation (Auto-Shopping List)
**US-53**

`GET /api/v1/events/:id/cost-calculation`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Event cost calculation fetched successfully",
  "data": {
    "eventId": "uuid",
    "eventName": "Sok Family Wedding",
    "tableCount": 20,
    "items": [
      {
        "ingredientId": "uuid",
        "ingredientName": "Beef Shank",
        "unit": { "id": "uuid", "name": "Kilogram", "abbreviation": "kg" },
        "unitPrice": 12.0,
        "quantityPerTable": 0.3,
        "totalQuantity": 6,
        "totalPrice": 72.0
      }
    ],
    "grandTotal": 850.0
  }
}
```

---

### 9. Create Vendor Preset
**US-55**

`POST /api/v1/vendor-presets`
**Auth:** Bearer Token

**Request Body**
```json
{
  "name": "ម៉ូយសាច់",
  "ingredientIds": ["uuid1", "uuid2"]
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Vendor preset created successfully",
  "data": { "id": "uuid", "name": "ម៉ូយសាច់" }
}
```

**Errors**
| Status | Message |
|---|---|
| 409 | A vendor preset with this name already exists |

---

### 10. List Vendor Presets
`GET /api/v1/vendor-presets`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Vendor presets fetched successfully",
  "data": [
    { "id": "uuid", "name": "ម៉ូយសាច់", "ingredients": [{ "id": "uuid", "name": "Beef Shank" }] }
  ]
}
```

---

### 11. Update / Delete Vendor Preset
**US-55**

`PATCH /api/v1/vendor-presets/:id`
`DELETE /api/v1/vendor-presets/:id`
**Auth:** Bearer Token

**Request Body (PATCH, optional fields)**
```json
{ "ingredientIds": ["uuid1", "uuid2", "uuid3"] }
```

**Response `200`**
```json
{ "success": true, "message": "Vendor preset updated successfully", "data": null }
```

---

### 12. View & Filter Shopping List by Vendor
**US-56**

`GET /api/v1/events/:eventId/shopping-list/vendor/:vendorPresetId`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Shopping list filtered by vendor preset",
  "data": {
    "eventId": "uuid",
    "vendorPresetName": "ម៉ូយសាច់",
    "items": [
      { "ingredientId": "uuid", "ingredientName": "Beef Shank", "totalQuantity": 6, "totalPrice": 72.0 }
    ]
  }
}
```

---

### 13. Generate PDF Purchasing Report
**US-57, US-58**

`POST /api/v1/events/:eventId/reports/pdf`
**Auth:** Bearer Token

**Request Body** *(optional — Quick Edit override)*
```json
{
  "title": "Purchasing List — Beef Vendor",
  "items": [
    { "ingredientName": "Beef Shank", "totalQuantity": 6, "unit": { "abbreviation": "kg" } }
  ]
}
```
> If `items` is omitted, the backend recomputes the full shopping list automatically. If provided, it is used as-is (Quick Edit, US-57) without altering any saved Vendor Preset.

**Response `200`**
Binary PDF stream (`Content-Type: application/pdf`). **Shows ingredient name + quantity only — purchase price is never included** (business secret, US-58).

---

### 14. Export Cost Report to Excel
**US-59**

`GET /api/v1/events/:eventId/reports/excel`
**Auth:** Bearer Token

**Response `200`**
Binary XLSX stream (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) with two sheets:
- **Dish Detail** — dish, ingredient, quantity, unit price, subtotal (full detail for accounting)
- **Shopping List Summary** — aggregated ingredient, total quantity, unit price, total price, grand total

---

### 15. View Dashboard
**US-54**

`GET /api/v1/dashboard`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Dashboard fetched successfully",
  "data": {
    "upcomingEvents": [
      { "id": "uuid", "name": "Sok Family Wedding", "eventDate": "2026-11-15T00:00:00.000Z" }
    ],
    "dishCount": 24,
    "menuSetCount": 5,
    "monthlySpending": 9.99,
    "subscription": { "status": "ACTIVE", "planName": "Basic Monthly", "endDate": "2026-10-27T00:00:00.000Z" }
  }
}
```

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | `/events` | Bearer | — |
| 2 | POST | `/events` | Bearer | US-50 |
| 3 | GET | `/events/:id` | Bearer | — |
| 4 | PATCH | `/events/:id` | Bearer | US-50 |
| 5 | POST | `/events/:id/clone` | Bearer | US-51 |
| 6 | POST | `/events/:id/items` | Bearer | US-52 |
| 7 | DELETE | `/events/:id/dishes/:dishId` | Bearer | US-52 |
| 8 | DELETE | `/events/:id/menu-sets/:menuSetId` | Bearer | US-52 |
| 9 | GET | `/events/:id/cost-calculation` | Bearer | US-53 |
| 10 | POST | `/vendor-presets` | Bearer | US-55 |
| 11 | GET | `/vendor-presets` | Bearer | US-55 |
| 12 | PATCH / DELETE | `/vendor-presets/:id` | Bearer | US-55 |
| 13 | GET | `/events/:eventId/shopping-list/vendor/:vendorPresetId` | Bearer | US-56 |
| 14 | POST | `/events/:eventId/reports/pdf` | Bearer | US-57, US-58 |
| 15 | GET | `/events/:eventId/reports/excel` | Bearer | US-59 |
| 16 | GET | `/dashboard` | Bearer | US-54 |