const { z } = require('zod');

const upgradeSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentMethod: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']),
  savedPaymentMethodId: z.string().uuid().optional(), // US-18 Scenario 2
});

const updateBillingInfoSchema = z.object({
  billingName: z.string().min(2).optional(),
  shopAddress: z.string().min(2).optional(),
  phoneNumber: z.string().min(6).optional(),
});

const requestRefundSchema = z.object({
  reason: z.string().min(5, 'Please describe the reason for the refund'),
});

// US-18 Scenario 2: token must already come from the gateway's own client-side SDK —
// this backend never accepts a raw card number.
const addSavedPaymentMethodSchema = z.object({
  provider: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']),
  gatewayToken: z.string().min(4, 'A valid gateway token is required'),
  last4: z.string().length(4, 'last4 must be exactly 4 digits'),
  brand: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const retryPaymentSchema = z.object({
  paymentMethod: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']).optional(), // US-20 Scenario 2
  savedPaymentMethodId: z.string().uuid().optional(),
});

module.exports = {
  upgradeSubscriptionSchema,
  updateBillingInfoSchema,
  requestRefundSchema,
  addSavedPaymentMethodSchema,
  retryPaymentSchema,
};