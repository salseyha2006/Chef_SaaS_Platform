const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredient.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  importIngredientsSchema,
  updateChefIngredientSchema,
} = require('../validators/catalog.validator');

router.get('/presets', requireAuth, ingredientController.getIngredientPresets);
router.post(
  '/import',
  requireAuth,
  validate(importIngredientsSchema),
  ingredientController.importIngredients
);
router.get('/my-stock', requireAuth, ingredientController.getMyIngredients);
router.patch(
  '/my-stock/:ingredientId',
  requireAuth,
  validate(updateChefIngredientSchema),
  ingredientController.updateMyIngredient
);
router.patch('/my-stock/:ingredientId/archive', requireAuth, ingredientController.archiveMyIngredient);
router.delete('/my-stock/:ingredientId', requireAuth, ingredientController.deleteMyIngredient);

module.exports = router;
