const express = require('express');
const router = express.Router();

const ingredientController = require('../controllers/ingredient.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const {
  importIngredientsSchema,
  createIngredientSchema,
  updateChefIngredientSchema,
} = require('../validators/catalog.validator');

router.get('/presets', requireAuth, ingredientController.getIngredientPresets);
router.post(
  '/import',
  requireAuth,
  requireActiveSubscription,
  validate(importIngredientsSchema),
  ingredientController.importIngredients
);
router.post(
  '/',
  requireAuth,
  requireActiveSubscription,
  validate(createIngredientSchema),
  ingredientController.createIngredient
);
router.get('/my-stock', requireAuth, ingredientController.getMyIngredients);
router.patch(
  '/my-stock/:id',
  requireAuth,
  requireActiveSubscription,
  validate(updateChefIngredientSchema),
  ingredientController.updateMyIngredient
);
router.patch('/my-stock/:id/archive', requireAuth, requireActiveSubscription, ingredientController.archiveMyIngredient);
router.delete('/my-stock/:id', requireAuth, requireActiveSubscription, ingredientController.deleteMyIngredient);

module.exports = router;