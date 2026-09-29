const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// US-26: Browse Units (Preset) with per-chef selected state
const getUnits = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const units = await prisma.unit.findMany({
    include: {
      chefPreferences: { where: { chefId } },
    },
    orderBy: { name: 'asc' },
  });

  const data = units.map((u) => ({
    id: u.id,
    name: u.name,
    abbreviation: u.abbreviation,
    unitType: u.unitType,
    conversionRate: u.conversionRate,
    isSelected: u.chefPreferences.length > 0 && u.chefPreferences[0].isActive,
  }));

  return new ApiResponse(200, data, 'Units fetched successfully').send(res);
});

// US-26 + US-27: Create Unit inline (conversionRate mandatory) and auto-select it
const createUnit = asyncHandler(async (req, res) => {
  const { name, abbreviation, unitType, conversionRate } = req.body;
  const chefId = req.chef.id;

  const existing = await prisma.unit.findUnique({ where: { name } });
  if (existing) throw ApiError.conflict('This unit already exists', { code: 'UNIT_EXISTS' });

  const unit = await prisma.unit.create({
    data: { name, abbreviation, unitType, conversionRate, createdByChefId: chefId },
  });

  await prisma.chefUnitPreference.create({
    data: { chefId, unitId: unit.id, isActive: true },
  });

  return new ApiResponse(201, unit, 'Unit created and added to your list').send(res);
});

// US-26 + US-29: Select an existing preset Unit (prevents duplicate via upsert)
const selectUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { unitId } = req.params;

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw ApiError.notFound('Unit not found', { code: 'UNIT_NOT_FOUND' });

  const preference = await prisma.chefUnitPreference.upsert({
    where: { chefId_unitId: { chefId, unitId } },
    update: { isActive: true },
    create: { chefId, unitId, isActive: true },
  });

  return new ApiResponse(200, preference, 'Unit added to your list').send(res);
});

// US-30: Uncheck (hide) a Unit from the chef's own list — soft delete
const deselectUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { unitId } = req.params;

  const preference = await prisma.chefUnitPreference.findUnique({
    where: { chefId_unitId: { chefId, unitId } },
  });
  if (!preference) throw ApiError.notFound('This unit is not in your list', { code: 'UNIT_NOT_IN_LIST' });

  const updated = await prisma.chefUnitPreference.update({
    where: { chefId_unitId: { chefId, unitId } },
    data: { isActive: false },
  });

  return new ApiResponse(200, updated, 'Unit hidden from your list').send(res);
});

module.exports = { getUnits, createUnit, selectUnit, deselectUnit };
