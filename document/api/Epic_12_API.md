# Chef SaaS Platform — API Documentation

## Epic 12: Procurement & Purchase Tracking

Base URL: `/api/v1/events`

---

### 1. View Shopping List with Purchase Status
`GET /api/v1/events/:eventId/shopping-list`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Shopping list with purchase status fetched successfully",
  "data": {
    "eventId": "uuid",
    "eventName": "Sok Family Wedding",
    "items": [
      {
        "ingredientId": "uuid",
        "ingredientName": "Beef Shank",
        "unit": { "id": "uuid", "name": "Kilogram", "abbreviation": "kg" },
        "unitPrice": 12.0,
        "totalQuantity": 6,
        "totalPrice": 72.0,
        "isPurchased": true
      },
      {
        "ingredientId": "uuid",
        "ingredientName": "Garlic",
        "totalQuantity": 20,
        "totalPrice": 4.0,
        "isPurchased": false
      }
    ],
    "progress": 50.0,
    "purchasedCount": 1,
    "totalCount": 2
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Event not found |

---

### 2. Toggle Item Purchased Status
**US-60**

`PATCH /api/v1/events/:eventId/shopping-list/:ingredientId/toggle-purchased`
**Auth:** Bearer Token

**Request Body**
```json
{ "isPurchased": true }
```

**Response `200`**
```json
{
  "success": true,
  "message": "Item marked as purchased",
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "ingredientId": "uuid",
    "isPurchased": true,
    "purchasedAt": "2026-09-27T10:00:00.000Z"
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Event not found / Ingredient not found |

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | `/events/:eventId/shopping-list` | Bearer | US-60 (supports progress bar) |
| 2 | PATCH | `/events/:eventId/shopping-list/:ingredientId/toggle-purchased` | Bearer | US-60 |