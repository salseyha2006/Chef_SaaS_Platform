const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createCategorySchema } = require('../validators/catalog.validator');

router.get('/', requireAuth, categoryController.getCategories);
router.post('/', requireAuth, validate(createCategorySchema), categoryController.createCategory);
router.post('/:categoryId/select', requireAuth, categoryController.selectCategory);
router.patch('/:categoryId/deselect', requireAuth, categoryController.deselectCategory);

module.exports = router;
