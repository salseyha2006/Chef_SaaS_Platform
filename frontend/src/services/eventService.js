import { api, getBlob } from './api';
import { mockEvents } from './mock/mockEvents';
import { shareOrDownloadFile } from '../utils/file';
import { toCostCalculation, toEvent, toEventDetail, toShoppingList } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const enc = encodeURIComponent;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * GET /events → Event[] (eventDate↑)
 * ទាញទាំងអស់ម្តង; Filter កំពុងមក/កន្លងទៅ ក្នុង Client (Contract មានតែ ?upcoming=true — Gap #88)
 */
async function getList() {
  const data = USE_MOCK ? await mockEvents.list() : await api.get('/events');
  return (data || []).map(toEvent);
}

/** GET /events/:id → EventDetail { …Event, dishes[], menuSets[] }. 404 EVENT_NOT_FOUND */
async function getById(id) {
  const data = USE_MOCK ? await mockEvents.getById(id) : await api.get(`/events/${enc(id)}`);
  return toEventDetail(data);
}

/** POST /events {name, eventDate:ISO datetime, tableCount:int>0} → 201 Event */
async function create(body) {
  const data = USE_MOCK ? await mockEvents.create(body) : await api.post('/events', body);
  return toEvent(data);
}

/** PATCH /events/:id {name?, eventDate?, tableCount?} → Event */
async function update(id, body) {
  const data = USE_MOCK ? await mockEvents.update(id, body) : await api.patch(`/events/${enc(id)}`, body);
  return toEvent(data);
}

/** POST /events/:id/clone {name?, eventDate?} → 201 Event (ចម្លង dishes + menuSets + tableCount) */
async function clone(id, body) {
  const data = USE_MOCK ? await mockEvents.clone(id, body) : await api.post(`/events/${enc(id)}/clone`, body);
  return toEvent(data);
}

/**
 * POST /events/:id/items {dishIds?, menuSetIds?} → EventDetail (skipDuplicates)
 * 400 EVENT_DISHES_INVALID | EVENT_MENU_SETS_INVALID
 */
async function addItems(id, { dishIds = [], menuSetIds = [] } = {}) {
  const body = {};
  if (dishIds.length) body.dishIds = dishIds;
  if (menuSetIds.length) body.menuSetIds = menuSetIds;
  const data = USE_MOCK ? await mockEvents.addItems(id, body) : await api.post(`/events/${enc(id)}/items`, body);
  return toEventDetail(data);
}

/** DELETE /events/:id/dishes/:dishId */
async function removeDish(id, dishId) {
  return USE_MOCK ? mockEvents.removeDish(id, dishId) : api.delete(`/events/${enc(id)}/dishes/${enc(dishId)}`);
}

/** DELETE /events/:id/menu-sets/:menuSetId */
async function removeMenuSet(id, menuSetId) {
  return USE_MOCK
    ? mockEvents.removeMenuSet(id, menuSetId)
    : api.delete(`/events/${enc(id)}/menu-sets/${enc(menuSetId)}`);
}

/** GET /events/:id/cost-calculation → CostCalculation (404 EVENT_NOT_FOUND) */
async function getCost(id) {
  const data = USE_MOCK ? await mockEvents.costCalculation(id) : await api.get(`/events/${enc(id)}/cost-calculation`);
  return toCostCalculation(data);
}

/** GET /events/:id/shopping-list → ShoppingList (items មាន isPurchased) · 404 EVENT_NOT_FOUND */
async function getShoppingList(id) {
  const data = USE_MOCK ? await mockEvents.shoppingList(id) : await api.get(`/events/${enc(id)}/shopping-list`);
  return toShoppingList(data);
}

/**
 * PATCH /events/:eventId/shopping-list/:chefIngredientId/toggle-purchased {isPurchased:boolean}
 * → EventPurchaseStatus (មិនប្រើ) · 404 EVENT_NOT_FOUND | INGREDIENT_NOT_FOUND · Auth+Sub (403 ពេលផុតកំណត់)
 */
async function setPurchased(eventId, chefIngredientId, isPurchased) {
  return USE_MOCK
    ? mockEvents.setPurchased(eventId, chefIngredientId, isPurchased)
    : api.patch(`/events/${enc(eventId)}/shopping-list/${enc(chefIngredientId)}/toggle-purchased`, { isPurchased });
}

/**
 * POST /events/:id/reports/pdf {title?, items?} → PDF → Share Sheet (Mobile) / ទាញយក (Desktop)
 * ត្រឡប់ 'shared' | 'cancelled' | 'downloaded'. 404 EVENT_NOT_FOUND
 * ⚠️ body មិនត្រូវមានតម្លៃ (Business Secret)
 */
async function downloadReportPdf(id, body) {
  const blob = USE_MOCK
    ? await mockEvents.reportPdf(id, body)
    : await getBlob(`/events/${enc(id)}/reports/pdf`, { method: 'POST', body });
  return shareOrDownloadFile(blob, `purchasing-list-${id}.pdf`);
}

/**
 * GET /events/:eventId/reports/excel → .xlsx (មានតម្លៃពេញលេញ — ផ្ទុយពី PDF) → Share Sheet / ទាញយក
 * ត្រឡប់ 'shared' | 'cancelled' | 'downloaded'. 404 EVENT_NOT_FOUND
 */
async function downloadReportExcel(id) {
  const raw = USE_MOCK ? await mockEvents.reportExcel(id) : await getBlob(`/events/${enc(id)}/reports/excel`);
  const blob = raw.type ? raw : new Blob([raw], { type: XLSX_MIME }); // កុំឱ្យ shareOrDownloadFile ប្រើ MIME PDF
  return shareOrDownloadFile(blob, `cost-report-${id}.xlsx`);
}

export const eventService = {
  getList, getById, create, update, clone, addItems, removeDish, removeMenuSet,
  getCost, getShoppingList, setPurchased, downloadReportPdf, downloadReportExcel,
};
