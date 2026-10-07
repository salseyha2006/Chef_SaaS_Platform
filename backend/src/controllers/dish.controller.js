const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateDishCost, getEffectiveQuantity } = require('../services/costing.service');

async function validateIngredientLines(chefId, ingredients) {
  const chefIngredientIds = ingredients.map((i) => i.chefIngredientId);
  const chefIngredients = await prisma.chefIngredient.findMany({
    where: { id: { in: chefIngredientIds }, chefId },
    include: { unit: true },
  });
  if (chefIngredients.length !== new Set(chefIngredientIds).size) {
    throw ApiError.badRequest('One or more ingredients are not in your stock', [], {
      code: 'DISH_INGREDIENTS_NOT_IN_STOCK',
    });
  }
  const chefIngredientMap = new Map(chefIngredients.map((ci) => [ci.id, ci]));

  const lineUnitIds = [...new Set(ingredients.filter((i) => i.unitId).map((i) => i.unitId))];
  if (lineUnitIds.length > 0) {
    const lineUnits = await prisma.chefUnit.findMany({ where: { id: { in: lineUnitIds }, chefId } });
    if (lineUnits.length !== lineUnitIds.length) {
      throw ApiError.badRequest('One or more units are not in your list', [], { code: 'UNIT_NOT_IN_LIST' });
    }
    const lineUnitMap = new Map(lineUnits.map((u) => [u.id, u]));

    for (const item of ingredients) {
      if (!item.unitId) continue;
      const stockUnit = chefIngredientMap.get(item.chefIngredientId).unit;
      const lineUnit = lineUnitMap.get(item.unitId);
      if (lineUnit.unitType !== stockUnit.unitType) {
        throw ApiError.badRequest(
          `Unit "${lineUnit.name}" cannot be used for an ingredient stocked in "${stockUnit.unitType}" units`,
          [],
          { code: 'DISH_INGREDIENT_UNIT_TYPE_MISMATCH', params: { chefIngredientId: item.chefIngredientId } }
        );
      }
    }
  }
}

async function replaceDishIngredients(tx, dishId, ingredients) {
  await tx.dishIngredient.deleteMany({ where: { dishId } });
  if (ingredients.length > 0) {
    await tx.dishIngredient.createMany({
      data: ingredients.map((i) => ({
        dishId,
        chefIngredientId: i.chefIngredientId,
        quantityUsed: i.quantityUsed,
        unitId: i.unitId || null,
      })),
    });
  }
}

// US-37: Create Dish (Recipe)
const createDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, description, imageUrl, tags, pricingType, ingredients } = req.body;

  await validateIngredientLines(chefId, ingredients);

  const dish = await prisma.$transaction(async (tx) => {
    const created = await tx.dish.create({
      data: {
        chefId,
        name,
        description,
        imageUrl,
        tags: tags || [],
        pricingType: pricingType || 'PER_TABLE',
      },
    });
    await replaceDishIngredients(tx, created.id, ingredients);
    return created;
  });

  await recalculateDishCost(dish.id);

  const fullDish = await prisma.dish.findUnique({ where: { id: dish.id } });
  return new ApiResponse(201, fullDish, 'Dish created successfully').send(res);
});

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
        include: { chefIngredient: { include: { unit: true } }, unit: true },
      },
    },
  });

  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const breakdown = dish.ingredients.map((di) => {
    const effectiveQuantity = getEffectiveQuantity(di);
    const subtotal = effectiveQuantity * di.chefIngredient.purchasePrice;
    return {
      ingredientName: di.chefIngredient.name,
      quantityUsed: di.quantityUsed,
      unit: (di.unit || di.chefIngredient.unit).abbreviation,
      unitPrice: di.chefIngredient.purchasePrice,
      subtotal,
      percentageOfTotal: dish.totalCost > 0 ? Number(((subtotal / dish.totalCost) * 100).toFixed(1)) : 0,
      ingredientIsArchived: !di.chefIngredient.isActive,
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
      pricingType: dish.pricingType,
      totalCost: dish.totalCost,
      isArchived: dish.isArchived,
      updatedAt: dish.updatedAt,
      costBreakdown: breakdown,
    },
    'Dish detail fetched successfully'
  ).send(res);
});

// US-39: Edit Dish / Recipe — Replace-All in a transaction + opt-in optimistic locking
const updateDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, description, imageUrl, tags, pricingType, ingredients, expectedUpdatedAt } = req.body;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  if (expectedUpdatedAt && new Date(expectedUpdatedAt).getTime() !== dish.updatedAt.getTime()) {
    throw ApiError.conflict(
      'This dish was changed by someone else since you loaded it. Please refresh and try again.',
      { code: 'DISH_EDIT_CONFLICT' }
    );
  }

  if (ingredients) {
    await validateIngredientLines(chefId, ingredients);
  }

  await prisma.$transaction(async (tx) => {
    if (ingredients) {
      await replaceDishIngredients(tx, id, ingredients);
    }
    await tx.dish.update({ where: { id }, data: { name, description, imageUrl, tags, pricingType } });
  });

  await recalculateDishCost(id);

  const updated = await prisma.dish.findUnique({ where: { id } });
  return new ApiResponse(200, updated, 'Dish updated successfully').send(res);
});

// US-40: Duplicate Dish (Clone Recipe)
const duplicateDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const original = await prisma.dish.findUnique({ where: { id }, include: { ingredients: true } });
  if (!original || original.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const clone = await prisma.$transaction(async (tx) => {
    const created = await tx.dish.create({
      data: {
        chefId,
        name: `${original.name} (Copy)`,
        description: original.description,
        imageUrl: original.imageUrl,
        tags: original.tags,
        pricingType: original.pricingType,
        totalCost: original.totalCost,
      },
    });

    if (original.ingredients.length > 0) {
      await tx.dishIngredient.createMany({
        data: original.ingredients.map((i) => ({
          dishId: created.id,
          chefIngredientId: i.chefIngredientId,
          quantityUsed: i.quantityUsed,
          unitId: i.unitId,
        })),
      });
    }

    return created;
  });

  return new ApiResponse(201, clone, 'Dish duplicated successfully').send(res);
});

// US-41 Scenario 1: Archive
const archiveDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const updated = await prisma.dish.update({ where: { id }, data: { isArchived: true } });
  return new ApiResponse(200, updated, 'Dish archived successfully').send(res);
});

// US-41 Scenario 2: Restore
const restoreDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const updated = await prisma.dish.update({ where: { id }, data: { isArchived: false } });
  return new ApiResponse(200, updated, 'Dish restored successfully').send(res);
});

// US-41 Scenario 3: Hard Delete — checks MenuSetDish AND EventDish, requires ?confirm=true
const deleteDish = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const confirmed = req.query.confirm === 'true';

  const dish = await prisma.dish.findUnique({ where: { id } });
  if (!dish || dish.chefId !== chefId) throw ApiError.notFound('Dish not found', { code: 'DISH_NOT_FOUND' });

  const [menuSetUsageCount, eventUsageCount] = await Promise.all([
    prisma.menuSetDish.count({ where: { dishId: id } }),
    prisma.eventDish.count({ where: { dishId: id } }),
  ]);
  const usageCount = menuSetUsageCount + eventUsageCount;

  if (usageCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: this dish is used in ${menuSetUsageCount} menu set(s) and ${eventUsageCount} event(s). Archive it instead.`,
      { code: 'DISH_IN_USE', params: { menuSetCount: menuSetUsageCount, eventCount: eventUsageCount } }
    );
  }

  if (!confirmed) {
    throw ApiError.badRequest(
      'This action is irreversible. Add ?confirm=true to permanently delete this dish.',
      [],
      { code: 'DELETE_CONFIRMATION_REQUIRED' }
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
  restoreDish,
  deleteDish,
};
