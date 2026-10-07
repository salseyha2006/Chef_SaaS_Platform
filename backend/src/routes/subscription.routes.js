const express = require('express');
const router = express.Router();

const subscriptionController = require('../controllers/subscription.controller');
const paymentController = require('../controllers/payment.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { upgradeSubscriptionSchema, retryPaymentSchema } = require('../validators/billing.validator');

router.get('/plans', subscriptionController.getPlans);
router.get('/me', requireAuth, subscriptionController.getMySubscription);
router.post(
  '/upgrade',
  requireAuth,
  validate(upgradeSubscriptionSchema),
  subscriptionController.upgradeSubscription
);
router.post('/cancel', requireAuth, subscriptionController.cancelSubscription);
router.post('/resume', requireAuth, subscriptionController.resumeSubscription);
router.post(
  '/payments/:transactionId/retry',
  requireAuth,
  validate(retryPaymentSchema),
  paymentController.retryPayment
);

module.exports = router;
