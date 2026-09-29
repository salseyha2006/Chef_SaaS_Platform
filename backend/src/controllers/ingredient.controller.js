const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateDishesUsingChefIngredient } = require('../services/costing.service');

// US-31 + US-32: Browse Global Ingredient Presets (grouped by category), synced checkbox state
const getIngredientPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const ingredients = await prisma.ingredient.findMany({
    include: {
      category: true,
      defaultUnit: true,
      chefIngredients: { where: { chefId } },
    },
    orderBy: { name: 'asc' },
  });

  const grouped = {};
  for (const ing of ingredients) {
    const categoryName = ing.category?.name || 'Uncategorized';
    if (!grouped[categoryName]) grouped[categoryName] = [];

    grouped[categoryName].push({
      id: ing.id,
      name: ing.name,
      defaultUnit: ing.defaultUnit ? { id: ing.defaultUnit.id, name: ing.defaultUnit.name } : null,
      isImported: ing.chefIngredients.length > 0 && ing.chefIngredients[0].isActive,
    });
  }

  const data = Object.entries(grouped).map(([category, items]) => ({ category, items }));

  return new ApiResponse(200, data, 'Ingredient presets fetched successfully').send(res);
});

// US-31 + US-33: Import selected ingredients with custom pricing & unit (bulk)
const importIngredients = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { items } = req.body;

  const ingredientIds = items.map((i) => i.ingredientId);
  const foundCount = await prisma.ingredient.count({ where: { id: { in: ingredientIds } } });
  if (foundCount !== ingredientIds.length) {
    throw ApiError.badRequest('One or more ingredients do not exist', [], { code: 'INGREDIENTS_NOT_FOUND' });
  }

  const results = await prisma.$transaction(
    items.map((item) =>
      prisma.chefIngredient.upsert({
        where: { chefId_ingredientId: { chefId, ingredientId: item.ingredientId } },
        update: { purchasePrice: item.purchasePrice, unitId: item.unitId, isActive: true },
        create: {
          chefId,
          ingredientId: item.ingredientId,
          purchasePrice: item.purchasePrice,
          unitId: item.unitId,
          isActive: true,
        },
      })
    )
  );

  return new ApiResponse(201, results, 'Ingredients imported to your stock successfully').send(res);
});

// US-34: Manage My Ingredient Inventory (list, filter by category)
const getMyIngredients = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { categoryId } = req.query;

  const myIngredients = await prisma.chefIngredient.findMany({
    where: {
      chefId,
      isActive: true,
      ingredient: categoryId ? { categoryId } : undefined,
    },
    include: {
      ingredient: { include: { category: true } },
      unit: true,
    },
    orderBy: { ingredient: { name: 'asc' } },
  });

  const data = myIngredients.map((ci) => ({
    chefIngredientId: ci.id,
    ingredientId: ci.ingredient.id,
    name: ci.ingredient.name,
    category: ci.ingredient.category?.name || 'Uncategorized',
    purchasePrice: ci.purchasePrice,
    unit: { id: ci.unit.id, name: ci.unit.name, abbreviation: ci.unit.abbreviation },
  }));

  return new ApiResponse(200, data, 'My ingredient inventory fetched successfully').send(res);
});

// US-33: Update custom pricing/unit for a single stock item
const updateMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { ingredientId } = req.params;
  const { purchasePrice, unitId } = req.body;

  const existing = await prisma.chefIngredient.findUnique({
    where: { chefId_ingredientId: { chefId, ingredientId } },
  });
  if (!existing) throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });

  const updated = await prisma.chefIngredient.update({
    where: { chefId_ingredientId: { chefId, ingredientId } },
    data: { purchasePrice, unitId },
  });

  await recalculateDishesUsingChefIngredient(existing.id); // US-42

  return new ApiResponse(200, updated, 'Ingredient stock updated successfully').send(res);
});

// US-35: Hide/Archive Ingredient via Uncheck (soft delete)
const archiveMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { ingredientId } = req.params;

  const existing = await prisma.chefIngredient.findUnique({
    where: { chefId_ingredientId: { chefId, ingredientId } },
  });
  if (!existing) throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });

  const updated = await prisma.chefIngredient.update({
    where: { chefId_ingredientId: { chefId, ingredientId } },
    data: { isActive: false },
  });

  return new ApiResponse(200, updated, 'Ingredient archived from your stock').send(res);
});

// US-36: Permanently Delete Ingredient (Hard Delete) — guarded against dishes using it
const deleteMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { ingredientId } = req.params;

  const existing = await prisma.chefIngredient.findUnique({
    where: { chefId_ingredientId: { chefId, ingredientId } },
  });
  if (!existing) throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });

  const usageCount = await prisma.dishIngredient.count({
    where: { chefIngredientId: existing.id },
  });
  if (usageCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: this ingredient is used in ${usageCount} dish(es). Archive it instead.`,
      { code: 'INGREDIENT_IN_USE', params: { count: usageCount } }
    );
  }

  await prisma.chefIngredient.delete({ where: { chefId_ingredientId: { chefId, ingredientId } } });

  return new ApiResponse(200, null, 'Ingredient permanently deleted from your stock').send(res);
});

module.exports = {
  getIngredientPresets,
  importIngredients,
  getMyIngredients,
  updateMyIngredient,
  archiveMyIngredient,
  deleteMyIngredient,
};
