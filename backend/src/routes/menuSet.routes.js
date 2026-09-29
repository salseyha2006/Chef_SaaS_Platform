const express = require('express');
const router = express.Router();

const menuSetController = require('../controllers/menuSet.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createMenuSetSchema, updateMenuSetSchema } = require('../validators/menuSet.validator');

router.get('/', requireAuth, menuSetController.getMenuSets);
router.post('/', requireAuth, validate(createMenuSetSchema), menuSetController.createMenuSet);
router.get('/:id', requireAuth, menuSetController.getMenuSetDetail);
router.patch('/:id', requireAuth, validate(updateMenuSetSchema), menuSetController.updateMenuSet);
router.patch('/:id/archive', requireAuth, menuSetController.archiveMenuSet);
router.delete('/:id', requireAuth, menuSetController.deleteMenuSet);

module.exports = router;
