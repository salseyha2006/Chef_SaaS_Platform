export const OTHER_KEY = '__other__';

/** 12.5 → "12.5", 16.8000000003 → "16.8" */
export const formatQuantity = (n) => String(Number(Number(n).toFixed(3)));

export const unitLabel = (unit) => unit?.abbreviation || unit?.name || '';

/**
 * Group ShoppingItem តាម Category (១ Level)
 * categoryById: Map<chefIngredientId, categoryName> — រក Category មិនឃើញ/ទទេ → OTHER_KEY (ដាក់ចុងក្រោយ)
 * ត្រឡប់ [{ key, total, items }] — ក្រុមតម្លៃធំ→តូច, គ្រឿងផ្សំតាមឈ្មោះ
 */
export function groupByCategory(items, categoryById) {
  const map = new Map();
  items.forEach((item) => {
    const key = categoryById.get(item.chefIngredientId) || OTHER_KEY;
    if (!map.has(key)) map.set(key, { key, total: 0, items: [] });
    const group = map.get(key);
    group.total += item.totalPrice;
    group.items.push(item);
  });
  return [...map.values()]
    .map((g) => ({ ...g, items: [...g.items].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName, 'km')) }))
    .sort((a, b) => (a.key === OTHER_KEY) - (b.key === OTHER_KEY) || b.total - a.total);
}

/** បញ្ជីរាប: តម្លៃធំ→តូច */
export const sortFlat = (items) => [...items].sort((a, b) => b.totalPrice - a.totalPrice);
