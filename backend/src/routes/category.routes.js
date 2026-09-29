const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/catalog.validator');

router.get('/presets', requireAuth, categoryController.getCategoryPresets);
router.get('/', requireAuth, categoryController.getMyCategories);
router.post('/', requireAuth, validate(createCategorySchema), categoryController.createCategory);
router.post('/presets/:presetId/import', requireAuth, categoryController.importCategoryPreset);
router.patch('/:id', requireAuth, validate(updateCategorySchema), categoryController.updateCategory);
router.patch('/:id/archive', requireAuth, categoryController.archiveCategory);

module.exports = router;