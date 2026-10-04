import { api } from './api';
import { mockUnits } from './mock/mockCatalog';
import { toPresetUnit, toUnit } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** GET /units/presets → [{id,name,abbreviation,unitType,conversionRate,isImported}] */
async function getPresets() {
  const data = USE_MOCK ? await mockUnits.presets() : await api.get('/units/presets');
  return (data || []).map(toPresetUnit);
}

/** GET /units → ChefUnit[] (មាន isActive) */
async function getMine() {
  const data = USE_MOCK ? await mockUnits.list() : await api.get('/units');
  return (data || []).map(toUnit);
}

/** POST /units {name, abbreviation, unitType, conversionRate>0} (409 UNIT_EXISTS) */
async function create({ name, abbreviation, unitType, conversionRate }) {
  const body = { name, abbreviation, unitType, conversionRate };
  const data = USE_MOCK ? await mockUnits.create(body) : await api.post('/units', body);
  return toUnit(data);
}

/** POST /units/presets/:presetId/import (409 UNIT_ALREADY_IMPORTED) */
async function importPreset(presetId) {
  const data = USE_MOCK
    ? await mockUnits.importPreset(presetId)
    : await api.post(`/units/presets/${encodeURIComponent(presetId)}/import`);
  return toUnit(data);
}

/** PATCH /units/:id/archive → isActive:false */
async function archive(id) {
  const data = USE_MOCK ? await mockUnits.archive(id) : await api.patch(`/units/${encodeURIComponent(id)}/archive`);
  return toUnit(data);
}

export const unitService = { getPresets, getMine, create, importPreset, archive };