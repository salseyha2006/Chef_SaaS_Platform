/** selected[] = [{ dishId, name, imageUrl, cost:number }] (លំដាប់ = sortOrder) */
export const calcTotal = (selected) => selected.reduce((sum, d) => sum + Number(d.cost || 0), 0);

/** Body សម្រាប់ POST/PATCH /menu-sets (dishIds = ជំនួសទាំងអស់ តាមលំដាប់) */
export const buildMenuSetPayload = (name, selected) => ({
  name: name.trim(),
  dishIds: selected.map((d) => d.dishId),
});

/** សម្រាប់ប្រៀបធៀប Dirty (Back → Modal បោះបង់) */
export const snapshotForm = (name, selected) =>
  JSON.stringify({ n: name.trim(), d: selected.map((s) => s.dishId) });
