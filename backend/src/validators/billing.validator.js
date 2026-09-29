const { z } = require('zod');

const upgradeSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentMethod: z.enum(['ABA_PAYWAY', 'VISA_MASTERCARD', 'WING']),
});

const updateBillingInfoSchema = z.object({
  billingName: z.string().min(2).optional(),
  shopAddress: z.string().min(2).optional(),
  phoneNumber: z.string().min(6).optional(),
});

const requestRefundSchema = z.object({
  reason: z.string().min(5, 'Please describe the reason for the refund'),
});

module.exports = { upgradeSubscriptionSchema, updateBillingInfoSchema, requestRefundSchema };
