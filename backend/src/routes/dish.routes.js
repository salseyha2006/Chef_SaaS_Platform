const express = require('express');
const router = express.Router();

const dishController = require('../controllers/dish.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const { createDishSchema, updateDishSchema } = require('../validators/dish.validator');

router.get('/', requireAuth, dishController.getDishes);
router.post('/', requireAuth, requireActiveSubscription, validate(createDishSchema), dishController.createDish);
router.get('/:id', requireAuth, dishController.getDishDetail);
router.patch('/:id', requireAuth, requireActiveSubscription, validate(updateDishSchema), dishController.updateDish);
router.post('/:id/duplicate', requireAuth, requireActiveSubscription, dishController.duplicateDish);
router.patch('/:id/archive', requireAuth, requireActiveSubscription, dishController.archiveDish);
router.delete('/:id', requireAuth, requireActiveSubscription, dishController.deleteDish);

module.exports = router;