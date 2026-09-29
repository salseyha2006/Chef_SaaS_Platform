const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildShoppingListWithPurchaseStatus } = require('../services/shoppingList.service');

// GET shopping list with purchased checkbox + progress bar data
const getShoppingListWithStatus = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const result = await buildShoppingListWithPurchaseStatus(eventId);

  return new ApiResponse(
    200,
    {
      eventId,
      eventName: result.event.name,
      items: result.items,
      progress: result.progress,
      purchasedCount: result.purchasedCount,
      totalCount: result.totalCount,
    },
    'Shopping list with purchase status fetched successfully'
  ).send(res);
});

// US-60: Mark Items as Purchased (Check-off) — toggle single ingredient
const togglePurchased = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { eventId, chefIngredientId } = req.params;
  const { isPurchased } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  // Ownership check — a chef must not be able to toggle another chef's ingredient by guessing its id
  const chefIngredient = await prisma.chefIngredient.findUnique({ where: { id: chefIngredientId } });
  if (!chefIngredient || chefIngredient.chefId !== chefId) {
    throw ApiError.notFound('Ingredient not found', { code: 'INGREDIENT_NOT_FOUND' });
  }

  const status = await prisma.eventPurchaseStatus.upsert({
    where: { eventId_chefIngredientId: { eventId, chefIngredientId } },
    update: { isPurchased, purchasedAt: isPurchased ? new Date() : null },
    create: { eventId, chefIngredientId, isPurchased, purchasedAt: isPurchased ? new Date() : null },
  });

  return new ApiResponse(
    200,
    status,
    isPurchased ? 'Item marked as purchased' : 'Item marked as not purchased'
  ).send(res);
});

module.exports = { getShoppingListWithStatus, togglePurchased };