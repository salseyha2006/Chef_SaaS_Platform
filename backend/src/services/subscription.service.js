const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const paymentService = require('./payment.service');

const TRIAL_DURATION_DAYS = 14;

// US-12 Scenario 3 + Technical Note: trialUsed is a permanent, account-level flag
async function startTrialForChef(chefId) {
  const chef = await prisma.chef.findUnique({ where: { id: chefId }, select: { trialUsed: true } });
  if (chef?.trialUsed) {
    throw ApiError.forbidden('Free trial has already been used for this account', {
      code: 'TRIAL_ALREADY_USED',
    });
  }

  let trialPlan = await prisma.plan.findFirst({ where: { billingCycle: 'trial' } });

  if (!trialPlan) {
    trialPlan = await prisma.plan.create({
      data: { name: 'Free Trial', price: 0, billingCycle: 'trial', durationDays: TRIAL_DURATION_DAYS },
    });
  }

  const endDate = new Date(Date.now() + trialPlan.durationDays * 24 * 60 * 60 * 1000);

  const [subscription] = await prisma.$transaction([
    prisma.subscription.create({
      data: { chefId, planId: trialPlan.id, status: 'TRIALING', startDate: new Date(), endDate, autoRenew: false },
    }),
    prisma.chef.update({ where: { id: chefId }, data: { trialUsed: true } }),
  ]);

  return subscription;
}

// US-19 / US-20: Attempt to charge a chef for a given plan and record the transaction.
// Optionally charges a previously saved card (US-18 Scenario 2) instead of a fresh one.
async function chargeSubscription({
  chef,
  plan,
  paymentMethod,
  subscriptionId = null,
  savedPaymentMethodId = null,
  idempotencyKey = null,
}) {
  let savedToken = null;

  if (savedPaymentMethodId) {
    const saved = await prisma.savedPaymentMethod.findUnique({ where: { id: savedPaymentMethodId } });
    if (!saved || saved.chefId !== chef.id) {
      throw ApiError.badRequest('Saved payment method not found', [], { code: 'PAYMENT_METHOD_NOT_FOUND' });
    }
    if (saved.provider !== paymentMethod) {
      throw ApiError.badRequest(
        'Saved payment method does not match the selected payment method',
        [],
        { code: 'PAYMENT_METHOD_MISMATCH' }
      );
    }
    savedToken = saved.gatewayToken;
  }

  // NOTE (US-14/US-19 Technical Note): ABA PayWay is currently mocked, so this trusts the
  // synchronous gateway response rather than a webhook. Revisit once real credentials
  // are integrated — the real flow should create a PENDING transaction here and let a
  // webhook confirm SUCCESS/FAILED asynchronously.
  const key = idempotencyKey || `${subscriptionId || chef.id}-${Date.now()}`;

  const chargeResult = await paymentService.charge(paymentMethod, {
    amount: plan.price,
    currency: 'USD',
    chefEmail: chef.email,
    description: `Chef SaaS - ${plan.name}`,
    savedToken,
    idempotencyKey: key,
  });

  const invoiceNumber = `INV-${Date.now()}`;

  // US-24 Scenario 2: snapshot billing info at charge time so future edits never retroactively
  // change an already-issued invoice.
  const billingInfo = await prisma.billingInfo.findUnique({ where: { chefId: chef.id } });

  const transaction = await prisma.transaction.create({
    data: {
      chefId: chef.id,
      subscriptionId,
      planId: plan.id,
      amount: plan.price,
      paymentMethod,
      status: chargeResult.success ? 'SUCCESS' : 'FAILED',
      gatewayRef: chargeResult.gatewayRef,
      failureReason: chargeResult.failureReason,
      invoiceNumber,
      billingNameSnapshot: billingInfo?.billingName || null,
      shopAddressSnapshot: billingInfo?.shopAddress || null,
    },
  });

  return { success: chargeResult.success, transaction };
}

function getSubscriptionEndDate(plan, from = new Date()) {
  return new Date(from.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
}

module.exports = {
  startTrialForChef,
  chargeSubscription,
  getSubscriptionEndDate,
  TRIAL_DURATION_DAYS,
};
