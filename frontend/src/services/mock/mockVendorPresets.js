import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';
import { normalizeName } from '../../utils/catalog';
import { mockIngredients } from './mockIngredients';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors, params) => {
  throw new ApiError({ status, code, message, errors, params });
};
let seq = 10;

/**
 * Template ក្នុង Memory (Reset ពេល Refresh). ingredientIds ប្រើ id ស្តុក si-1..si-4
 * localStorage.setItem('mock.vendor', 'empty') → បញ្ជីទទេ
 */
let presets = [
  { id: 'v-1', name: 'ម៉ូយសាច់', ingredientIds: ['si-2', 'si-4'] },
  { id: 'v-2', name: 'ម៉ូយបន្លែ', ingredientIds: ['si-3'] },
];

const findPreset = (id) =>
  presets.find((p) => p.id === id) || fail(404, 'VENDOR_PRESET_NOT_FOUND', 'Vendor preset not found');

async function assertInStock(ids) {
  const stock = await mockIngredients.stock();
  if (ids.some((id) => !stock.some((s) => s.id === id))) {
    fail(400, 'STOCK_INGREDIENT_NOT_FOUND', 'Some ingredients are not in stock');
  }
}

const isDuplicate = (name, exceptId) =>
  presets.some((p) => p.id !== exceptId && normalizeName(p.name) === normalizeName(name));

export const mockVendorPresets = {
  /** GET /vendor-presets → [{id,name,ingredients:[{id,name}]}] */
  async list() {
    await delay();
    if (safeStorage.get('mock.vendor') === 'empty') return [];
    const stock = await mockIngredients.stock();
    return presets.map((p) => ({
      id: p.id,
      name: p.name,
      ingredients: p.ingredientIds
        .map((id) => stock.find((s) => s.id === id))
        .filter(Boolean)
        .map((s) => ({ id: s.id, name: s.name })),
    }));
  },

  /** POST /vendor-presets {name, chefIngredientIds(min1)} → 201 VendorPreset (raw — គ្មាន ingredients) */
  async create(body) {
    await delay(500);
    const errors = [];
    if (!String(body.name ?? '').trim()) errors.push({ field: 'name', message: 'Required', code: 'VALIDATION_REQUIRED' });
    if (!Array.isArray(body.chefIngredientIds) || body.chefIngredientIds.length < 1) {
      errors.push({ field: 'chefIngredientIds', message: 'Too few', code: 'VALIDATION_ARRAY_MIN' });
    }
    if (errors.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', errors);
    if (isDuplicate(body.name)) fail(409, 'VENDOR_PRESET_EXISTS', 'Vendor preset exists');
    await assertInStock(body.chefIngredientIds);
    const preset = { id: `v-${++seq}`, name: body.name.trim(), ingredientIds: [...new Set(body.chefIngredientIds)] };
    presets = [...presets, preset];
    const now = new Date().toISOString();
    return { id: preset.id, chefId: 'chef-mock', name: preset.name, createdAt: now, updatedAt: now };
  },

  /** PATCH /vendor-presets/:id {name?, chefIngredientIds?} — Contract: គ្មាន Zod; ឆ្លើយ null */
  async update(id, body) {
    await delay(500);
    const preset = findPreset(id);
    if (body.name !== undefined && isDuplicate(body.name, id)) fail(409, 'VENDOR_PRESET_EXISTS', 'Vendor preset exists');
    if (body.chefIngredientIds) await assertInStock(body.chefIngredientIds);
    const next = {
      ...preset,
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.chefIngredientIds ? { ingredientIds: [...new Set(body.chefIngredientIds)] } : {}),
    };
    presets = presets.map((p) => (p.id === id ? next : p));
    return null;
  },

  /** DELETE /vendor-presets/:id */
  async remove(id) {
    await delay(400);
    findPreset(id);
    presets = presets.filter((p) => p.id !== id);
    return null;
  },
};
