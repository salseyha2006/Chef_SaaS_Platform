const { z } = require('zod');

const upgradeSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentMethod: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']),
  savedPaymentMethodId: z.string().uuid().optional(),
});

const updateBillingInfoSchema = z.object({
  billingName: z.string().min(2).optional(),
  shopAddress: z.string().min(2).optional(),
  phoneNumber: z.string().min(6).optional(),
});

const requestRefundSchema = z.object({
  reason: z.string().min(5, 'Please describe the reason for the refund'),
});

const addSavedPaymentMethodSchema = z.object({
  provider: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']),
  gatewayToken: z.string().min(4, 'A valid gateway token is required'),
  last4: z.string().length(4, 'last4 must be exactly 4 digits'),
  brand: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const retryPaymentSchema = z.object({
  paymentMethod: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']).optional(),
  savedPaymentMethodId: z.string().uuid().optional(),
});

const rejectRefundSchema = z.object({
  reason: z.string().min(5, 'Please describe the reason for rejecting this refund'),
});

module.exports = {
  upgradeSubscriptionSchema,
  updateBillingInfoSchema,
  requestRefundSchema,
  addSavedPaymentMethodSchema,
  retryPaymentSchema,
  rejectRefundSchema,
};
