const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unit.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const { createUnitSchema, updateUnitSchema } = require('../validators/catalog.validator');

router.get('/presets', requireAuth, unitController.getUnitPresets);
router.get('/', requireAuth, unitController.getMyUnits);
router.post('/', requireAuth, requireActiveSubscription, validate(createUnitSchema), unitController.createUnit);
router.post('/presets/:presetId/import', requireAuth, requireActiveSubscription, unitController.importUnitPreset);
router.patch('/:id', requireAuth, requireActiveSubscription, validate(updateUnitSchema), unitController.updateUnit);
router.patch('/:id/archive', requireAuth, requireActiveSubscription, unitController.archiveUnit);

module.exports = router;
