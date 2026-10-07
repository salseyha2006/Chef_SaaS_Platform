const express = require('express');
const router = express.Router();

const paymentMethodController = require('../controllers/paymentMethod.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { addSavedPaymentMethodSchema } = require('../validators/billing.validator');

router.get('/', requireAuth, paymentMethodController.getSavedPaymentMethods);
router.post('/', requireAuth, validate(addSavedPaymentMethodSchema), paymentMethodController.addSavedPaymentMethod);
router.patch('/:id/default', requireAuth, paymentMethodController.setDefaultPaymentMethod);
router.delete('/:id', requireAuth, paymentMethodController.deleteSavedPaymentMethod);

module.exports = router;
