const cron = require('node-cron');
const prisma = require('../config/db');
const { chargeSubscription, getSubscriptionEndDate } = require('../services/subscription.service');
const { generateInvoicePdfBuffer } = require('../services/pdf.service');
const { sendReceiptEmail, sendPaymentFailedEmail } = require('../services/email.service');

const MAX_AUTO_RETRY_ATTEMPTS = 3; // US-20 Technical Note: total attempts per cycle (configurable default)
const LOCK_STALE_MINUTES = 10;

// US-19 Scenario 3: atomic claim so overlapping/duplicate cron runs never double-charge the same cycle
async function claimSubscriptionForRenewal(subscriptionId) {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - LOCK_STALE_MINUTES * 60 * 1000);

  const claimed = await prisma.subscription.updateMany({
    where: {
      id: subscriptionId,
      OR: [{ renewalLockedAt: null }, { renewalLockedAt: { lt: staleThreshold } }],
    },
    data: { renewalLockedAt: now },
  });

  return claimed.count > 0;
}

async function sendReceiptEmailSafely(chef, plan, transaction) {
  try {
    const invoiceData = { ...transaction, plan, chef };
    const pdfBuffer = await generateInvoicePdfBuffer({ transaction: invoiceData, language: chef.language });
    await sendReceiptEmail({ toEmail: chef.email, transaction: invoiceData, language: chef.language, pdfBuffer });
  } catch (err) {
    console.error('Failed to send receipt email:', err);
  }
}

async function sendPaymentFailedEmailSafely(chef, plan, reason, retryCount, isFinalAttempt) {
  try {
    await sendPaymentFailedEmail({
      toEmail: chef.email,
      language: chef.language,
      planName: plan.name,
      reason,
      retryCount,
      maxAttempts: MAX_AUTO_RETRY_ATTEMPTS,
      isFinalAttempt,
    });
  } catch (err) {
    console.error('Failed to send payment-failed notification email:', err);
  }
}

async function handleAutoRenewal(sub) {
  const claimed = await claimSubscriptionForRenewal(sub.id);
  if (!claimed) return;

  const defaultMethod = await prisma.savedPaymentMethod.findFirst({
    where: { chefId: sub.chefId, isDefault: true },
  });

  let success = false;
  let transaction = null;
  let failureReason = 'No saved payment method on file';

  if (defaultMethod) {
    const result = await chargeSubscription({
      chef: sub.chef,
      plan: sub.plan,
      paymentMethod: defaultMethod.provider,
      savedPaymentMethodId: defaultMethod.id,
      subscriptionId: sub.id,
      idempotencyKey: `${sub.id}-${sub.endDate.toISOString()}`,
    });
    success = result.success;
    transaction = result.transaction;
    failureReason = transaction?.failureReason || failureReason;
  }

  if (success) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'ACTIVE', endDate: getSubscriptionEndDate(sub.plan), retryCount: 0, renewalLockedAt: null },
    });
    await sendReceiptEmailSafely(sub.chef, sub.plan, transaction);
    return;
  }

  const newRetryCount = sub.retryCount + 1;
  const isFinalAttempt = newRetryCount >= MAX_AUTO_RETRY_ATTEMPTS;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: isFinalAttempt ? 'EXPIRED' : 'PAST_DUE', // US-20 Scenario 3: graceful lockout
      retryCount: newRetryCount,
      renewalLockedAt: null,
    },
  });

  await sendPaymentFailedEmailSafely(sub.chef, sub.plan, failureReason, newRetryCount, isFinalAttempt);
}

async function processExpiredSubscriptions() {
  const now = new Date();

  const expiring = await prisma.subscription.findMany({
    where: { endDate: { lte: now }, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
    include: { plan: true, chef: true },
  });

  let renewalAttempts = 0;
  let directExpirations = 0;

  for (const sub of expiring) {
    if (sub.autoRenew && sub.status !== 'TRIALING') {
      await handleAutoRenewal(sub);
      renewalAttempts++;
    } else {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'EXPIRED' } });
      directExpirations++;
    }
  }

  console.log(
    `⏰ Subscription cron: ${renewalAttempts} renewal attempt(s), ${directExpirations} direct expiration(s)`
  );
}

function startSubscriptionCron() {
  cron.schedule('10 0 * * *', () => {
    processExpiredSubscriptions().catch((err) => console.error('❌ Subscription cron failed:', err));
  });
}

module.exports = { startSubscriptionCron, processExpiredSubscriptions };
