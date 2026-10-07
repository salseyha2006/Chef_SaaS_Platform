import { parseDecimal } from './number';
import { formatQuantity, unitLabel } from './shopping';

/** ShoppingItem[] → បន្ទាត់កែបាន [{ id, name, unit, quantity:string }] (គ្មានតម្លៃ — Business Secret) */
export const buildLines = (items) =>
  items.map((i) => ({
    id: i.chefIngredientId,
    name: i.ingredientName,
    unit: unitLabel(i.unit),
    quantity: formatQuantity(i.totalQuantity),
  }));

/** StockItem (UI) → បន្ទាត់ថ្មី បរិមាណទទេ (ត្រូវបំពេញមុន Generate) */
export const lineFromStock = (s) => ({
  id: s.id,
  name: s.name,
  unit: s.unit?.abbreviation || s.unit?.name || '',
  quantity: '',
});

/** ត្រឡប់ { [lineId]: 'qtyRequired' | 'qtyPositive' } — Key ក្នុង i18n `report.validation.*` */
export function validateLines(lines) {
  const errors = {};
  lines.forEach((l) => {
    const raw = String(l.quantity).trim();
    if (raw === '') errors[l.id] = 'qtyRequired';
    else if (!(parseDecimal(raw) > 0)) errors[l.id] = 'qtyPositive';
  });
  return errors;
}

/** Body POST /events/:id/reports/pdf — មានតែ ឈ្មោះ + បរិមាណ + ខ្នាត (ហាមដាក់តម្លៃ) */
export const toPdfPayload = (title, lines) => ({
  ...(title.trim() ? { title: title.trim() } : {}),
  items: lines.map((l) => ({
    ingredientName: l.name,
    totalQuantity: parseDecimal(l.quantity),
    unit: { abbreviation: l.unit },
  })),
});

/** សម្រាប់ប្រៀបធៀប Dirty (Back → Modal បោះបង់) */
export const snapshot = (title, lines) =>
  JSON.stringify({ t: title.trim(), l: lines.map((l) => [l.id, String(l.quantity).trim()]) });
