const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredient.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  importIngredientsSchema,
  createIngredientSchema,
  updateChefIngredientSchema,
} = require('../validators/catalog.validator');

router.get('/presets', requireAuth, ingredientController.getIngredientPresets);
router.post('/import', requireAuth, validate(importIngredientsSchema), ingredientController.importIngredients);
router.post('/', requireAuth, validate(createIngredientSchema), ingredientController.createIngredient);
router.get('/my-stock', requireAuth, ingredientController.getMyIngredients);
router.patch(
  '/my-stock/:id',
  requireAuth,
  validate(updateChefIngredientSchema),
  ingredientController.updateMyIngredient
);
router.patch('/my-stock/:id/archive', requireAuth, ingredientController.archiveMyIngredient);
router.delete('/my-stock/:id', requireAuth, ingredientController.deleteMyIngredient);

module.exports = router;