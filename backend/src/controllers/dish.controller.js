const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateDishCost } = require('../services/costing.service');

async function upsertDishIngredients(dishId, ingredients) {
  await prisma.dishIngredient.deleteMany({ where: { dishId } });
  if (ingredients.length > 0) {
    await prisma.dishIngredient.createMany({
      data: ingredients.map((i) => ({
        dishId,
        chefIngredientId: i.chefIngredientId,
        quantityUsed: i.quantityUsed,
      })),
    });
  }
}

// US-37: Create Dish (Recipe)
const createDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, description, imageUrl, tags, ingredients } = req.body;

  const chefIngredientIds = ingredients.map((i) => i.chefIngredientId);
  const validCount = await prisma.chefIngredient.count({
    where: { id: { in: chefIngredientIds }, chefId },
  });
  if (validCount !== chefIngredientIds.length) {
    throw ApiError.badRequest('One or more ingredients are not in your stock', [], { code: 'DISH_INGREDIENTS_NOT_IN_STOCK' });
  }

  const dish = await prisma.dish.create({
    data: { chefId, name, description, imageUrl, tags: tags || [] },
  });

  await upsertDishIngredients(dish.id, ingredients);
  await recalculateDishCost(dish.id);

  const fullDish = await prisma.dish.findUnique({ where: { id: dish.id } });

  return new ApiResponse(201, fullDish, 'Dish created successfully').send(res);
});

// US-44 support: List dishes
const getDishes = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { tag, archived } = req.query;

  const dishes = await prisma.dish.findMany({
    where: {
      chefId,
      isArchived: archived === 'true',
      tags: tag ? { has: tag } : undefined,
    },
    orderBy: { name: 'asc' },
  });

  return new ApiResponse(200, dishes, 'Dishes fetched successfully').send(res);
});

// US-38: View Dish Details & Cost Breakdown
const getDishDetail = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const dish = await prisma.dish.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          chefIngredient: { include: { ingredient: true, unit: true } },
        },
      },
    },
  });

  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const breakdown = dish.ingredients.map((di) => {
    const subtotal = di.quantityUsed * di.chefIngredient.purchasePrice;
    return {
      ingredientName: di.chefIngredient.ingredient.name,
      quantityUsed: di.quantityUsed,
      unit: di.chefIngredient.unit.abbreviation,
      unitPrice: di.chefIngredient.purchasePrice,
      subtotal,
      percentageOfTotal: dish.totalCost > 0 ? Number(((subtotal / dish.totalCost) * 100).toFixed(1)) : 0,
    };
  });

  return new ApiResponse(
    200,
    {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      imageUrl: dish.imageUrl,
      tags: dish.tags,
      totalCost: dish.totalCost,
      isArchived: dish.isArchived,
      costBreakdown: breakdown,
    },
    'Dish detail fetched successfully'
  ).send(res);
});

// US-39: Edit Dish / Recipe
const updateDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, description, imageUrl, tags, ingredients } = req.body;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  if (ingredients) {
    const chefIngredientIds = ingredients.map((i) => i.chefIngredientId);
    const validCount = await prisma.chefIngredient.count({
      where: { id: { in: chefIngredientIds }, chefId },
    });
    if (validCount !== chefIngredientIds.length) {
      throw ApiError.badRequest('One or more ingredients are not in your stock', [], { code: 'DISH_INGREDIENTS_NOT_IN_STOCK' });
    }
    await upsertDishIngredients(id, ingredients);
  }

  await prisma.dish.update({
    where: { id },
    data: { name, description, imageUrl, tags },
  });

  await recalculateDishCost(id);

  const updated = await prisma.dish.findUnique({ where: { id } });
  return new ApiResponse(200, updated, 'Dish updated successfully').send(res);
});

// US-40: Duplicate Dish (Clone Recipe)
const duplicateDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const original = await prisma.dish.findUnique({
    where: { id },
    include: { ingredients: true },
  });
  if (!original || original.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const clone = await prisma.dish.create({
    data: {
      chefId,
      name: `${original.name} (Copy)`,
      description: original.description,
      imageUrl: original.imageUrl,
      tags: original.tags,
      totalCost: original.totalCost,
    },
  });

  if (original.ingredients.length > 0) {
    await prisma.dishIngredient.createMany({
      data: original.ingredients.map((i) => ({
        dishId: clone.id,
        chefIngredientId: i.chefIngredientId,
        quantityUsed: i.quantityUsed,
      })),
    });
  }

  return new ApiResponse(201, clone, 'Dish duplicated successfully').send(res);
});

// US-41: Archive / Delete Dish
const archiveDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const updated = await prisma.dish.update({ where: { id }, data: { isArchived: true } });
  return new ApiResponse(200, updated, 'Dish archived successfully').send(res);
});

const deleteDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const usageCount = await prisma.menuSetDish.count({ where: { dishId: id } });
  if (usageCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: this dish is used in ${usageCount} menu set(s). Archive it instead.`,
      { code: 'DISH_IN_USE', params: { count: usageCount } }
    );
  }

  await prisma.dish.delete({ where: { id } });

  return new ApiResponse(200, null, 'Dish deleted successfully').send(res);
});

module.exports = {
  createDish,
  getDishes,
  getDishDetail,
  updateDish,
  duplicateDish,
  archiveDish,
  deleteDish,
};
