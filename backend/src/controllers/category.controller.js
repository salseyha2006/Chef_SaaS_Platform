const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCategoryPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [presets, imported] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.chefCategory.findMany({
      where: { chefId, sourcePresetId: { not: null } },
      select: { sourcePresetId: true },
    }),
  ]);

  const importedIds = new Set(imported.map((c) => c.sourcePresetId));

  const data = presets.map((p) => ({
    id: p.id,
    name: p.name,
    isImported: importedIds.has(p.id),
  }));

  return new ApiResponse(200, data, 'Category presets fetched successfully').send(res);
});

const getMyCategories = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const categories = await prisma.chefCategory.findMany({
    where: { chefId, isActive: true },
    orderBy: { name: 'asc' },
  });

  return new ApiResponse(200, categories, 'Your categories fetched successfully').send(res);
});

const createCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name } = req.body;

  const existing = await prisma.chefCategory.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) {
    throw ApiError.conflict('You already have a category with this name', { code: 'CATEGORY_EXISTS' });
  }

  const category = await prisma.chefCategory.create({ data: { chefId, name, source: 'CUSTOM' } });

  return new ApiResponse(201, category, 'Category created successfully').send(res);
});

const importCategoryPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { presetId } = req.params;

  const preset = await prisma.category.findUnique({ where: { id: presetId } });
  if (!preset) throw ApiError.notFound('Category preset not found', { code: 'CATEGORY_NOT_FOUND' });

  const existing = await prisma.chefCategory.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: presetId } },
  });
  if (existing) {
    throw ApiError.conflict('This category preset has already been imported', {
      code: 'CATEGORY_ALREADY_IMPORTED',
    });
  }

  const category = await prisma.chefCategory.create({
    data: { chefId, name: preset.name, source: 'PRESET', sourcePresetId: preset.id },
  });

  return new ApiResponse(201, category, 'Category imported to your list successfully').send(res);
});

// US-11 Scenario 3
const updateCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name } = req.body;

  const category = await prisma.chefCategory.findUnique({ where: { id } });
  if (!category || category.chefId !== chefId) {
    throw ApiError.notFound('Category not found', { code: 'CATEGORY_NOT_FOUND' });
  }

  if (name !== category.name) {
    const nameClash = await prisma.chefCategory.findUnique({ where: { chefId_name: { chefId, name } } });
    if (nameClash) {
      throw ApiError.conflict('You already have a category with this name', { code: 'CATEGORY_EXISTS' });
    }
  }

  const updated = await prisma.chefCategory.update({ where: { id }, data: { name } });

  return new ApiResponse(200, updated, 'Category updated successfully').send(res);
});

const archiveCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const category = await prisma.chefCategory.findUnique({ where: { id } });
  if (!category || category.chefId !== chefId) {
    throw ApiError.notFound('Category not found', { code: 'CATEGORY_NOT_FOUND' });
  }

  const updated = await prisma.chefCategory.update({ where: { id }, data: { isActive: false } });

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