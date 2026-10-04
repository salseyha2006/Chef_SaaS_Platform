import { api } from './api';
import { mockIngredients } from './mock/mockIngredients';
import { toPresetTree, toStockItem } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const enc = encodeURIComponent;

/** GET /ingredients/presets → Tree (ដោយ toPresetTree) */
async function getPresets() {
  const data = USE_MOCK ? await mockIngredients.presets() : await api.get('/ingredients/presets');
  return toPresetTree(data);
}

/**
 * POST /ingredients/import {items:[{ingredientId, purchasePrice, unitId}]}
 * 400: INGREDIENTS_NOT_FOUND, UNIT_NOT_IN_LIST
 */
async function importItems(items) {
  const body = { items };
  const data = USE_MOCK ? await mockIngredients.import(body) : await api.post('/ingredients/import', body);
  return data || [];
}

/** GET /ingredients/my-stock?categoryId= → [{id,name,category:string,purchasePrice,unit,source}] */
async function getStock(categoryId) {
  const data = USE_MOCK
    ? await mockIngredients.stock(categoryId)
    : await api.get(`/ingredients/my-stock${categoryId ? `?categoryId=${enc(categoryId)}` : ''}`);
  return (data || []).map(toStockItem);
}

/** PATCH /ingredients/my-stock/:id {name?, purchasePrice?, unitId?, categoryId?} (Recalc ថ្លៃមុខម្ហូបដោយ Backend) */
async function updateStock(id, patch) {
  return USE_MOCK
    ? mockIngredients.update(id, patch)
    : api.patch(`/ingredients/my-stock/${enc(id)}`, patch);
}

/** PATCH /ingredients/my-stock/:id/archive */
async function archiveStock(id) {
  return USE_MOCK ? mockIngredients.archive(id) : api.patch(`/ingredients/my-stock/${enc(id)}/archive`);
}

/** DELETE /ingredients/my-stock/:id (409 INGREDIENT_IN_USE params.count) */
async function deleteStock(id) {
  return USE_MOCK ? mockIngredients.remove(id) : api.delete(`/ingredients/my-stock/${enc(id)}`);
}

export const ingredientService = { getPresets, importItems, getStock, updateStock, archiveStock, deleteStock };