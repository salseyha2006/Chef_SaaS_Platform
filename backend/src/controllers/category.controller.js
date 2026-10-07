const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// US-31: Browse the global Category/Sub-category catalog as a tree, flagged with import state
const getCategoryPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [presets, imported] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.chefCategory.findMany({
      where: { chefId, sourcePresetId: { not: null }, isActive: true },
      select: { sourcePresetId: true },
    }),
  ]);

  const importedIds = new Set(imported.map((c) => c.sourcePresetId));

  const byParent = {};
  for (const p of presets) {
    const key = p.parentId || 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(p);
  }

  function buildTree(parentKey) {
    return (byParent[parentKey] || []).map((p) => ({
      id: p.id,
      name: p.name,
      isImported: importedIds.has(p.id),
      children: buildTree(p.id),
    }));
  }

  return new ApiResponse(200, buildTree('root'), 'Category presets fetched successfully').send(res);
});

const getMyCategories = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const categories = await prisma.chefCategory.findMany({
    where: { chefId, isActive: true },
    orderBy: { name: 'asc' },
  });

  const byParent = {};
  for (const c of categories) {
    const key = c.parentId || 'root';
    if (!byParent[key]) byParent[key] = [];
    byParent[key].push(c);
  }

  function buildTree(parentKey) {
    return (byParent[parentKey] || []).map((c) => ({
      id: c.id,
      name: c.name,
      source: c.source,
      children: buildTree(c.id),
    }));
  }

  return new ApiResponse(200, buildTree('root'), 'Your categories fetched successfully').send(res);
});

const createCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, parentId } = req.body;

  const existing = await prisma.chefCategory.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) {
    throw ApiError.conflict('You already have a category with this name', { code: 'CATEGORY_EXISTS' });
  }

  if (parentId) {
    const parent = await prisma.chefCategory.findUnique({ where: { id: parentId } });
    if (!parent || parent.chefId !== chefId) {
      throw ApiError.badRequest('Parent category not found in your list', [], { code: 'CATEGORY_NOT_IN_LIST' });
    }
  }

  const category = await prisma.chefCategory.create({
    data: { chefId, name, parentId: parentId || null, source: 'CUSTOM' },
  });

  return new ApiResponse(201, category, 'Category created successfully').send(res);
});

// US-31 Technical Note: importing a sub-category auto-imports its parent chain first
async function importCategoryChain(tx, chefId, presetId) {
  if (!presetId) return null;

  const preset = await tx.category.findUnique({ where: { id: presetId } });
  if (!preset) return null;

  const parentChefCategoryId = preset.parentId
    ? await importCategoryChain(tx, chefId, preset.parentId)
    : null;

  const existing = await tx.chefCategory.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: presetId } },
  });

  if (existing) {
    if (existing.isActive) return existing.id;

    const nameClash = await tx.chefCategory.findFirst({
      where: { chefId, name: preset.name, NOT: { id: existing.id } },
    });
    if (nameClash) return nameClash.id;

    const reactivated = await tx.chefCategory.update({
      where: { id: existing.id },
      data: { isActive: true, name: preset.name, parentId: parentChefCategoryId },
    });
    return reactivated.id;
  }

  const nameClash = await tx.chefCategory.findUnique({
    where: { chefId_name: { chefId, name: preset.name } },
  });
  if (nameClash) return nameClash.id;

  const created = await tx.chefCategory.create({
    data: {
      chefId,
      name: preset.name,
      parentId: parentChefCategoryId,
      source: 'PRESET',
      sourcePresetId: preset.id,
    },
  });
  return created.id;
}

// US-29 Scenario 3 + US-31: import a preset Category/Sub-category, auto-importing its parent chain
const importCategoryPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { presetId } = req.params;

  const preset = await prisma.category.findUnique({ where: { id: presetId } });
  if (!preset) throw ApiError.notFound('Category preset not found', { code: 'CATEGORY_NOT_FOUND' });

  const existingActive = await prisma.chefCategory.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: presetId } },
  });
  if (existingActive && existingActive.isActive) {
    throw ApiError.conflict('This category preset has already been imported', {
      code: 'CATEGORY_ALREADY_IMPORTED',
    });
  }

  const resultId = await prisma.$transaction((tx) => importCategoryChain(tx, chefId, presetId));
  const category = await prisma.chefCategory.findUnique({ where: { id: resultId } });

  return new ApiResponse(201, category, 'Category imported to your list successfully').send(res);
});

async function wouldCreateCycle(chefId, categoryId, candidateParentId) {
  let current = candidateParentId;
  while (current) {
    if (current === categoryId) return true;
    const node = await prisma.chefCategory.findUnique({
      where: { id: current },
      select: { parentId: true, chefId: true },
    });
    if (!node || node.chefId !== chefId) return false;
    current = node.parentId;
  }
  return false;
}

const updateCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, parentId } = req.body;

  const category = await prisma.chefCategory.findUnique({ where: { id } });
  if (!category || category.chefId !== chefId) {
    throw ApiError.notFound('Category not found', { code: 'CATEGORY_NOT_FOUND' });
  }

  if (name && name !== category.name) {
    const nameClash = await prisma.chefCategory.findUnique({ where: { chefId_name: { chefId, name } } });
    if (nameClash) {
      throw ApiError.conflict('You already have a category with this name', { code: 'CATEGORY_EXISTS' });
    }
  }

  if (parentId !== undefined && parentId !== null) {
    const parent = await prisma.chefCategory.findUnique({ where: { id: parentId } });
    if (!parent || parent.chefId !== chefId) {
      throw ApiError.badRequest('Parent category not found in your list', [], { code: 'CATEGORY_NOT_IN_LIST' });
    }
    const cycle = await wouldCreateCycle(chefId, id, parentId);
    if (cycle) {
      throw ApiError.badRequest('Cannot move a category under itself or one of its own sub-categories', [], {
        code: 'CATEGORY_CYCLE',
      });
    }
  }

  const updated = await prisma.chefCategory.update({
    where: { id },
    data: { name, parentId },
  });

  return new ApiResponse(200, updated, 'Category updated successfully').send(res);
});

// US-30 Scenario 3: warn (or cascade-archive sub-categories) before archiving a category in use
const archiveCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const force = req.query.force === 'true';

  const category = await prisma.chefCategory.findUnique({ where: { id } });
  if (!category || category.chefId !== chefId) {
    throw ApiError.notFound('Category not found', { code: 'CATEGORY_NOT_FOUND' });
  }

  const [activeChildrenCount, usageCount] = await Promise.all([
    prisma.chefCategory.count({ where: { parentId: id, isActive: true } }),
    prisma.chefIngredient.count({ where: { categoryId: id, isActive: true } }),
  ]);

  if (!force && (activeChildrenCount > 0 || usageCount > 0)) {
    throw ApiError.conflict(
      `This category has ${activeChildrenCount} active sub-categor${activeChildrenCount === 1 ? 'y' : 'ies'} and is used by ${usageCount} ingredient(s). Add ?force=true to archive anyway.`,
      {
        code: 'CATEGORY_IN_USE_CONFIRM_REQUIRED',
        params: { subCategoryCount: activeChildrenCount, ingredientCount: usageCount },
      }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (force && activeChildrenCount > 0) {
      await tx.chefCategory.updateMany({ where: { parentId: id, isActive: true }, data: { isActive: false } });
    }
    return tx.chefCategory.update({ where: { id }, data: { isActive: false } });
  });

  return new ApiResponse(200, updated, 'Category archived from your list').send(res);
});

module.exports = {
  getCategoryPresets,
  getMyCategories,
  createCategory,
  importCategoryPreset,
  updateCategory,
  archiveCategory,
};
