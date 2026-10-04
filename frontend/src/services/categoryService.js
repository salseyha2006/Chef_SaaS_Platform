import { api } from './api';
import { mockCategories } from './mock/mockCatalog';
import { toCategory, toPresetCategory } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** GET /categories/presets → [{id,name,isImported}] */
async function getPresets() {
  const data = USE_MOCK ? await mockCategories.presets() : await api.get('/categories/presets');
  return (data || []).map(toPresetCategory);
}

/** GET /categories → ChefCategory[] */
async function getMine() {
  const data = USE_MOCK ? await mockCategories.list() : await api.get('/categories');
  return (data || []).map(toCategory);
}

/** POST /categories {name} (409 CATEGORY_EXISTS) */
async function create({ name }) {
  const body = { name };
  const data = USE_MOCK ? await mockCategories.create(body) : await api.post('/categories', body);
  return toCategory(data);
}

/** POST /categories/presets/:presetId/import (409 CATEGORY_ALREADY_IMPORTED) */
async function importPreset(presetId) {
  const data = USE_MOCK
    ? await mockCategories.importPreset(presetId)
    : await api.post(`/categories/presets/${encodeURIComponent(presetId)}/import`);
  return toCategory(data);
}

/** PATCH /categories/:id/archive */
async function archive(id) {
  const data = USE_MOCK
    ? await mockCategories.archive(id)
    : await api.patch(`/categories/${encodeURIComponent(id)}/archive`);
  return toCategory(data);
}

export const categoryService = { getPresets, getMine, create, importPreset, archive };