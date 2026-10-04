import { normalizeName } from './catalog';

/** Item ទាំងអស់ក្នុង Group (Parent) */
export const groupItems = (group) => group.subs.flatMap((s) => s.items);

/**
 * ច្រោះ Tree តាមពាក្យ (US-31 S4): ត្រូវនឹងឈ្មោះ Item ឬឈ្មោះ Group/Sub (បង្ហាញ Item ទាំងអស់ក្នុងនោះ)
 * លាក់ Sub/Group ទទេ (UX 8.1 Edge case)
 */
export function filterTree(groups, query) {
  const q = normalizeName(query);
  if (!q) return groups;
  const hit = (s) => normalizeName(s).includes(q);
  return groups
    .map((g) => {
      const gHit = hit(g.name);
      return {
        ...g,
        subs: g.subs
          .map((s) => {
            const all = gHit || (s.name && hit(s.name));
            return { ...s, items: all ? s.items : s.items.filter((i) => hit(i.name)) };
          })
          .filter((s) => s.items.length > 0),
      };
    })
    .filter((g) => g.subs.length > 0);
}

/**
 * ស្ថានភាព Checkbox របស់ Group/Sub (គិតតែ Item ដែលជ្រើសបាន = មិនទាន់ Import)
 * ទាំងអស់ Import រួច → checked + disabled
 */
export function checkState(items, selected) {
  const selectable = items.filter((i) => !i.isImported);
  const n = selectable.filter((i) => selected.has(i.id)).length;
  const disabled = selectable.length === 0;
  return {
    selectable,
    disabled,
    checked: disabled || n === selectable.length,
    indeterminate: n > 0 && n < selectable.length,
  };
}