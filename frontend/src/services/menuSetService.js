import { api } from './api';
import { mockMenuSets } from './mock/mockMenuSets';
import { toMenuSet, toMenuSetDetail } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const enc = encodeURIComponent;

/** GET /menu-sets?archived= ('true' = Archived) → MenuSet[] */
async function getList({ archived = false } = {}) {
  const data = USE_MOCK
    ? await mockMenuSets.list({ archived })
    : await api.get(`/menu-sets${archived ? '?archived=true' : ''}`);
  return (data || []).map(toMenuSet);
}

/** GET /menu-sets/:id → MenuSetDetail. 404 MENU_SET_NOT_FOUND */
async function getById(id) {
  const data = USE_MOCK ? await mockMenuSets.getById(id) : await api.get(`/menu-sets/${enc(id)}`);
  return toMenuSetDetail(data);
}

/** POST /menu-sets {name, dishIds:uuid[](min1)} → 201 MenuSet (400 MENU_SET_DISHES_INVALID) */
async function create(body) {
  const data = USE_MOCK ? await mockMenuSets.create(body) : await api.post('/menu-sets', body);
  return toMenuSet(data);
}

/** PATCH /menu-sets/:id {name?, dishIds?} (dishIds = ជំនួសទាំងអស់, sortOrder តាមលំដាប់) */
async function update(id, body) {
  const data = USE_MOCK ? await mockMenuSets.update(id, body) : await api.patch(`/menu-sets/${enc(id)}`, body);
  return toMenuSet(data);
}

/** PATCH /menu-sets/:id/archive */
async function archive(id) {
  const data = USE_MOCK ? await mockMenuSets.archive(id) : await api.patch(`/menu-sets/${enc(id)}/archive`);
  return toMenuSet(data);
}

/** DELETE /menu-sets/:id (FK ផ្សេង → 400 INVALID_REFERENCE) */
async function remove(id) {
  return USE_MOCK ? mockMenuSets.remove(id) : api.delete(`/menu-sets/${enc(id)}`);
}

export const menuSetService = { getList, getById, create, update, archive, remove };
