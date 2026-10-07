import { api } from './api';
import { mockDishes } from './mock/mockDishes';
import { toDish, toDishDetail } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const enc = encodeURIComponent;

/** GET /dishes?tag=&archived= (archived='true' = Archived) → Dish[] */
async function getList({ archived = false, tag } = {}) {
  const qs = new URLSearchParams();
  if (archived) qs.set('archived', 'true');
  if (tag) qs.set('tag', tag);
  const query = qs.toString() ? `?${qs}` : '';
  const data = USE_MOCK ? await mockDishes.list({ archived, tag }) : await api.get(`/dishes${query}`);
  return (data || []).map(toDish);
}

/** GET /dishes/:id → DishDetail (costBreakdown). 404 DISH_NOT_FOUND */
async function getById(id) {
  const data = USE_MOCK ? await mockDishes.getById(id) : await api.get(`/dishes/${enc(id)}`);
  return toDishDetail(data);
}

/** POST /dishes {name, description?, imageUrl?, tags?, ingredients:[{chefIngredientId, quantityUsed}]} (400 DISH_INGREDIENTS_NOT_IN_STOCK) */
async function create(body) {
  const data = USE_MOCK ? await mockDishes.create(body) : await api.post('/dishes', body);
  return toDish(data);
}

/** PATCH /dishes/:id (ingredients ផ្ញើ = ជំនួសទាំងអស់) */
async function update(id, body) {
  const data = USE_MOCK ? await mockDishes.update(id, body) : await api.patch(`/dishes/${enc(id)}`, body);
  return toDish(data);
}

/** POST /dishes/:id/duplicate → 201 Dish ថ្មី (ឈ្មោះ "<name> (Copy)") */
async function duplicate(id) {
  const data = USE_MOCK ? await mockDishes.duplicate(id) : await api.post(`/dishes/${enc(id)}/duplicate`);
  return toDish(data);
}

/** PATCH /dishes/:id/archive → Dish (isArchived:true) */
async function archive(id) {
  const data = USE_MOCK ? await mockDishes.archive(id) : await api.patch(`/dishes/${enc(id)}/archive`);
  return toDish(data);
}

/** DELETE /dishes/:id (409 DISH_IN_USE params.count; FK ផ្សេង → 400 INVALID_REFERENCE) */
async function remove(id) {
  return USE_MOCK ? mockDishes.remove(id) : api.delete(`/dishes/${enc(id)}`);
}

export const dishService = { getList, getById, create, update, duplicate, archive, remove };
