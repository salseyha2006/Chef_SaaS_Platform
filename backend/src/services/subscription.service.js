const prisma = require('../config/db');
const abaPayway = require('./abaPayway.service');

const TRIAL_DURATION_DAYS = 14;

// US-12: Auto-start Free Trial (called right after Chef registers)
async function startTrialForChef(chefId) {
  let trialPlan = await prisma.plan.findFirst({ where: { billingCycle: 'trial' } });

  if (!trialPlan) {
    trialPlan = await prisma.plan.create({
      data: {
        name: 'Free Trial',
        price: 0,
        billingCycle: 'trial',
        durationDays: TRIAL_DURATION_DAYS,
      },
    });
  }

  const endDate = new Date(Date.now() + trialPlan.durationDays * 24 * 60 * 60 * 1000);

  return prisma.subscription.create({
    data: {
      chefId,
      planId: trialPlan.id,
      status: 'TRIALING',
      startDate: new Date(),
      endDate,
      autoRenew: false,
    },
  });
}

// US-19 / US-20: Attempt to charge a chef for a given plan and record the transaction
async function chargeSubscription({ chef, plan, paymentMethod, subscriptionId = null }) {
  if (paymentMethod !== 'ABA_PAYWAY') {
    throw new Error(`Payment method ${paymentMethod} is not yet supported`);
  }

  const chargeResult = await abaPayway.charge({
    amount: plan.price,
    currency: 'USD',
    chefEmail: chef.email,
    description: `Chef SaaS - ${plan.name}`,
  });

  const invoiceNumber = `INV-${Date.now()}`;

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
