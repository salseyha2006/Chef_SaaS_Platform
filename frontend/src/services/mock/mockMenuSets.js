import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';
import { mockDishes } from './mockDishes';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors, params) => {
  throw new ApiError({ status, code, message, errors, params });
};
const money = (n) => Number(n).toFixed(2);
let seq = 10;

/**
 * MenuSet ក្នុង Memory (Reset ពេល Refresh). dishIds = លំដាប់ក្នុងកញ្ចប់
 * ថ្លៃដើមគណនាពីថ្លៃ Dish បច្ចុប្បន្ន (Σ) — Backend ពិតរក្សាក្នុង `MenuSet.totalCost`
 * localStorage.setItem('mock.menuSet', 'empty') → បញ្ជីទទេ
 * localStorage.setItem('mock.menuSetDelete', 'fk') → Delete ឆ្លើយ 400 INVALID_REFERENCE
 */
let menuSets = [
  { id: 'm-1', name: 'កញ្ចប់មង្គលការ', isArchived: false, dishIds: ['d-1', 'd-2', 'd-4'] },
  { id: 'm-2', name: 'កញ្ចប់ធម្មតា', isArchived: false, dishIds: ['d-3', 'd-1'] },
  { id: 'm-3', name: 'កញ្ចប់បុណ្យចាស់', isArchived: true, dishIds: ['d-4'] },
];

const findSet = (id) =>
  menuSets.find((m) => m.id === id) || fail(404, 'MENU_SET_NOT_FOUND', 'Menu set not found');

/** ទាញ Dish ទាំងអស់ដែល Set ប្រើក្នុងការហៅតែមួយ → Map(id → rawDish) */
async function dishMap(sets) {
  const ids = [...new Set(sets.flatMap((s) => s.dishIds))];
  const rows = await mockDishes._peek(ids);
  return new Map(rows.map((d) => [d.id, d]));
}

const total = (set, map) =>
  set.dishIds.reduce((sum, id) => sum + Number(map.get(id)?.totalCost ?? 0), 0);

function validate(body, { partial = false } = {}) {
  const e = [];
  if (!partial || body.name !== undefined) {
    if (!String(body.name ?? '').trim()) e.push({ field: 'name', message: 'Required', code: 'VALIDATION_REQUIRED' });
  }
  if (!partial || body.dishIds !== undefined) {
    if (!Array.isArray(body.dishIds) || body.dishIds.length < 1) {
      e.push({ field: 'dishIds', message: 'Too few', code: 'VALIDATION_ARRAY_MIN' });
    }
  }
  if (e.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', e);
}

async function assertDishes(ids) {
  const rows = await mockDishes._peek(ids);
  if (rows.length !== new Set(ids).size) fail(400, 'MENU_SET_DISHES_INVALID', 'Some dishes are invalid');
}

export const mockMenuSets = {
  /** GET /menu-sets?archived= → MenuSet[] (raw: គ្មានចំនួន Dish — តាម Contract) */
  async list({ archived = false } = {}) {
    await delay();
    if (safeStorage.get('mock.menuSet') === 'empty') return [];
    const rows = menuSets.filter((m) => m.isArchived === archived);
    const map = await dishMap(rows);
    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      totalCost: money(total(m, map)),
      isArchived: m.isArchived,
    }));
  },

  /** GET /menu-sets/:id */
  async getById(id) {
    await delay();
    const set = findSet(id);
    const map = await dishMap([set]);
    return {
      id: set.id,
      name: set.name,
      totalCost: money(total(set, map)),
      isArchived: set.isArchived,
      dishes: set.dishIds
        .filter((dId) => map.has(dId))
        .map((dId, i) => {
          const d = map.get(dId);
          return { dishId: d.id, name: d.name, imageUrl: d.imageUrl, cost: money(d.totalCost), sortOrder: i };
        }),
    };
  },

  /** PATCH /menu-sets/:id/archive */
  async archive(id) {
    await delay(400);
    const set = findSet(id);
    menuSets = menuSets.map((m) => (m.id === id ? { ...m, isArchived: true } : m));
    const map = await dishMap([set]);
    return { id, name: set.name, totalCost: money(total(set, map)), isArchived: true };
  },

  /** DELETE /menu-sets/:id (Contract: គ្មាន 409; FK ផ្សេង → 400 INVALID_REFERENCE) */
  async remove(id) {
    await delay(500);
    findSet(id);
    if (safeStorage.get('mock.menuSetDelete') === 'fk') fail(400, 'INVALID_REFERENCE', 'Invalid reference');
    menuSets = menuSets.filter((m) => m.id !== id);
    return null;
  },

  /** POST /menu-sets {name, dishIds[min1]} → MenuSet */
  async create(body) {
    await delay(600);
    validate(body);
    await assertDishes(body.dishIds);
    const set = { id: `m-${++seq}`, name: body.name.trim(), isArchived: false, dishIds: [...new Set(body.dishIds)] };
    menuSets = [...menuSets, set];
    const map = await dishMap([set]);
    return { id: set.id, name: set.name, totalCost: money(total(set, map)), isArchived: false };
  },

  /** PATCH /menu-sets/:id {name?, dishIds?} (dishIds = ជំនួសទាំងអស់ តាមលំដាប់) */
  async update(id, body) {
    await delay(600);
    const set = findSet(id);
    validate(body, { partial: true });
    if (body.dishIds) await assertDishes(body.dishIds);
    const next = {
      ...set,
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.dishIds ? { dishIds: [...new Set(body.dishIds)] } : {}),
    };
    menuSets = menuSets.map((m) => (m.id === id ? next : m));
    const map = await dishMap([next]);
    return { id, name: next.name, totalCost: money(total(next, map)), isArchived: next.isArchived };
  },

  /** (Mock ប៉ុណ្ណោះ — មិនមែន Endpoint) ទាញ MenuSet តាម id ទាំង Archived ដើម្បីបង្កប់ក្នុង Event. រក្សាលំដាប់ ids */
  async _peek(ids) {
    const rows = ids.map((id) => menuSets.find((m) => m.id === id)).filter(Boolean);
    const map = await dishMap(rows);
    return rows.map((m) => ({
      id: m.id,
      name: m.name,
      totalCost: money(total(m, map)),
      isArchived: m.isArchived,
    }));
  },

  /** (Mock ប៉ុណ្ណោះ) dishIds ទាំងអស់ក្នុង MenuSet តាម ids */
  async _dishIds(ids) {
    return ids.map((id) => menuSets.find((m) => m.id === id)).filter(Boolean).flatMap((m) => m.dishIds);
  },
};
