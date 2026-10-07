const express = require('express');
const router = express.Router();

const menuSetController = require('../controllers/menuSet.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const { createMenuSetSchema, updateMenuSetSchema } = require('../validators/menuSet.validator');

router.get('/', requireAuth, menuSetController.getMenuSets);
router.post('/', requireAuth, requireActiveSubscription, validate(createMenuSetSchema), menuSetController.createMenuSet);
router.get('/:id', requireAuth, menuSetController.getMenuSetDetail);
router.patch('/:id', requireAuth, requireActiveSubscription, validate(updateMenuSetSchema), menuSetController.updateMenuSet);
router.patch('/:id/archive', requireAuth, requireActiveSubscription, menuSetController.archiveMenuSet);
router.delete('/:id', requireAuth, requireActiveSubscription, menuSetController.deleteMenuSet);

module.exports = router;
