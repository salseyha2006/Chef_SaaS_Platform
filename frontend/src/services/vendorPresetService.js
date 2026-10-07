import { api } from './api';
import { mockVendorPresets } from './mock/mockVendorPresets';
import { toVendorPreset } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const enc = encodeURIComponent;

/** GET /vendor-presets → VendorPreset[] ({id,name,ingredients:[{id,name}]}) */
async function getList() {
  const data = USE_MOCK ? await mockVendorPresets.list() : await api.get('/vendor-presets');
  return (data || []).map(toVendorPreset);
}

/** POST /vendor-presets {name, chefIngredientIds:uuid[](min1)} → 201 (409 VENDOR_PRESET_EXISTS; 400 STOCK_INGREDIENT_NOT_FOUND) */
async function create(body) {
  const data = USE_MOCK ? await mockVendorPresets.create(body) : await api.post('/vendor-presets', body);
  return toVendorPreset(data);
}

/** PATCH /vendor-presets/:id {name?, chefIngredientIds?} → null (គ្មាន Validation ក្នុង Backend — Frontend ពិនិត្យមុន) */
async function update(id, body) {
  return USE_MOCK ? mockVendorPresets.update(id, body) : api.patch(`/vendor-presets/${enc(id)}`, body);
}

/** DELETE /vendor-presets/:id → null (404 VENDOR_PRESET_NOT_FOUND) */
async function remove(id) {
  return USE_MOCK ? mockVendorPresets.remove(id) : api.delete(`/vendor-presets/${enc(id)}`);
}

export const vendorPresetService = { getList, create, update, remove };
