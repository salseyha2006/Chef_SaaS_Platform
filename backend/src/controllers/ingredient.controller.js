const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { recalculateDishesUsingChefIngredient } = require('../services/costing.service');

// US-31: Browse Global Ingredient Presets as a Category → Sub-category → Ingredient tree
const getIngredientPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [categories, ingredients, imported] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.ingredient.findMany({
      include: { defaultUnit: true },
      orderBy: { name: 'asc' },
    }),
    prisma.chefIngredient.findMany({
      where: { chefId, sourcePresetId: { not: null }, isActive: true },
      select: { sourcePresetId: true },
    }),
  ]);

  const importedIds = new Set(imported.map((c) => c.sourcePresetId));

  const itemsByCategory = {};
  const uncategorizedItems = [];

  for (const ing of ingredients) {
    const item = {
      id: ing.id,
      name: ing.name,
      defaultUnit: ing.defaultUnit ? { id: ing.defaultUnit.id, name: ing.defaultUnit.name } : null,
      isImported: importedIds.has(ing.id),
    };

    if (ing.categoryId) {
      if (!itemsByCategory[ing.categoryId]) itemsByCategory[ing.categoryId] = [];
      itemsByCategory[ing.categoryId].push(item);
    } else {
      uncategorizedItems.push(item);
    }
  }

  const categoriesByParent = {};
  for (const c of categories) {
    const key = c.parentId || 'root';
    if (!categoriesByParent[key]) categoriesByParent[key] = [];
    categoriesByParent[key].push(c);
  }

  function buildCategoryNode(category) {
    return {
      id: category.id,
      category: category.name,
      items: itemsByCategory[category.id] || [],
      children: (categoriesByParent[category.id] || []).map(buildCategoryNode),
    };
  }

  const tree = (categoriesByParent.root || []).map(buildCategoryNode);

  if (uncategorizedItems.length > 0) {
    tree.push({ id: null, category: 'Uncategorized', items: uncategorizedItems, children: [] });
  }

  return new ApiResponse(200, tree, 'Ingredient presets fetched successfully').send(res);
});

async function ensureChefCategoryForPreset(tx, chefId, globalCategoryId) {
  if (!globalCategoryId) return null;

  const existing = await tx.chefCategory.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: globalCategoryId } },
  });
  if (existing) return existing.id;

  const preset = await tx.category.findUnique({ where: { id: globalCategoryId } });
  if (!preset) return null;

  const nameClash = await tx.chefCategory.findUnique({
    where: { chefId_name: { chefId, name: preset.name } },
  });
  if (nameClash) return nameClash.id;

  const created = await tx.chefCategory.create({
    data: { chefId, name: preset.name, source: 'PRESET', sourcePresetId: preset.id },
  });
  return created.id;
}

// US-31 + US-33: Import (copy) selected presets into this chef's own ingredient list.
// US-33 Technical Note: all-or-nothing — wrapped in a single $transaction.
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

  const results = await prisma.$transaction(async (tx) => {
    const created = [];

    for (const item of items) {
      const preset = presetById.get(item.ingredientId);

      const existing = await tx.chefIngredient.findUnique({
        where: { chefId_sourcePresetId: { chefId, sourcePresetId: preset.id } },
      });

      if (existing) {
        if (existing.isActive) continue;

        const nameClash = await tx.chefIngredient.findFirst({
          where: { chefId, name: preset.name, NOT: { id: existing.id } },
        });
        if (nameClash) continue;

        const reactivated = await tx.chefIngredient.update({
          where: { id: existing.id },
          data: { isActive: true, name: preset.name, purchasePrice: item.purchasePrice, unitId: item.unitId },
        });
        created.push(reactivated);
        continue;
      }

      const nameClash = await tx.chefIngredient.findUnique({
        where: { chefId_name: { chefId, name: preset.name } },
      });
      if (nameClash) continue;

      const categoryId = await ensureChefCategoryForPreset(tx, chefId, preset.categoryId);

      const chefIngredient = await tx.chefIngredient.create({
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

    return created;
  });

  return new ApiResponse(
    201,
    results,
    `${results.length} ingredient(s) imported to your stock successfully`
  ).send(res);
});

// US-11 Scenario 2: brand-new custom ingredient, not copied from any preset
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
    updatedAt: ci.updatedAt,
  }));

  return new ApiResponse(200, data, 'My ingredient inventory fetched successfully').send(res);
});

// US-33 + US-11 Scenario 3: Full edit — Copy-on-Write, never touches the preset
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

// US-35 Scenario 3: same ?force=true pattern as Unit/Category
const archiveMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const force = req.query.force === 'true';

  const existing = await prisma.chefIngredient.findUnique({ where: { id } });
  if (!existing || existing.chefId !== chefId) {
    throw ApiError.notFound('This ingredient is not in your stock', { code: 'STOCK_INGREDIENT_NOT_FOUND' });
  }

  if (!force) {
    const usageCount = await prisma.dishIngredient.count({ where: { chefIngredientId: id } });
    if (usageCount > 0) {
      throw ApiError.conflict(
        `This ingredient is used by ${usageCount} dish(es). Add ?force=true to archive anyway.`,
        { code: 'INGREDIENT_IN_USE_CONFIRM_REQUIRED', params: { count: usageCount } }
      );
    }
  }

  const updated = await prisma.chefIngredient.update({ where: { id }, data: { isActive: false } });

  return new ApiResponse(200, updated, 'Ingredient archived from your stock').send(res);
});

// US-36: Permanently Delete Ingredient (Hard Delete) — guarded + requires ?confirm=true
const deleteMyIngredient = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const confirmed = req.query.confirm === 'true';

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

  if (!confirmed) {
    throw ApiError.badRequest(
      'This action is irreversible. Add ?confirm=true to permanently delete this ingredient.',
      [],
      { code: 'DELETE_CONFIRMATION_REQUIRED' }
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
