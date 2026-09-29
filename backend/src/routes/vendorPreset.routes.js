const express = require('express');
const router = express.Router();

const vendorPresetController = require('../controllers/vendorPreset.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { vendorPresetSchema } = require('../validators/event.validator');

router.get('/', requireAuth, vendorPresetController.getVendorPresets);
router.post('/', requireAuth, validate(vendorPresetSchema), vendorPresetController.createVendorPreset);
router.patch('/:id', requireAuth, vendorPresetController.updateVendorPreset);
router.delete('/:id', requireAuth, vendorPresetController.deleteVendorPreset);

module.exports = router;
