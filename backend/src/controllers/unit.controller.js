const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getUnitPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [presets, imported] = await Promise.all([
    prisma.unit.findMany({ orderBy: { name: 'asc' } }),
    prisma.chefUnit.findMany({
      where: { chefId, sourcePresetId: { not: null }, isActive: true },
      select: { sourcePresetId: true },
    }),
  ]);

  const importedIds = new Set(imported.map((c) => c.sourcePresetId));

  const data = presets.map((p) => ({
    id: p.id,
    name: p.name,
    abbreviation: p.abbreviation,
    unitType: p.unitType,
    conversionRate: p.conversionRate,
    isImported: importedIds.has(p.id),
  }));

  return new ApiResponse(200, data, 'Unit presets fetched successfully').send(res);
});

const getMyUnits = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const units = await prisma.chefUnit.findMany({
    where: { chefId, isActive: true },
    orderBy: { name: 'asc' },
  });
  return new ApiResponse(200, units, 'Your units fetched successfully').send(res);
});

const createUnit = asyncHandler(async (req, res) => {
  const { name, abbreviation, unitType, conversionRate } = req.body;
  const chefId = req.chef.id;

  const existing = await prisma.chefUnit.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) throw ApiError.conflict('You already have a unit with this name', { code: 'UNIT_EXISTS' });

  const unit = await prisma.chefUnit.create({
    data: { chefId, name, abbreviation, unitType, conversionRate, source: 'CUSTOM' },
  });

  return new ApiResponse(201, unit, 'Unit created successfully').send(res);
});

// US-29 Scenario 3: reactivate an archived import instead of failing on the unique constraint
const importUnitPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { presetId } = req.params;

  const preset = await prisma.unit.findUnique({ where: { id: presetId } });
  if (!preset) throw ApiError.notFound('Unit preset not found', { code: 'UNIT_NOT_FOUND' });

  const existing = await prisma.chefUnit.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: presetId } },
  });

  if (existing) {
    if (existing.isActive) {
      throw ApiError.conflict('This unit preset has already been imported', {
        code: 'UNIT_ALREADY_IMPORTED',
      });
    }

    const nameClash = await prisma.chefUnit.findFirst({
      where: { chefId, name: preset.name, NOT: { id: existing.id } },
    });
    if (nameClash) {
      throw ApiError.conflict(
        "You already have a different unit using this preset's name — rename or remove it before re-importing",
        { code: 'UNIT_EXISTS' }
      );
    }

    const reactivated = await prisma.chefUnit.update({
      where: { id: existing.id },
      data: {
        isActive: true,
        name: preset.name,
        abbreviation: preset.abbreviation,
        unitType: preset.unitType,
        conversionRate: preset.conversionRate,
      },
    });
    return new ApiResponse(201, reactivated, 'Unit imported to your list successfully').send(res);
  }

  const unit = await prisma.chefUnit.create({
    data: {
      chefId,
      name: preset.name,
      abbreviation: preset.abbreviation,
      unitType: preset.unitType,
      conversionRate: preset.conversionRate,
      source: 'PRESET',
      sourcePresetId: preset.id,
    },
  });

  return new ApiResponse(201, unit, 'Unit imported to your list successfully').send(res);
});

const updateUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const { name, abbreviation, unitType, conversionRate } = req.body;

  const unit = await prisma.chefUnit.findUnique({ where: { id } });
  if (!unit || unit.chefId !== chefId) throw ApiError.notFound('Unit not found', { code: 'UNIT_NOT_FOUND' });

  if (name && name !== unit.name) {
    const nameClash = await prisma.chefUnit.findUnique({ where: { chefId_name: { chefId, name } } });
    if (nameClash) {
      throw ApiError.conflict('You already have a unit with this name', { code: 'UNIT_EXISTS' });
    }
  }

  const updated = await prisma.chefUnit.update({
    where: { id },
    data: { name, abbreviation, unitType, conversionRate },
  });

  return new ApiResponse(200, updated, 'Unit updated successfully').send(res);
});

// US-30 Scenario 3 (Optional Guard): warn if ingredients actively use this unit; ?force=true to proceed
const archiveUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;
  const force = req.query.force === 'true';

  const unit = await prisma.chefUnit.findUnique({ where: { id } });
  if (!unit || unit.chefId !== chefId) throw ApiError.notFound('Unit not found', { code: 'UNIT_NOT_FOUND' });

  if (!force) {
    const usageCount = await prisma.chefIngredient.count({ where: { unitId: id, isActive: true } });
    if (usageCount > 0) {
      throw ApiError.conflict(
        `This unit is used by ${usageCount} ingredient(s) in your stock. Add ?force=true to archive anyway.`,
        { code: 'UNIT_IN_USE_CONFIRM_REQUIRED', params: { count: usageCount } }
      );
    }
  }

  const updated = await prisma.chefUnit.update({ where: { id }, data: { isActive: false } });

  return new ApiResponse(200, updated, 'Unit archived from your list').send(res);
});

module.exports = { getUnitPresets, getMyUnits, createUnit, importUnitPreset, updateUnit, archiveUnit };
