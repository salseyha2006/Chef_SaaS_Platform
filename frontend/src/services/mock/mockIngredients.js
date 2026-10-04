import { ApiError } from '../api';
import { mockCategories, mockUnits } from './mockCatalog';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors, params) => {
  throw new ApiError({ status, code, message, errors, params });
};
const norm = (s) => String(s ?? '').trim().toLowerCase();

const kg = { id: 'up-kg', name: 'គីឡូក្រាម' };
const g = { id: 'up-g', name: 'ក្រាម' };
const pcs = { id: 'up-pcs', name: 'ដុំ' };

/** Shape តាម Contract: [{category, items:[{id,name,defaultUnit,isImported}]}] */
const PRESETS = [
  { category: 'សាច់', items: [
    { id: 'ip-chicken', name: 'សាច់មាន់ទាំងខ្លួន', defaultUnit: kg },
    { id: 'ip-wing', name: 'ស្លាបមាន់', defaultUnit: kg },
    { id: 'ip-pork', name: 'សាច់ជ្រូក', defaultUnit: kg },
    { id: 'ip-beef', name: 'សាច់គោ', defaultUnit: kg },
  ] },
  { category: 'បន្លែ', items: [
    { id: 'ip-garlic', name: 'ខ្ទឹមស', defaultUnit: kg },
    { id: 'ip-onion', name: 'ខ្ទឹមបារាំង', defaultUnit: kg },
    { id: 'ip-carrot', name: 'ការ៉ុត', defaultUnit: kg },
    { id: 'ip-cucumber', name: 'ត្រសក់', defaultUnit: null },
  ] },
  { category: 'គ្រឿងទេស', items: [
    { id: 'ip-pepper', name: 'ម្រេច', defaultUnit: g },
    { id: 'ip-salt', name: 'អំបិល', defaultUnit: kg },
    { id: 'ip-sugar', name: 'ស្ករ', defaultUnit: kg },
  ] },
  { category: 'ផ្លែឈើ', items: [{ id: 'ip-lime', name: 'ក្រូចឆ្មា', defaultUnit: pcs }] },
];
const ALL = PRESETS.flatMap((grp) => grp.items.map((i) => ({ ...i, group: grp.category })));

const SEED_UNIT = { id: 'seed-kg', name: 'គីឡូក្រាម', abbreviation: 'kg' };
const seed = (n, ingredientId, name, price, categoryName, usedBy) => ({
  id: `si-${n}`, ingredientId, name, purchasePrice: price, unitId: SEED_UNIT.id,
  unitSnap: SEED_UNIT, categoryName, isActive: true, usedBy,
});

/**
 * Stock ក្នុង Memory (Reset ពេល Refresh). usedBy = ចំនួនមុខម្ហូបដែលប្រើ
 * si-2 (usedBy 2) និង si-4 (usedBy 1) → សាកល្បង 409 INGREDIENT_IN_USE
 */
let seq = 10;
let stock = [
  seed(1, 'ip-salt', 'អំបិល', '0.50', 'គ្រឿងទេស', 0),
  seed(2, 'ip-chicken', 'សាច់មាន់ទាំងខ្លួន', '6.50', 'សាច់', 2),
  seed(3, 'ip-garlic', 'ខ្ទឹមស', '2.00', 'បន្លែ', 0),
  seed(4, 'ip-pork', 'សាច់ជ្រូក', '5.00', 'សាច់', 1),
];

const findStock = (id) =>
  stock.find((s) => s.id === id && s.isActive) || fail(404, 'STOCK_INGREDIENT_NOT_FOUND', 'Stock ingredient not found');

async function shape(s) {
  const units = await mockUnits.list();
  const u = units.find((x) => x.id === s.unitId) || s.unitSnap;
  return {
    id: s.id,
    name: s.name,
    category: s.categoryName || '',
    purchasePrice: s.purchasePrice,
    unit: { id: u.id, name: u.name, abbreviation: u.abbreviation },
    source: s.ingredientId ? 'preset' : 'custom',
  };
}

export const mockIngredients = {
  /** GET /ingredients/presets */
  async presets() {
    await delay();
    return PRESETS.map((grp) => ({
      category: grp.category,
      items: grp.items.map((i) => ({
        ...i,
        isImported: stock.some((s) => s.isActive && s.ingredientId === i.id),
      })),
    }));
  },

  /** POST /ingredients/import */
  async import({ items = [] }) {
    await delay(700);
    if (!items.length) {
      fail(400, 'VALIDATION_FAILED', 'Validation failed', [
        { field: 'items', message: 'Too few', code: 'VALIDATION_ARRAY_MIN' },
      ]);
    }
    const priceErrors = items
      .map((it, idx) => (Number(it.purchasePrice) >= 0 ? null : { field: `items.${idx}.purchasePrice`, message: 'Too small', code: 'VALIDATION_TOO_SMALL' }))
      .filter(Boolean);
    if (priceErrors.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', priceErrors);
    if (items.some((it) => !ALL.find((p) => p.id === it.ingredientId))) {
      fail(400, 'INGREDIENTS_NOT_FOUND', 'Some ingredients were not found');
    }
    const unitIds = new Set((await mockUnits.list()).filter((u) => u.isActive).map((u) => u.id));
    if (items.some((it) => !unitIds.has(it.unitId))) fail(400, 'UNIT_NOT_IN_LIST', 'Unit not in list');

    const created = [];
    items.forEach((it) => {
      if (stock.some((s) => s.isActive && s.ingredientId === it.ingredientId)) return; // រំលងស្ងៀមស្ងាត់
      const preset = ALL.find((p) => p.id === it.ingredientId);
      const row = {
        id: `si-${++seq}`, ingredientId: preset.id, name: preset.name,
        purchasePrice: Number(it.purchasePrice).toFixed(2), unitId: it.unitId, unitSnap: null,
        categoryName: preset.group, isActive: true, usedBy: 0,
      };
      stock = [...stock, row];
      created.push({ id: row.id, name: row.name, purchasePrice: row.purchasePrice, unitId: row.unitId, isActive: true });
    });
    return created;
  },

  /** GET /ingredients/my-stock?categoryId= */
  async stock(categoryId) {
    await delay();
    let catName = null;
    if (categoryId) {
      const cat = (await mockCategories.list()).find((c) => c.id === categoryId);
      catName = cat ? cat.name : '__none__';
    }
    const rows = stock.filter((s) => s.isActive && (!catName || norm(s.categoryName) === norm(catName)));
    return Promise.all(rows.map(shape));
  },

  /** PATCH /ingredients/my-stock/:id */
  async update(id, patch) {
    await delay(600);
    const row = findStock(id);
    if (patch.purchasePrice !== undefined && !(Number(patch.purchasePrice) >= 0)) {
      fail(400, 'VALIDATION_FAILED', 'Validation failed', [
        { field: 'purchasePrice', message: 'Too small', code: 'VALIDATION_TOO_SMALL' },
      ]);
    }
    const next = { ...row };
    if (patch.purchasePrice !== undefined) next.purchasePrice = Number(patch.purchasePrice).toFixed(2);
    if (patch.unitId !== undefined && patch.unitId !== row.unitId) {
      const ok = (await mockUnits.list()).some((u) => u.isActive && u.id === patch.unitId);
      if (!ok) fail(400, 'UNIT_NOT_IN_LIST', 'Unit not in list');
      next.unitId = patch.unitId;
    }
    if (patch.categoryId !== undefined) {
      const cat = (await mockCategories.list()).find((c) => c.isActive && c.id === patch.categoryId);
      if (!cat) fail(400, 'CATEGORY_NOT_IN_LIST', 'Category not in list');
      next.categoryName = cat.name;
    }
    stock = stock.map((s) => (s.id === id ? next : s));
    return { id, name: next.name, purchasePrice: next.purchasePrice, unitId: next.unitId, categoryId: patch.categoryId ?? null, isActive: true };
  },

  /** PATCH /ingredients/my-stock/:id/archive */
  async archive(id) {
    await delay(400);
    findStock(id);
    stock = stock.map((s) => (s.id === id ? { ...s, isActive: false } : s));
    return { id, isActive: false };
  },

  /** DELETE /ingredients/my-stock/:id (409 INGREDIENT_IN_USE params.count) */
  async remove(id) {
    await delay(500);
    const row = findStock(id);
    if (row.usedBy > 0) fail(409, 'INGREDIENT_IN_USE', 'Ingredient is in use', undefined, { count: row.usedBy });
    stock = stock.filter((s) => s.id !== id);
    return null;
  },
};