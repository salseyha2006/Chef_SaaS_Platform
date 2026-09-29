const express = require('express');
const router = express.Router();

const unitController = require('../controllers/unit.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createUnitSchema } = require('../validators/catalog.validator');

router.get('/', requireAuth, unitController.getUnits);
router.post('/', requireAuth, validate(createUnitSchema), unitController.createUnit);
router.post('/:unitId/select', requireAuth, unitController.selectUnit);
router.patch('/:unitId/deselect', requireAuth, unitController.deselectUnit);

module.exports = router;
