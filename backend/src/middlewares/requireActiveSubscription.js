const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

async function requireActiveSubscription(req, res, next) {
  let subscription;
  try {
    subscription = await prisma.subscription.findUnique({ where: { chefId: req.chef.id } });
  } catch (err) {
    return next(err);
  }

  if (!subscription) {
    return next(
      ApiError.forbidden('No subscription found. Please subscribe to continue.', {
        code: 'SUBSCRIPTION_NOT_FOUND',
      })
    );
  }

  const isUsable =
    ['TRIALING', 'ACTIVE'].includes(subscription.status) && subscription.endDate > new Date();

  if (!isUsable) {
    return next(
      ApiError.forbidden('Your subscription has expired. Please renew to unlock this feature.', {
        code: 'SUBSCRIPTION_EXPIRED',
      })
    );
  }

  next();
}

module.exports = requireActiveSubscription;
