const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { buildShoppingList } = require('../services/shoppingList.service');

const createVendorPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, chefIngredientIds } = req.body;

  const existing = await prisma.vendorPreset.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) {
    throw ApiError.conflict('A vendor preset with this name already exists', {
      code: 'VENDOR_PRESET_EXISTS',
    });
  }

  const ownedCount = await prisma.chefIngredient.count({
    where: { id: { in: chefIngredientIds }, chefId },
  });
  if (ownedCount !== chefIngredientIds.length) {
    throw ApiError.badRequest('One or more ingredients are not in your stock', [], {
      code: 'STOCK_INGREDIENT_NOT_FOUND',
    });
  }

  const preset = await prisma.vendorPreset.create({ data: { chefId, name } });

  await prisma.vendorPresetIngredient.createMany({
    data: chefIngredientIds.map((chefIngredientId) => ({ vendorPresetId: preset.id, chefIngredientId })),
  });

  return new ApiResponse(201, preset, 'Vendor preset created successfully').send(res);
});

const getVendorPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const presets = await prisma.vendorPreset.findMany({
    where: { chefId },
    include: { ingredients: { include: { chefIngredient: true } } },
    orderBy: { name: 'asc' },
  });

  const data = presets.map((p) => ({
    id: p.id,
    name: p.name,
    ingredients: p.ingredients.map((vi) => ({ id: vi.chefIngredient.id, name: vi.chefIngredient.name })),
  }));

  return new ApiResponse(200, data, 'Vendor presets fetched successfully').send(res);
});

const updateVendorPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, chefIngredientIds } = req.body;

  const preset = await prisma.vendorPreset.findUnique({ where: { id } });
  if (!preset || preset.chefId !== chefId) {
    throw ApiError.notFound('Vendor preset not found', { code: 'VENDOR_PRESET_NOT_FOUND' });
  }

  if (name) await prisma.vendorPreset.update({ where: { id }, data: { name } });

  if (chefIngredientIds) {
    const ownedCount = await prisma.chefIngredient.count({
      where: { id: { in: chefIngredientIds }, chefId },
    });
    if (ownedCount !== chefIngredientIds.length) {
      throw ApiError.badRequest('One or more ingredients are not in your stock', [], {
        code: 'STOCK_INGREDIENT_NOT_FOUND',
      });
    }
    await prisma.vendorPresetIngredient.deleteMany({ where: { vendorPresetId: id } });
    await prisma.vendorPresetIngredient.createMany({
      data: chefIngredientIds.map((chefIngredientId) => ({ vendorPresetId: id, chefIngredientId })),
    });
  }

  return new ApiResponse(200, null, 'Vendor preset updated successfully').send(res);
});

const deleteVendorPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const preset = await prisma.vendorPreset.findUnique({ where: { id } });
  if (!preset || preset.chefId !== chefId) {
    throw ApiError.notFound('Vendor preset not found', { code: 'VENDOR_PRESET_NOT_FOUND' });
  }

  await prisma.vendorPreset.delete({ where: { id } });
  return new ApiResponse(200, null, 'Vendor preset deleted successfully').send(res);
});

const getShoppingListByVendor = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { eventId, vendorPresetId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.chefId !== chefId) throw ApiError.notFound('Event not found', { code: 'EVENT_NOT_FOUND' });

  const preset = await prisma.vendorPreset.findUnique({
    where: { id: vendorPresetId },
    include: { ingredients: true },
  });
  if (!preset || preset.chefId !== chefId) {
    throw ApiError.notFound('Vendor preset not found', { code: 'VENDOR_PRESET_NOT_FOUND' });
  }

  const allowedIds = new Set(preset.ingredients.map((vi) => vi.chefIngredientId));

  const result = await buildShoppingList(eventId);
  const filteredItems = result.items.filter((i) => allowedIds.has(i.chefIngredientId));

  return new ApiResponse(
    200,
    { eventId, vendorPresetName: preset.name, items: filteredItems },
    'Shopping list filtered by vendor preset'
  ).send(res);
});

module.exports = {
  createVendorPreset,
  getVendorPresets,
  updateVendorPreset,
  deleteVendorPreset,
  getShoppingListByVendor,
};
