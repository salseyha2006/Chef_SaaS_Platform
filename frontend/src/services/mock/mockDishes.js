import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';
import { mockIngredients } from './mockIngredients';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors, params) => {
  throw new ApiError({ status, code, message, errors, params });
};
const money = (n) => Number(n).toFixed(2);
let seq = 10;

/**
 * Dish ក្នុង Memory (Reset ពេល Refresh). lines = [{chefIngredientId, quantityUsed}]
 * ប្រើ id ស្តុក si-1..si-4 ពី mockIngredients; ថ្លៃដើមគណនាពីតម្លៃស្តុកបច្ចុប្បន្ន (US-42)
 * localStorage.setItem('mock.dish', 'empty') → បញ្ជីទទេ
 */
let dishes = [
  { id: 'd-1', name: 'ឆាក្ដៅសាច់មាន់', description: '', imageUrl: null, tags: ['ម្ហូបសំខាន់'], isArchived: false,
    lines: [{ chefIngredientId: 'si-2', quantityUsed: 1.5 }, { chefIngredientId: 'si-3', quantityUsed: 0.5 }] },
  { id: 'd-2', name: 'សម្លម្ជូរគ្រឿងសាច់ជ្រូក', description: '', imageUrl: null, tags: ['ស៊ុប', 'ម្ហូបសំខាន់'], isArchived: false,
    lines: [{ chefIngredientId: 'si-4', quantityUsed: 1 }, { chefIngredientId: 'si-1', quantityUsed: 0.1 }] },
  { id: 'd-3', name: 'នំបញ្ចុក', description: '', imageUrl: null, tags: ['ម្ហូបសម្រន់'], isArchived: false,
    lines: [{ chefIngredientId: 'si-3', quantityUsed: 1 }] },
  { id: 'd-4', name: 'បង្អែមចេកចៀន', description: '', imageUrl: null, tags: ['បង្អែម'], isArchived: false,
    lines: [{ chefIngredientId: 'si-1', quantityUsed: 2 }] },
  { id: 'd-5', name: 'សាឡាត់ត្រសក់', description: '', imageUrl: null, tags: [], isArchived: true,
    lines: [{ chefIngredientId: 'si-1', quantityUsed: 2 }] },
];

const priced = (dish, stock) =>
  dish.lines
    .map((l) => {
      const s = stock.find((x) => x.id === l.chefIngredientId);
      return s ? { ...l, s, subtotal: Number(l.quantityUsed) * Number(s.purchasePrice) } : null;
    })
    .filter(Boolean);

const toRaw = (dish, stock) => ({
  id: dish.id,
  name: dish.name,
  description: dish.description,
  imageUrl: dish.imageUrl,
  tags: [...dish.tags],
  totalCost: money(priced(dish, stock).reduce((s, l) => s + l.subtotal, 0)),
  isArchived: dish.isArchived,
});

const tooSmall = (field) => ({ field, message: 'Too small', code: 'VALIDATION_TOO_SMALL' });

function validate(body, { partial = false } = {}) {
  const e = [];
  if (!partial || body.name !== undefined) {
    if (!String(body.name ?? '').trim()) e.push({ field: 'name', message: 'Required', code: 'VALIDATION_REQUIRED' });
  }
  if (body.imageUrl !== undefined && !/^https?:\/\/\S+$/i.test(body.imageUrl)) {
    e.push({ field: 'imageUrl', message: 'Invalid url', code: 'VALIDATION_INVALID_URL' });
  }
  if (!partial || body.ingredients !== undefined) {
    const list = body.ingredients || [];
    if (list.length < 1) e.push({ field: 'ingredients', message: 'Too few', code: 'VALIDATION_ARRAY_MIN' });
    list.forEach((it, i) => {
      if (!(Number(it.quantityUsed) > 0)) e.push(tooSmall(`ingredients.${i}.quantityUsed`));
    });
  }
  if (e.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', e);
}

async function assertInStock(ingredients) {
  const stock = await mockIngredients.stock();
  if (ingredients.some((it) => !stock.some((s) => s.id === it.chefIngredientId))) {
    fail(400, 'DISH_INGREDIENTS_NOT_IN_STOCK', 'Some ingredients are not in stock');
  }
}

const findDish = (id) => dishes.find((d) => d.id === id) || fail(404, 'DISH_NOT_FOUND', 'Dish not found');

/** ចំនួន MenuSet ដែលប្រើ Dish (សាកល្បង 409 DISH_IN_USE). d-2 ប្រើក្នុង 2 កញ្ចប់ */
const IN_USE = { 'd-2': 2 };

export const mockDishes = {
  /** GET /dishes?tag=&archived= (name↑) */
  async list({ archived = false, tag } = {}) {
    await delay();
    if (safeStorage.get('mock.dish') === 'empty') return [];
    const stock = await mockIngredients.stock();
    return dishes
      .filter((d) => d.isArchived === archived && (!tag || d.tags.includes(tag)))
      .map((d) => toRaw(d, stock))
      .sort((a, b) => a.name.localeCompare(b.name, 'km'));
  },

  /** GET /dishes/:id → DTO + costBreakdown (គ្មាន chefIngredientId — តាម Contract) */
  async getById(id) {
    await delay();
    const dish = findDish(id);
    const stock = await mockIngredients.stock();
    const lines = priced(dish, stock);
    const total = lines.reduce((s, l) => s + l.subtotal, 0);
    return {
      ...toRaw(dish, stock),
      costBreakdown: lines.map((l) => ({
        ingredientName: l.s.name,
        quantityUsed: String(l.quantityUsed),
        unit: l.s.unit.abbreviation,
        unitPrice: l.s.purchasePrice,
        subtotal: money(l.subtotal),
        percentageOfTotal: total > 0 ? Number(((l.subtotal / total) * 100).toFixed(1)) : 0,
      })),
    };
  },

  /** POST /dishes */
  async create(body) {
    await delay(600);
    validate(body);
    await assertInStock(body.ingredients);
    const dish = {
      id: `d-${++seq}`,
      name: body.name.trim(),
      description: body.description ?? '',
      imageUrl: body.imageUrl ?? null,
      tags: body.tags ?? [],
      isArchived: false,
      lines: body.ingredients.map((i) => ({ chefIngredientId: i.chefIngredientId, quantityUsed: Number(i.quantityUsed) })),
    };
    dishes = [...dishes, dish];
    return toRaw(dish, await mockIngredients.stock());
  },

  /** PATCH /dishes/:id (ingredients = ជំនួសទាំងអស់) */
  async update(id, body) {
    await delay(600);
    const dish = findDish(id);
    validate(body, { partial: true });
    if (body.ingredients) await assertInStock(body.ingredients);
    const next = {
      ...dish,
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.ingredients
        ? { lines: body.ingredients.map((i) => ({ chefIngredientId: i.chefIngredientId, quantityUsed: Number(i.quantityUsed) })) }
        : {}),
    };
    dishes = dishes.map((d) => (d.id === id ? next : d));
    return toRaw(next, await mockIngredients.stock());
  },

  /** POST /dishes/:id/duplicate → ឈ្មោះ "<name> (Copy)" (Contract; UX "(ចម្លង)" — Gap #3) */
  async duplicate(id) {
    await delay(600);
    const src = findDish(id);
    const copy = {
      ...src,
      id: `d-${++seq}`,
      name: `${src.name} (Copy)`,
      tags: [...src.tags],
      isArchived: false,
      lines: src.lines.map((l) => ({ ...l })),
    };
    dishes = [...dishes, copy];
    return toRaw(copy, await mockIngredients.stock());
  },

  /** PATCH /dishes/:id/archive */
  async archive(id) {
    await delay(400);
    const dish = findDish(id);
    const next = { ...dish, isArchived: true };
    dishes = dishes.map((d) => (d.id === id ? next : d));
    return toRaw(next, await mockIngredients.stock());
  },

  /** DELETE /dishes/:id (409 DISH_IN_USE params.count — ពិនិត្យ MenuSet តែប៉ុណ្ណោះ) */
  async remove(id) {
    await delay(500);
    findDish(id);
    if (IN_USE[id] > 0) fail(409, 'DISH_IN_USE', 'Dish is in use', undefined, { count: IN_USE[id] });
    if (safeStorage.get('mock.dishDelete') === 'fk') fail(400, 'INVALID_REFERENCE', 'Invalid reference');
    dishes = dishes.filter((d) => d.id !== id);
    return null;
  },

  /** (Mock ប៉ុណ្ណោះ — មិនមែន Endpoint) ទាញ Dish តាម id ទាំង Archived ដើម្បីគណនា MenuSet. រក្សាលំដាប់ ids */
  async _peek(ids) {
    const stock = await mockIngredients.stock();
    return ids
      .map((id) => dishes.find((d) => d.id === id))
      .filter(Boolean)
      .map((d) => toRaw(d, stock));
  },

  /** (Mock ប៉ុណ្ណោះ) បន្ទាត់គ្រឿងផ្សំរបស់ Dish តាម ids (ទាំង Archived) សម្រាប់គណនា Cost ក្នុង Event */
  async _lines(ids) {
    return ids
      .map((id) => dishes.find((d) => d.id === id))
      .filter(Boolean)
      .flatMap((d) => d.lines.map((l) => ({ dishId: d.id, chefIngredientId: l.chefIngredientId, quantityUsed: l.quantityUsed })));
  },
};
