export const FILTER_ALL = 'all';
export const FILTER_UNCATEGORIZED = 'uncategorized'; // មិនស្ថិតក្នុង Template ណាមួយ (US-56 S3)

const idsOf = (preset) => new Set(preset.ingredients.map((i) => i.id));

/** Filter ក្នុង Client (US-56 Tech Note). filter មិនស្គាល់ (Template ត្រូវបានលុប) → ទាំងអស់ */
export function filterItems(items, presets, filter) {
  if (filter === FILTER_ALL) return items;
  if (filter === FILTER_UNCATEGORIZED) {
    const inAny = new Set(presets.flatMap((p) => p.ingredients.map((i) => i.id)));
    return items.filter((i) => !inAny.has(i.chefIngredientId));
  }
  const preset = presets.find((p) => p.id === filter);
  if (!preset) return items;
  const ids = idsOf(preset);
  return items.filter((i) => ids.has(i.chefIngredientId));
}

/** ចំនួនគ្រឿងផ្សំក្នុង Event សម្រាប់ជម្រើសនីមួយៗ */
export function countByFilter(items, presets) {
  const byPreset = {};
  presets.forEach((p) => { byPreset[p.id] = filterItems(items, presets, p.id).length; });
  return {
    all: items.length,
    uncategorized: filterItems(items, presets, FILTER_UNCATEGORIZED).length,
    byPreset,
  };
}
