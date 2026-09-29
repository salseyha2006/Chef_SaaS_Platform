const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// US-28: Browse Categories (Preset) with per-chef selected state
const getCategories = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const categories = await prisma.category.findMany({
    include: { chefPreferences: { where: { chefId } } },
    orderBy: { name: 'asc' },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    isSelected: c.chefPreferences.length > 0 && c.chefPreferences[0].isActive,
  }));

  return new ApiResponse(200, data, 'Categories fetched successfully').send(res);
});

// US-28: Create Category inline and auto-select it
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const chefId = req.chef.id;

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw ApiError.conflict('This category already exists', { code: 'CATEGORY_EXISTS' });

  const category = await prisma.category.create({
    data: { name, createdByChefId: chefId },
  });

  await prisma.chefCategoryPreference.create({
    data: { chefId, categoryId: category.id, isActive: true },
  });

  return new ApiResponse(201, category, 'Category created and added to your list').send(res);
});

// US-29: Select an existing preset Category
const selectCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { categoryId } = req.params;

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw ApiError.notFound('Category not found', { code: 'CATEGORY_NOT_FOUND' });

  const preference = await prisma.chefCategoryPreference.upsert({
    where: { chefId_categoryId: { chefId, categoryId } },
    update: { isActive: true },
    create: { chefId, categoryId, isActive: true },
  });

  return new ApiResponse(200, preference, 'Category added to your list').send(res);
});

// US-30: Uncheck (hide) a Category from the chef's own list
const deselectCategory = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { categoryId } = req.params;

  const preference = await prisma.chefCategoryPreference.findUnique({
    where: { chefId_categoryId: { chefId, categoryId } },
  });
  if (!preference) throw ApiError.notFound('This category is not in your list', { code: 'CATEGORY_NOT_IN_LIST' });

  const updated = await prisma.chefCategoryPreference.update({
    where: { chefId_categoryId: { chefId, categoryId } },
    data: { isActive: false },
  });

  return new ApiResponse(200, updated, 'Category hidden from your list').send(res);
});

module.exports = { getCategories, createCategory, selectCategory, deselectCategory };
