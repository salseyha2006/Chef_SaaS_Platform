const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unit.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createUnitSchema, updateUnitSchema } = require('../validators/catalog.validator');

router.get('/presets', requireAuth, unitController.getUnitPresets);
router.get('/', requireAuth, unitController.getMyUnits);
router.post('/', requireAuth, validate(createUnitSchema), unitController.createUnit);
router.post('/presets/:presetId/import', requireAuth, unitController.importUnitPreset);
router.patch('/:id', requireAuth, validate(updateUnitSchema), unitController.updateUnit);
router.patch('/:id/archive', requireAuth, unitController.archiveUnit);

module.exports = router;