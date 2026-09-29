const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { chargeSubscription, getSubscriptionEndDate } = require('../services/subscription.service');
const { generateInvoicePdfBuffer } = require('../services/pdf.service');
const { sendReceiptEmail } = require('../services/email.service');

// Fire-and-forget: never block the API response on a slow SMTP provider
async function sendReceiptEmailInBackground(chef, plan, transaction) {
  try {
    const invoiceData = { ...transaction, plan, chef };
    const pdfBuffer = await generateInvoicePdfBuffer({ transaction: invoiceData, language: chef.language });
    await sendReceiptEmail({ toEmail: chef.email, transaction: invoiceData, language: chef.language, pdfBuffer });
  } catch (err) {
    console.error('Failed to send receipt email:', err);
  }
}

// US-13: View Pricing & Plans
const getPlans = asyncHandler(async (req, res) => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true, billingCycle: { not: 'trial' } },
    orderBy: [{ isRecommended: 'desc' }, { price: 'asc' }],
  });
  return new ApiResponse(200, plans, 'Plans fetched successfully').send(res);
});

// US-15: View Current Trial / Subscription Status
const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.findUnique({
    where: { chefId: req.chef.id },
    include: { plan: true },
  });

  if (!subscription) throw ApiError.notFound('No subscription found', { code: 'SUBSCRIPTION_NOT_FOUND' });

  const daysRemaining = Math.max(
    0,
    Math.ceil((subscription.endDate - new Date()) / (24 * 60 * 60 * 1000))
  );

  return new ApiResponse(
    200,
    { ...subscription, daysRemaining },
    'Subscription status fetched successfully'
  ).send(res);
});

// US-14 + US-18 + US-19 + US-21: Upgrade / Start Paid Subscription
// US-14 + US-18 + US-19 + US-21: Upgrade / Start Paid Subscription
const upgradeSubscription = asyncHandler(async (req, res) => {
  const { planId, paymentMethod, savedPaymentMethodId } = req.body;

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw ApiError.notFound('Plan not found', { code: 'PLAN_NOT_FOUND' });

  const chef = await prisma.chef.findUnique({ where: { id: req.chef.id } });
  const existingSub = await prisma.subscription.findUnique({ where: { chefId: chef.id } });

  const { success, transaction } = await chargeSubscription({
    chef,
    plan,
    paymentMethod,
    savedPaymentMethodId,
    subscriptionId: existingSub?.id || null,
  });

  if (!success) {
    throw ApiError.badRequest(
      `Payment failed: ${transaction.failureReason}. You can retry this payment.`,
      [{ transactionId: transaction.id }],
      { code: 'PAYMENT_FAILED', params: { reason: transaction.failureReason, transactionId: transaction.id } }
    );
  }

  const endDate = getSubscriptionEndDate(plan);

  const subscription = existingSub
    ? await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
          autoRenew: true,
          canceledAt: null,
          retryCount: 0,
        },
      })
    : await prisma.subscription.create({
        data: { chefId: chef.id, planId: plan.id, status: 'ACTIVE', endDate, autoRenew: true },
      });

  await prisma.transaction.update({ where: { id: transaction.id }, data: { subscriptionId: subscription.id } });

  sendReceiptEmailInBackground(chef, plan, transaction);

  return new ApiResponse(200, { subscription, transaction }, 'Subscription upgraded and payment confirmed successfully').send(res);
});

// US-16 Scenario 1: Cancel Subscription (Auto-renewal)
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.findUnique({ where: { chefId: req.chef.id } });
  if (!subscription) throw ApiError.notFound('No subscription found', { code: 'SUBSCRIPTION_NOT_FOUND' });

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { autoRenew: false, canceledAt: new Date() },
  });

  return new ApiResponse(
    200,
    updated,
    'Auto-renewal has been canceled. You can keep using your plan until it expires.'
  ).send(res);
});

// US-16 Scenario 3: Re-activate Auto-renewal before the current period ends
const resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.findUnique({ where: { chefId: req.chef.id } });
  if (!subscription) throw ApiError.notFound('No subscription found', { code: 'SUBSCRIPTION_NOT_FOUND' });

  if (subscription.autoRenew) {
    throw ApiError.badRequest('Auto-renewal is already enabled', [], {
      code: 'SUBSCRIPTION_ALREADY_AUTO_RENEWING',
    });
  }

  if (subscription.status !== 'ACTIVE' || subscription.endDate <= new Date()) {
    throw ApiError.badRequest(
      'This subscription has already ended and cannot be resumed. Please subscribe again.',
      [],
      { code: 'SUBSCRIPTION_EXPIRED_CANNOT_RESUME' }
    );
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { autoRenew: true, canceledAt: null },
  });

  return new ApiResponse(200, updated, 'Auto-renewal has been resumed').send(res);
});

module.exports = { getPlans, getMySubscription, upgradeSubscription, cancelSubscription, resumeSubscription };