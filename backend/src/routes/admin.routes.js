const express = require('express');
const router = express.Router();

const refundController = require('../controllers/refund.controller');
const requireAdminSecret = require('../middlewares/requireAdminSecret');
const validate = require('../middlewares/validate');
const { rejectRefundSchema } = require('../validators/billing.validator');

router.get('/refund-requests', requireAdminSecret, refundController.getPendingRefundRequests);
router.post('/refund-requests/:transactionId/approve', requireAdminSecret, refundController.approveRefund);
router.post(
  '/refund-requests/:transactionId/reject',
  requireAdminSecret,
  validate(rejectRefundSchema),
  refundController.rejectRefund
);

module.exports = router;
