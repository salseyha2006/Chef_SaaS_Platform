const express = require('express');
const router = express.Router();

const billingController = require('../controllers/billing.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { updateBillingInfoSchema, requestRefundSchema } = require('../validators/billing.validator');
const paymentMethodRoutes = require('./paymentMethod.routes');

router.get('/transactions', requireAuth, billingController.getTransactionHistory);
router.get('/transactions/:id', requireAuth, billingController.getTransactionDetail);
router.get('/transactions/:id/invoice', requireAuth, billingController.downloadInvoice);
router.patch(
  '/info',
  requireAuth,
  validate(updateBillingInfoSchema),
  billingController.updateBillingInfo
);
router.post(
  '/transactions/:id/refund-request',
  requireAuth,
  validate(requestRefundSchema),
  billingController.requestRefund
);
router.use('/payment-methods', paymentMethodRoutes);

module.exports = router;
