# Chef SaaS Platform — API Documentation

## Epic 4-6: Subscription, Payment & Billing

Base URLs: `/api/v1/subscription`, `/api/v1/billing`

---

### 1. View Pricing & Plans
**US-13**

`GET /api/v1/subscription/plans`
**Auth:** Public

**Response `200`**
```json
{
  "success": true,
  "message": "Plans fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Basic Monthly",
      "price": 9.99,
      "billingCycle": "monthly",
      "durationDays": 30,
      "features": { "maxDishes": 100, "maxEvents": 20 },
      "isActive": true
    }
  ]
}
```

---

### 2. View Current Trial / Subscription Status
**US-15**

`GET /api/v1/subscription/me`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Subscription status fetched successfully",
  "data": {
    "id": "uuid",
    "chefId": "uuid",
    "planId": "uuid",
    "status": "TRIALING",
    "startDate": "2026-09-13T00:00:00.000Z",
    "endDate": "2026-09-27T00:00:00.000Z",
    "autoRenew": false,
    "daysRemaining": 3,
    "plan": {
      "name": "Free Trial",
      "price": 0
    }
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | No subscription found |

---

### 3. Upgrade / Start Paid Subscription
**US-14, US-18, US-19, US-21**

`POST /api/v1/subscription/upgrade`
**Auth:** Bearer Token

**Request Body**
```json
{
  "planId": "uuid",
  "paymentMethod": "ABA_PAYWAY"
}
```
> `paymentMethod` accepts: `ABA_PAYWAY`, `VISA_MASTERCARD`, `WING` (only `ABA_PAYWAY` is fully implemented currently — see backend note).

**Response `200`**
```json
{
  "success": true,
  "message": "Subscription upgraded and payment confirmed successfully",
  "data": {
    "subscription": {
      "id": "uuid",
      "status": "ACTIVE",
      "endDate": "2026-10-27T00:00:00.000Z",
      "autoRenew": true
    },
    "transaction": {
      "id": "uuid",
      "amount": 9.99,
      "status": "SUCCESS",
      "gatewayRef": "ABA-...",
      "invoiceNumber": "INV-..."
    }
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Plan not found |
| 400 | Payment failed: `<reason>`. You can retry this payment. *(includes `transactionId` to use with the retry endpoint)* |

---

### 4. Cancel Subscription (Auto-renewal)
**US-16**

`POST /api/v1/subscription/cancel`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Auto-renewal has been canceled. You can keep using your plan until it expires.",
  "data": {
    "id": "uuid",
    "autoRenew": false,
    "canceledAt": "2026-09-27T00:00:00.000Z"
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | No subscription found |

---

### 5. Retry Failed Payment
**US-20**

`POST /api/v1/subscription/payments/:transactionId/retry`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Payment retried successfully",
  "data": {
    "id": "uuid",
    "status": "SUCCESS",
    "gatewayRef": "ABA-...",
    "invoiceNumber": "INV-..."
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Transaction not found |
| 400 | Only failed transactions can be retried / Retry failed: `<reason>` |

---

### 6. View Transaction History
**US-22**

`GET /api/v1/billing/transactions`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Transaction history fetched successfully",
  "data": [
    {
      "id": "uuid",
      "amount": 9.99,
      "currency": "USD",
      "paymentMethod": "ABA_PAYWAY",
      "status": "SUCCESS",
      "invoiceNumber": "INV-...",
      "createdAt": "2026-09-27T00:00:00.000Z",
      "plan": { "name": "Basic Monthly" }
    }
  ]
}
```

---

### 7. View Transaction Detail
**US-23**

`GET /api/v1/billing/transactions/:id`
**Auth:** Bearer Token

**Response `200`**
```json
{
  "success": true,
  "message": "Transaction detail fetched successfully",
  "data": {
    "id": "uuid",
    "amount": 9.99,
    "currency": "USD",
    "status": "SUCCESS",
    "paymentMethod": "ABA_PAYWAY",
    "invoiceNumber": "INV-...",
    "createdAt": "2026-09-27T00:00:00.000Z",
    "plan": { "name": "Basic Monthly" },
    "chef": { "email": "chef@example.com", "displayName": "Sok Dara" }
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Transaction not found |

---

### 8. Download Invoice (PDF)
**US-23**

`GET /api/v1/billing/transactions/:id/invoice`
**Auth:** Bearer Token

**Response `200`**
Binary PDF stream (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename=invoice-<number>.pdf`)

**Errors**
| Status | Message |
|---|---|
| 404 | Transaction not found |

---

### 9. Update Billing Information
**US-24**

`PATCH /api/v1/billing/info`
**Auth:** Bearer Token

**Request Body**
```json
{
  "billingName": "Sok Dara Catering",
  "shopAddress": "St 271, Phnom Penh",
  "phoneNumber": "012345678"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Billing information updated successfully",
  "data": {
    "id": "uuid",
    "billingName": "Sok Dara Catering",
    "shopAddress": "St 271, Phnom Penh",
    "phoneNumber": "012345678"
  }
}
```

---

### 10. Request Refund
**US-25**

`POST /api/v1/billing/transactions/:id/refund-request`
**Auth:** Bearer Token

**Request Body**
```json
{
  "reason": "Charged twice for the same billing cycle"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Refund request submitted successfully",
  "data": {
    "id": "uuid",
    "refundStatus": "REQUESTED",
    "refundReason": "Charged twice for the same billing cycle"
  }
}
```

**Errors**
| Status | Message |
|---|---|
| 404 | Transaction not found |
| 400 | Only successful transactions can be refunded |
| 409 | A refund has already been requested for this transaction |

---

## Summary Table

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | `/subscription/plans` | Public | US-13 |
| 2 | GET | `/subscription/me` | Bearer | US-15 |
| 3 | POST | `/subscription/upgrade` | Bearer | US-14, US-18, US-19, US-21 |
| 4 | POST | `/subscription/cancel` | Bearer | US-16 |
| 5 | POST | `/subscription/payments/:transactionId/retry` | Bearer | US-20 |
| 6 | GET | `/billing/transactions` | Bearer | US-22 |
| 7 | GET | `/billing/transactions/:id` | Bearer | US-23 |
| 8 | GET | `/billing/transactions/:id/invoice` | Bearer | US-23 |
| 9 | PATCH | `/billing/info` | Bearer | US-24 |
| 10 | POST | `/billing/transactions/:id/refund-request` | Bearer | US-25 |