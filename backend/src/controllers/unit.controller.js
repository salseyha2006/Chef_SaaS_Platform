const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Browse the global Unit preset catalog, flagged with whether this chef already imported each one
const getUnitPresets = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const [presets, imported] = await Promise.all([
    prisma.unit.findMany({ orderBy: { name: 'asc' } }),
    prisma.chefUnit.findMany({
      where: { chefId, sourcePresetId: { not: null } },
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

// US-26: this chef's own Units (custom + imported copies) — used to populate forms elsewhere
const getMyUnits = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;

  const units = await prisma.chefUnit.findMany({
    where: { chefId, isActive: true },
    orderBy: { name: 'asc' },
  });

  return new ApiResponse(200, units, 'Your units fetched successfully').send(res);
});

// US-26 + US-27: Create a brand-new custom Unit (conversionRate mandatory)
const createUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { name, abbreviation, unitType, conversionRate } = req.body;

  const existing = await prisma.chefUnit.findUnique({ where: { chefId_name: { chefId, name } } });
  if (existing) throw ApiError.conflict('You already have a unit with this name', { code: 'UNIT_EXISTS' });

  const unit = await prisma.chefUnit.create({
    data: { chefId, name, abbreviation, unitType, conversionRate, source: 'CUSTOM' },
  });

  return new ApiResponse(201, unit, 'Unit created successfully').send(res);
});

// US-26 + US-29: Import (copy) a preset Unit into this chef's own list
const importUnitPreset = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { presetId } = req.params;

  const preset = await prisma.unit.findUnique({ where: { id: presetId } });
  if (!preset) throw ApiError.notFound('Unit preset not found', { code: 'UNIT_NOT_FOUND' });

  const existing = await prisma.chefUnit.findUnique({
    where: { chefId_sourcePresetId: { chefId, sourcePresetId: presetId } },
  });
  if (existing) {
    throw ApiError.conflict('This unit preset has already been imported', {
      code: 'UNIT_ALREADY_IMPORTED',
    });
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

// US-11 Scenario 3: Edit a unit this chef owns (imported-from-preset or fully custom) —
// never touches the global preset row, so other chefs are unaffected
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

// US-30 / US-11 Scenario 3 (delete): soft-delete — hides it from this chef's list only
const archiveUnit = asyncHandler(async (req, res) => {
  const chefId = req.chef.id;
  const { id } = req.params;

  const unit = await prisma.chefUnit.findUnique({ where: { id } });
  if (!unit || unit.chefId !== chefId) throw ApiError.notFound('Unit not found', { code: 'UNIT_NOT_FOUND' });

  const updated = await prisma.chefUnit.update({ where: { id }, data: { isActive: false } });

  return new ApiResponse(200, updated, 'Unit archived from your list').send(res);
});

module.exports = { getUnitPresets, getMyUnits, createUnit, importUnitPreset, updateUnit, archiveUnit };