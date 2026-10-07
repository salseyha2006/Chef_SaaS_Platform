import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';
import { mockDishes } from './mockDishes';
import { mockMenuSets } from './mockMenuSets';
import { mockIngredients } from './mockIngredients';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const fail = (status, code, message, errors, params) => {
  throw new ApiError({ status, code, message, errors, params });
};

const noon = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};
let seq = 10;

const MOCK_PDF =
  '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF';

// ⚠️ មិនមែន Workbook ត្រឹមត្រូវ (គ្មាន Library) — សម្រាប់សាកល្បងលំហូរ Download ប៉ុណ្ណោះ
const MOCK_XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Event ក្នុង Memory (Reset ពេល Refresh). កាលបរិច្ឆេទ Relative ទៅថ្ងៃនេះ
 * dishIds/menuSetIds ប្រើ id ពី mockDishes (d-1..d-5) និង mockMenuSets (m-1..m-3)
 * localStorage.setItem('mock.event', 'empty') → បញ្ជីទទេ
 */
let events = [
  { id: 'e-1', name: 'មង្គលការ សុខា & ដារា', eventDate: noon(10), tableCount: 20, dishIds: ['d-1', 'd-3'], menuSetIds: ['m-2'] },
  { id: 'e-2', name: 'បុណ្យខួបកំណើត', eventDate: noon(35), tableCount: 8, dishIds: [], menuSetIds: ['m-1'] },
  { id: 'e-3', name: 'ពិធីបើកហាង', eventDate: noon(-20), tableCount: 15, dishIds: [], menuSetIds: [] },
];

const toRaw = (e) => ({
  id: e.id,
  chefId: 'chef-mock',
  name: e.name,
  eventDate: e.eventDate,
  tableCount: e.tableCount,
  createdAt: e.eventDate,
  updatedAt: e.eventDate,
});

/** Event + dishes[{id,eventId,dishId,dish}] + menuSets[{id,eventId,menuSetId,menuSet}] */
async function toDetail(e) {
  const [dishRows, setRows] = await Promise.all([mockDishes._peek(e.dishIds), mockMenuSets._peek(e.menuSetIds)]);
  return {
    ...toRaw(e),
    dishes: dishRows.map((d) => ({ id: `ed-${e.id}-${d.id}`, eventId: e.id, dishId: d.id, dish: d })),
    menuSets: setRows.map((m) => ({ id: `em-${e.id}-${m.id}`, eventId: e.id, menuSetId: m.id, menuSet: m })),
  };
}

const findEvent = (id) => events.find((e) => e.id === id) || fail(404, 'EVENT_NOT_FOUND', 'Event not found');
const replace = (next) => { events = events.map((e) => (e.id === next.id ? next : e)); };

// ស្ថានភាព Check-off (US-60) រក្សាក្នុង localStorage ដើម្បីសាកល្បង S5 (Refresh ទំព័រ)
const purchasedKey = (eventId) => `mock.purchased.${eventId}`;
const readPurchased = (eventId) => {
  try {
    return new Set(JSON.parse(safeStorage.get(purchasedKey(eventId)) || '[]'));
  } catch {
    return new Set();
  }
};
const writePurchased = (eventId, set) => safeStorage.set(purchasedKey(eventId), JSON.stringify([...set]));

function validate(body, { partial = false } = {}) {
  const e = [];
  if (!partial || body.name !== undefined) {
    if (!String(body.name ?? '').trim()) e.push({ field: 'name', message: 'Required', code: 'VALIDATION_REQUIRED' });
  }
  if (!partial || body.eventDate !== undefined) {
    if (Number.isNaN(new Date(body.eventDate).getTime())) {
      e.push({ field: 'eventDate', message: 'Invalid datetime', code: 'VALIDATION_INVALID_DATETIME' });
    }
  }
  if (!partial || body.tableCount !== undefined) {
    if (!Number.isInteger(body.tableCount) || body.tableCount <= 0) {
      e.push({ field: 'tableCount', message: 'Too small', code: 'VALIDATION_TOO_SMALL' });
    }
  }
  if (e.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', e);
}

export const mockEvents = {
  /** GET /events (eventDate↑) */
  async list() {
    await delay();
    if (safeStorage.get('mock.event') === 'empty') return [];
    return [...events].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)).map(toRaw);
  },

  /** GET /events/:id → Event + dishes[{…,dish}] + menuSets[{…,menuSet}] */
  async getById(id) {
    await delay();
    return toDetail(findEvent(id));
  },

  /** POST /events {name, eventDate(ISO), tableCount(int>0)} → 201 Event */
  async create(body) {
    await delay(600);
    validate(body);
    const event = {
      id: `e-${++seq}`,
      name: body.name.trim(),
      eventDate: body.eventDate,
      tableCount: body.tableCount,
      dishIds: [],
      menuSetIds: [],
    };
    events = [...events, event];
    return toRaw(event);
  },

  /** PATCH /events/:id {name?, eventDate?, tableCount?} */
  async update(id, body) {
    await delay(600);
    const event = findEvent(id);
    validate(body, { partial: true });
    const next = {
      ...event,
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.eventDate !== undefined ? { eventDate: body.eventDate } : {}),
      ...(body.tableCount !== undefined ? { tableCount: body.tableCount } : {}),
    };
    replace(next);
    return toRaw(next);
  },

  /** POST /events/:id/clone {name?, eventDate?} → 201 Event (ចម្លង dishes + menuSets + tableCount; ឈ្មោះ default "<name> (Copy)") */
  async clone(id, body = {}) {
    await delay(600);
    const src = findEvent(id);
    if (body.eventDate !== undefined && Number.isNaN(new Date(body.eventDate).getTime())) {
      fail(400, 'VALIDATION_FAILED', 'Validation failed', [
        { field: 'eventDate', message: 'Invalid datetime', code: 'VALIDATION_INVALID_DATETIME' },
      ]);
    }
    const copy = {
      ...src,
      id: `e-${++seq}`,
      name: body.name?.trim() || `${src.name} (Copy)`,
      eventDate: body.eventDate ?? src.eventDate,
      dishIds: [...src.dishIds],
      menuSetIds: [...src.menuSetIds],
    };
    events = [...events, copy];
    return toRaw(copy);
  },

  /** POST /events/:id/items {dishIds?, menuSetIds?} → Event + dishes + menuSets (skipDuplicates) */
  async addItems(id, body = {}) {
    await delay(500);
    const event = findEvent(id);
    const dishIds = body.dishIds ?? [];
    const menuSetIds = body.menuSetIds ?? [];
    const dishRows = await mockDishes._peek(dishIds);
    if (dishRows.length !== new Set(dishIds).size || dishRows.some((d) => d.isArchived)) {
      fail(400, 'EVENT_DISHES_INVALID', 'Some dishes are invalid');
    }
    const setRows = await mockMenuSets._peek(menuSetIds);
    if (setRows.length !== new Set(menuSetIds).size || setRows.some((m) => m.isArchived)) {
      fail(400, 'EVENT_MENU_SETS_INVALID', 'Some menu sets are invalid');
    }
    const next = {
      ...event,
      dishIds: [...new Set([...event.dishIds, ...dishIds])],
      menuSetIds: [...new Set([...event.menuSetIds, ...menuSetIds])],
    };
    replace(next);
    return toDetail(next);
  },

  /** DELETE /events/:id/dishes/:dishId */
  async removeDish(id, dishId) {
    await delay(400);
    const event = findEvent(id);
    replace({ ...event, dishIds: event.dishIds.filter((d) => d !== dishId) });
    return null;
  },

  /** DELETE /events/:id/menu-sets/:menuSetId */
  async removeMenuSet(id, menuSetId) {
    await delay(400);
    const event = findEvent(id);
    replace({ ...event, menuSetIds: event.menuSetIds.filter((m) => m !== menuSetId) });
    return null;
  },

  /**
   * GET /events/:id/cost-calculation → {eventId,eventName,tableCount,items:[ShoppingItem],grandTotal}
   * quantityPerTable = Σ quantityUsed ពីគ្រប់ Dish (Direct + MenuSet; Dish ស្ទួន = ១ដង) · totalQuantity = × tableCount
   * ថ្លៃគណនាពីតម្លៃស្តុកបច្ចុប្បន្ន (Computed on read)
   */
  async costCalculation(id) {
    await delay();
    const event = findEvent(id);
    const fromSets = await mockMenuSets._dishIds(event.menuSetIds);
    const dishIds = [...new Set([...event.dishIds, ...fromSets])];
    const [lines, stock] = await Promise.all([mockDishes._lines(dishIds), mockIngredients.stock()]);

    const perTable = new Map();
    lines.forEach((l) => perTable.set(l.chefIngredientId, (perTable.get(l.chefIngredientId) || 0) + Number(l.quantityUsed)));

    const items = [...perTable.entries()]
      .map(([ingId, qty]) => {
        const s = stock.find((x) => x.id === ingId);
        if (!s) return null;
        const unitPrice = Number(s.purchasePrice);
        const totalQuantity = qty * event.tableCount;
        return {
          chefIngredientId: s.id,
          ingredientName: s.name,
          unit: s.unit,
          unitPrice,
          quantityPerTable: Number(qty.toFixed(3)),
          totalQuantity: Number(totalQuantity.toFixed(3)),
          totalPrice: Number((totalQuantity * unitPrice).toFixed(2)),
        };
      })
      .filter(Boolean);

    return {
      eventId: event.id,
      eventName: event.name,
      tableCount: event.tableCount,
      items,
      grandTotal: Number(items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)),
    };
  },

  /** GET /events/:id/shopping-list → {eventId,eventName,items:[ShoppingItem+isPurchased],progress,purchasedCount,totalCount} */
  async shoppingList(id) {
    const cost = await mockEvents.costCalculation(id);
    const purchased = readPurchased(id);
    const items = cost.items.map((i) => ({ ...i, isPurchased: purchased.has(i.chefIngredientId) }));
    const done = items.filter((i) => i.isPurchased).length;
    return {
      eventId: cost.eventId,
      eventName: cost.eventName,
      items,
      progress: items.length ? Math.round((done / items.length) * 100) : 0,
      purchasedCount: done,
      totalCount: items.length,
    };
  },

  /**
   * PATCH /events/:eventId/shopping-list/:chefIngredientId/toggle-purchased {isPurchased} → EventPurchaseStatus
   * localStorage.setItem('mock.togglePurchased', 'fail') → 500 (សាកល្បង Rollback)
   */
  async setPurchased(eventId, chefIngredientId, isPurchased) {
    await delay(250);
    findEvent(eventId);
    if (safeStorage.get('mock.togglePurchased') === 'fail') fail(500, 'INTERNAL_ERROR', 'Internal error');
    const set = readPurchased(eventId);
    if (isPurchased) set.add(chefIngredientId);
    else set.delete(chefIngredientId);
    writePurchased(eventId, set);
    return {
      id: `eps-${eventId}-${chefIngredientId}`,
      eventId,
      chefIngredientId,
      isPurchased,
      purchasedAt: isPurchased ? new Date().toISOString() : null,
    };
  },

  /**
   * POST /events/:id/reports/pdf {title?, items?:[{ingredientName,totalQuantity,unit:{abbreviation}}]} → PDF Blob
   * localStorage.setItem('mock.reportPdf', 'fail') → 500 INTERNAL_ERROR
   */
  async reportPdf(id, body = {}) {
    await delay(800);
    findEvent(id);
    if (safeStorage.get('mock.reportPdf') === 'fail') fail(500, 'INTERNAL_ERROR', 'Internal error');
    if (!Array.isArray(body.items) || body.items.length < 1) {
      fail(400, 'VALIDATION_FAILED', 'Validation failed', [
        { field: 'items', message: 'Too few', code: 'VALIDATION_ARRAY_MIN' },
      ]);
    }
    return new Blob([MOCK_PDF], { type: 'application/pdf' });
  },

  /**
   * GET /events/:eventId/reports/excel → .xlsx Blob (Sheets: Dish Detail, Shopping List Summary)
   * localStorage.setItem('mock.reportExcel', 'fail') → 500 INTERNAL_ERROR
   */
  async reportExcel(id) {
    await delay(800);
    findEvent(id);
    if (safeStorage.get('mock.reportExcel') === 'fail') fail(500, 'INTERNAL_ERROR', 'Internal error');
    return new Blob(['MOCK WORKBOOK — not a real .xlsx'], { type: MOCK_XLSX_MIME });
  },
};
