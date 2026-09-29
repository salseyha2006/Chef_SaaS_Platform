const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateDishesUsingChefIngredient } = require('../services/costing.service');

// US-31 + US-32: Browse Global Ingredient Presets (grouped by category), flagged with import state
const getIngredientPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [presets, imported] = await Promise.all([
    prisma.ingredient.findMany({
      include: { category: true, defaultUnit: true },
      orderBy: { name: 'asc' },
    }),
    prisma.chefIngredient.findMany({
      where: { chefId, sourcePresetId: { not: null } },
      select: { sourcePresetId: true },
    }),
  ]);

  const importedIds = new Set(imported.map((c) => c.sourcePresetId));

  const grouped = {};
  for (const ing of presets) {
    const categoryName = ing.category?.name || 'Uncategorized';
    if (!grouped[categoryName]) grouped[categoryName] = [];
    grouped[categoryName].push({
      id: ing.id,
      name: ing.name,
      defaultUnit: ing.defaultUnit ? { id: ing.defaultUnit.id, name: ing.defaultUnit.name } : null,
      isImported: importedIds.has(ing.id),
    });
  }

  const data = Object.entries(grouped).map(([category, items]) => ({ category, items }));

  return new ApiResponse(200, data, 'Ingredient presets fetched successfully').send(res);
});

// Ensures this chef has a ChefCategory copy matching the given global Category preset,
// creating one silently if needed. Returns null if the preset has no category.
async function ensureChefCategoryForPreset(chefId, globalCategoryId) {
  if (!globalCategoryId) return null;

  const existing = await prisma.chefCategory.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: globalCategoryId } },
  });
  if (existing) return existing.id;

  const preset = await prisma.category.findUnique({ where: { id: globalCategoryId } });
  if (!preset) return null;

  // Name already taken by an unrelated custom category — fall back to uncategorized instead of failing the import
  const nameClash = await prisma.chefCategory.findUnique({
    where: { chefId_name: { chefId, name: preset.name } },
  });
  if (nameClash) return nameClash.id;

  const created = await prisma.chefCategory.create({
    data: { chefId, name: preset.name, source: 'PRESET', sourcePresetId: preset.id },
  });
  return created.id;
}

// US-31 + US-33: Import (copy) selected presets into this chef's own ingredient list
const importIngredients = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { items } = req.body;

  const presetIds = items.map((i) => i.ingredientId);
  const presets = await prisma.ingredient.findMany({ where: { id: { in: presetIds } } });
  if (presets.length !== presetIds.length) {
    throw ApiError.badRequest('One or more ingredients do not exist', [], {
      code: 'INGREDIENTS_NOT_FOUND',
    });
  }
  const presetById = new Map(presets.map((p) => [p.id, p]));

  const unitIds = [...new Set(items.map((i) => i.unitId))];
  const ownedUnitsCount = await prisma.chefUnit.count({ where: { id: { in: unitIds }, chefId } });
  if (ownedUnitsCount !== unitIds.length) {
    throw ApiError.badRequest('One or more units are not in your list', [], { code: 'UNIT_NOT_IN_LIST' });
  }

  const created = [];
  for (const item of items) {
    const preset = presetById.get(item.ingredientId);

    const alreadyImported = await prisma.chefIngredient.findUnique({
      where: { chefId_sourcePresetId: { chefId, sourcePresetId: preset.id } },
    });
    if (alreadyImported) continue; // skip — already in this chef's stock

    const nameClash = await prisma.chefIngredient.findUnique({
      where: { chefId_name: { chefId, name: preset.name } },
    });
    if (nameClash) continue; // a custom ingredient with the same name already exists — skip

    const categoryId = await ensureChefCategoryForPreset(chefId, preset.categoryId);

    const chefIngredient = await prisma.chefIngredient.create({
      data: {
        chefId,
        name: preset.name,
        categoryId,
        purchasePrice: item.purchasePrice,
        unitId: item.unitId,
        source: 'PRESET',
        sourcePresetId: preset.id,
      },
    });
    created.push(chefIngredient);
  }

  return new ApiResponse(
    201,
    created,
    `${created.length} ingredient(s) imported to your stock successfully`
  ).send(res);
});

// US-11 Scenario 2: Create a brand-new custom ingredient (not copied from any preset)
const createIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, purchasePrice, unitId, categoryId } = req.body;

  const existing = await prisma.chefIngredient.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) {
    throw ApiError.conflict('You already have an ingredient with this name', {
      code: 'INGREDIENT_EXISTS',
    });
  }

  const unit = await prisma.chefUnit.findUnique({ where: { id: unitId } });
  if (!unit || unit.chefId !== chefId) {
    throw ApiError.badRequest('Unit not found in your list', [], { code: 'UNIT_NOT_IN_LIST' });
  }

  if (categoryId) {
    const category = await prisma.chefCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.chefId !== chefId) {
      throw ApiError.badRequest('Category not found in your list', [], { code: 'CATEGORY_NOT_IN_LIST' });
    }
  }

  const chefIngredient = await prisma.chefIngredient.create({
    data: { chefId, name, purchasePrice, unitId, categoryId, source: 'CUSTOM' },
  });

  return new ApiResponse(201, chefIngredient, 'Ingredient created successfully').send(res);
});

// US-34: Manage My Ingredient Inventory (list, filter by category)
const getMyIngredients = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { categoryId } = req.query;

  const myIngredients = await prisma.chefIngredient.findMany({
    where: { chefId, isActive: true, categoryId: categoryId || undefined },
    include: { category: true, unit: true },
    orderBy: { name: 'asc' },
  });

  const data = myIngredients.map((ci) => ({
    id: ci.id,
    name: ci.name,
    category: ci.category?.name || 'Uncategorized',
    purchasePrice: ci.purchasePrice,
    unit: { id: ci.unit.id, name: ci.unit.name, abbreviation: ci.unit.abbreviation },
    source: ci.source,
  }));

  return new ApiResponse(200, data, 'My ingredient inventory fetched successfully').send(res);
});

// US-33 + US-11 Scenario 3: Full edit (name/price/unit/category) — Copy-on-Write, never touches the preset
const updateMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, purchasePrice, unitId, categoryId } = req.body;

  const existing = await prisma.chefIngredient.findUnique({ where: { id } });
  if (!existing || existing.chefId !== chefId) {
    throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });
  }

  if (name && name !== existing.name) {
    const nameClash = await prisma.chefIngredient.findUnique({ where: { chefId_name: { chefId, name } } });
    if (nameClash) {
      throw ApiError.conflict('You already have an ingredient with this name', {
        code: 'INGREDIENT_EXISTS',
      });
    }
  }

  if (unitId) {
    const unit = await prisma.chefUnit.findUnique({ where: { id: unitId } });
    if (!unit || unit.chefId !== chefId) {
      throw ApiError.badRequest('Unit not found in your list', [], { code: 'UNIT_NOT_IN_LIST' });
    }
  }

  if (categoryId) {
    const category = await prisma.chefCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.chefId !== chefId) {
      throw ApiError.badRequest('Category not found in your list', [], { code: 'CATEGORY_NOT_IN_LIST' });
    }
  }

  const updated = await prisma.chefIngredient.update({
    where: { id },
    data: { name, purchasePrice, unitId, categoryId },
  });

  if (purchasePrice !== undefined) {
    await recalculateDishesUsingChefIngredient(existing.id); // US-42
  }

  return new ApiResponse(200, updated, 'Ingredient stock updated successfully').send(res);
});

// US-35: Hide/Archive Ingredient via Uncheck (soft delete)
const archiveMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const existing = await prisma.chefIngredient.findUnique({ where: { id } });
  if (!existing || existing.chefId !== chefId) {
    throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });
  }

  const updated = await prisma.chefIngredient.update({ where: { id }, data: { isActive: false } });

  return new ApiResponse(200, updated, 'Ingredient archived from your stock').send(res);
});

// US-36: Permanently Delete Ingredient (Hard Delete) — guarded against dishes using it
const deleteMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const existing = await prisma.chefIngredient.findUnique({ where: { id } });
  if (!existing || existing.chefId !== chefId) {
    throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });
  }

  const usageCount = await prisma.dishIngredient.count({ where: { chefIngredientId: existing.id } });
  if (usageCount > 0) {
    throw ApiError.conflict(
      `Cannot delete: this ingredient is used in ${usageCount} dish(es). Archive it instead.`,
      { code: 'INGREDIENT_IN_USE', params: { count: usageCount } }
    );
  }

  await prisma.chefIngredient.delete({ where: { id } });

  return new ApiResponse(200, null, 'Ingredient permanently deleted from your stock').send(res);
});

module.exports = {
  getIngredientPresets,
  importIngredients,
  createIngredient,
  getMyIngredients,
  updateMyIngredient,
  archiveMyIngredient,
  deleteMyIngredient,
};