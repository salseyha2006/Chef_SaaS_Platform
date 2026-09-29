const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: null });
});

router.use('/auth', require('./auth.routes'));
router.use('/onboarding', require('./onboarding.routes'));
router.use('/subscription', require('./subscription.routes'));
router.use('/billing', require('./billing.routes'));
router.use('/units', require('./unit.routes'));
router.use('/categories', require('./category.routes'));
router.use('/ingredients', require('./ingredient.routes'));
router.use('/dishes', require('./dish.routes'));
router.use('/menu-sets', require('./menuSet.routes'));
router.use('/events', require('./event.routes'));
router.use('/vendor-presets', require('./vendorPreset.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
