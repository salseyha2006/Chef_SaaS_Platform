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
  const { eventId, ingredientId } = req.params;
  const { isPurchased } = req.body;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
  if (!ingredient) throw ApiError.notFound('Ingredient not found', { code: 'INGREDIENT_NOT_FOUND' });

  const status = await prisma.eventPurchaseStatus.upsert({
    where: { eventId_ingredientId: { eventId, ingredientId } },
    update: { isPurchased, purchasedAt: isPurchased ? new Date() : null },
    create: { eventId, ingredientId, isPurchased, purchasedAt: isPurchased ? new Date() : null },
  });

  return new ApiResponse(
    200,
    status,
    isPurchased ? 'Item marked as purchased' : 'Item marked as not purchased'
  ).send(res);
});

module.exports = { getShoppingListWithStatus, togglePurchased };
