import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors) => {
  throw new ApiError({ status, code, message, errors });
};
const norm = (s) => String(s ?? '').trim().toLowerCase();
let seq = 0;

/**
 * Mock ក្នុង Memory (Reset ពេល Refresh) — Unit និង Category មាន Logic ដូចគ្នា
 * ⚠️ Archive រួច Import ម្តងទៀត: Contract មិនបញ្ជាក់ (Gap #43)
 *    ទុក Reactivate; localStorage.setItem('mock.restore','conflict') → 409 ALREADY_IMPORTED
 */
function makeStore({ entity, prefix, presets, validate }) {
  const upper = entity.toUpperCase();
  let rows = [];

  const findRow = (id) => rows.find((r) => r.id === id) || fail(404, `${upper}_NOT_FOUND`, `${entity} not found`);

  return {
    /** GET /…/presets */
    async presets() {
      await delay();
      return presets.map((p) => ({
        ...p,
        isImported: rows.some((r) => r.isActive && norm(r.name) === norm(p.name)),
      }));
    },

    /** GET /… (ChefUnit[] / ChefCategory[]) */
    async list() {
      await delay();
      return rows.map((r) => ({ ...r }));
    },

    /** POST /… */
    async create(body) {
      await delay(500);
      const errors = validate(body);
      if (errors.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', errors);
      if (rows.some((r) => norm(r.name) === norm(body.name))) {
        fail(409, `${upper}_EXISTS`, `${entity} already exists`);
      }
      const row = { id: `${prefix}-${++seq}`, ...body, isActive: true };
      if ('conversionRate' in row) row.conversionRate = String(row.conversionRate);
      rows = [...rows, row];
      return { ...row };
    },

    /** POST /…/presets/:presetId/import */
    async importPreset(presetId) {
      await delay(500);
      const preset = presets.find((p) => p.id === presetId) || fail(404, `${upper}_NOT_FOUND`, 'Preset not found');
      const hit = rows.find((r) => norm(r.name) === norm(preset.name));
      if (hit?.isActive) fail(409, `${upper}_ALREADY_IMPORTED`, 'Already imported');
      if (hit) {
        if (safeStorage.get('mock.restore') === 'conflict') fail(409, `${upper}_ALREADY_IMPORTED`, 'Already imported');
        rows = rows.map((r) => (r.id === hit.id ? { ...r, isActive: true } : r));
        return { ...hit, isActive: true };
      }
      const { id: _presetId, isImported: _i, ...fields } = preset;
      const row = { id: `${prefix}-${++seq}`, ...fields, isActive: true };
      rows = [...rows, row];
      return { ...row };
    },

    /** PATCH /…/:id/archive */
    async archive(id) {
      await delay(400);
      findRow(id);
      rows = rows.map((r) => (r.id === id ? { ...r, isActive: false } : r));
      return { ...rows.find((r) => r.id === id) };
    },
  };
}

const tooSmall = (field) => ({ field, message: 'Too small', code: 'VALIDATION_TOO_SMALL' });
const required = (field) => ({ field, message: 'Required', code: 'VALIDATION_REQUIRED' });

export const mockUnits = makeStore({
  entity: 'Unit',
  prefix: 'u',
  presets: [
    { id: 'up-kg', name: 'គីឡូក្រាម', abbreviation: 'kg', unitType: 'weight', conversionRate: '1' },
    { id: 'up-g', name: 'ក្រាម', abbreviation: 'g', unitType: 'weight', conversionRate: '0.001' },
    { id: 'up-l', name: 'លីត្រ', abbreviation: 'L', unitType: 'volume', conversionRate: '1' },
    { id: 'up-ml', name: 'មីលីលីត្រ', abbreviation: 'ml', unitType: 'volume', conversionRate: '0.001' },
    { id: 'up-pcs', name: 'ដុំ', abbreviation: 'pcs', unitType: 'count', conversionRate: '1' },
    { id: 'up-dozen', name: 'យ៉ាប់', abbreviation: 'doz', unitType: 'count', conversionRate: '12' },
  ],
  validate: (b) => {
    const e = [];
    if (!String(b.name ?? '').trim()) e.push(required('name'));
    if (!['weight', 'volume', 'count'].includes(b.unitType)) e.push({ field: 'unitType', message: 'Invalid', code: 'VALIDATION_INVALID_OPTION' });
    if (!(Number(b.conversionRate) > 0)) e.push(tooSmall('conversionRate'));
    return e;
  },
});

export const mockCategories = makeStore({
  entity: 'Category',
  prefix: 'c',
  presets: [
    { id: 'cp-meat', name: 'សាច់' },
    { id: 'cp-veg', name: 'បន្លែ' },
    { id: 'cp-spice', name: 'គ្រឿងទេស' },
    { id: 'cp-seafood', name: 'ត្រី និងគ្រឿងសមុទ្រ' },
    { id: 'cp-fruit', name: 'ផ្លែឈើ' },
    { id: 'cp-dry', name: 'គ្រឿងស្ងួត' },
  ],
  validate: (b) => (String(b.name ?? '').trim() ? [] : [required('name')]),
});