import { parseDecimal } from './number';

/** line = { chefIngredientId, name, unit, unitPrice:number, quantity:string } */
export const lineCost = (line) => {
  const q = parseDecimal(line.quantity);
  return Number.isFinite(q) && q > 0 ? q * Number(line.unitPrice || 0) : 0;
};

export const calcTotal = (lines) => lines.reduce((sum, l) => sum + lineCost(l), 0);

/** Body សម្រាប់ POST/PATCH /dishes (description/imageUrl ទទេ → មិនផ្ញើ: Gap #67) */
export function buildDishPayload(form) {
  const description = form.description.trim();
  const imageUrl = form.imageUrl.trim();
  return {
    name: form.name.trim(),
    ...(description ? { description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    tags: form.tags,
    ingredients: form.lines.map((l) => ({
      chefIngredientId: l.chefIngredientId,
      quantityUsed: parseDecimal(l.quantity),
    })),
  };
}

/** សម្រាប់ប្រៀបធៀប Dirty (Back → Modal បោះបង់) */
export const snapshotForm = (f) =>
  JSON.stringify({
    n: f.name.trim(),
    d: f.description.trim(),
    i: f.imageUrl.trim(),
    t: f.tags,
    l: f.lines.map((l) => [l.chefIngredientId, String(l.quantity).trim()]),
  });