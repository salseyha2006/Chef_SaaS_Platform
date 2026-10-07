const express = require('express');
const router = express.Router();

const vendorPresetController = require('../controllers/vendorPreset.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const { vendorPresetSchema } = require('../validators/event.validator');

router.get('/', requireAuth, vendorPresetController.getVendorPresets);
router.post('/', requireAuth, requireActiveSubscription, validate(vendorPresetSchema), vendorPresetController.createVendorPreset);
router.patch('/:id', requireAuth, requireActiveSubscription, vendorPresetController.updateVendorPreset);
router.delete('/:id', requireAuth, requireActiveSubscription, vendorPresetController.deleteVendorPreset);

module.exports = router;
