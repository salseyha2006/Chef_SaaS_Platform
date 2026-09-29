const express = require('express');
const router = express.Router();

const dishController = require('../controllers/dish.controller');
const requireAuth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createDishSchema, updateDishSchema } = require('../validators/dish.validator');

router.get('/', requireAuth, dishController.getDishes);
router.post('/', requireAuth, validate(createDishSchema), dishController.createDish);
router.get('/:id', requireAuth, dishController.getDishDetail);
router.patch('/:id', requireAuth, validate(updateDishSchema), dishController.updateDish);
router.post('/:id/duplicate', requireAuth, dishController.duplicateDish);
router.patch('/:id/archive', requireAuth, dishController.archiveDish);
router.delete('/:id', requireAuth, dishController.deleteDish);

module.exports = router;
