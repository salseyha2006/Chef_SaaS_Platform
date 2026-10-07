const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event.controller');
const vendorPresetController = require('../controllers/vendorPreset.controller');
const reportController = require('../controllers/report.controller');
const procurementController = require('../controllers/procurement.controller');
const requireAuth = require('../middlewares/auth.middleware');
const requireActiveSubscription = require('../middlewares/requireActiveSubscription');
const validate = require('../middlewares/validate');
const {
  createEventSchema,
  updateEventSchema,
  cloneEventSchema,
  addItemsToEventSchema,
  generatePdfReportSchema,
} = require('../validators/event.validator');
const { togglePurchasedSchema } = require('../validators/procurement.validator');

router.get('/', requireAuth, eventController.getEvents);
router.post('/', requireAuth, requireActiveSubscription, validate(createEventSchema), eventController.createEvent);
router.get('/:id', requireAuth, eventController.getEventDetail);
router.patch('/:id', requireAuth, requireActiveSubscription, validate(updateEventSchema), eventController.updateEvent);
router.post('/:id/clone', requireAuth, requireActiveSubscription, validate(cloneEventSchema), eventController.cloneEvent);
router.post(
  '/:id/items',
  requireAuth,
  requireActiveSubscription,
  validate(addItemsToEventSchema),
  eventController.addItemsToEvent
);
router.delete('/:id/dishes/:dishId', requireAuth, requireActiveSubscription, eventController.removeDishFromEvent);
router.delete('/:id/menu-sets/:menuSetId', requireAuth, requireActiveSubscription, eventController.removeMenuSetFromEvent);
router.get('/:id/cost-calculation', requireAuth, eventController.getEventCostCalculation);

router.get(
  '/:eventId/shopping-list/vendor/:vendorPresetId',
  requireAuth,
  vendorPresetController.getShoppingListByVendor
);

// Exports stay available even when expired (US-17 Technical Note: view/export allowed)
router.post('/:eventId/reports/pdf', requireAuth, validate(generatePdfReportSchema), reportController.generatePdfReport);
router.get('/:eventId/reports/excel', requireAuth, reportController.exportExcelReport);

// Epic 12: Procurement & Purchase Tracking
router.get('/:eventId/shopping-list', requireAuth, procurementController.getShoppingListWithStatus);
router.patch(
  '/:eventId/shopping-list/:chefIngredientId/toggle-purchased',
  requireAuth,
  requireActiveSubscription,
  validate(togglePurchasedSchema),
  procurementController.togglePurchased
);

module.exports = router;
