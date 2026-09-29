const cron = require('node-cron');
const prisma = require('../config/db');
const { chargeSubscription, getSubscriptionEndDate } = require('../services/subscription.service');

async function processExpiredSubscriptions() {
  const now = new Date();

  const expiring = await prisma.subscription.findMany({
    where: { endDate: { lte: now }, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
    include: { plan: true, chef: true },
  });

  for (const sub of expiring) {
    if (sub.autoRenew && sub.status !== 'TRIALING') {
      const { success } = await chargeSubscription({
        chef: sub.chef,
        plan: sub.plan,
        paymentMethod: 'ABA_PAYWAY',
        subscriptionId: sub.id,
      });

      if (success) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'ACTIVE', endDate: getSubscriptionEndDate(sub.plan) },
        });
        continue;
      }

      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'PAST_DUE' } });
    } else {
      // US-17: Graceful lockout — do not delete any data
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'EXPIRED' } });
    }
  }

  console.log(`⏰ Subscription cron: processed ${expiring.length} expiring subscription(s)`);
}

function startSubscriptionCron() {
  cron.schedule('10 0 * * *', () => {
    processExpiredSubscriptions().catch((err) =>
      console.error('❌ Subscription cron failed:', err)
    );
  });
}

module.exports = { startSubscriptionCron, processExpiredSubscriptions };
