const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/catalog.validator');

router.get('/presets', requireAuth, categoryController.getCategoryPresets);
router.get('/', requireAuth, categoryController.getMyCategories);
router.post('/', requireAuth, requireActiveSubscription, validate(createCategorySchema), categoryController.createCategory);
router.post('/presets/:presetId/import', requireAuth, requireActiveSubscription, categoryController.importCategoryPreset);
router.patch('/:id', requireAuth, requireActiveSubscription, validate(updateCategorySchema), categoryController.updateCategory);
router.patch('/:id/archive', requireAuth, requireActiveSubscription, categoryController.archiveCategory);

module.exports = router;