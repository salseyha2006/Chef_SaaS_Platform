const pad = (n) => String(n).padStart(2, '0');

/** ISO → 'YYYY-MM-DD' (ម៉ោងក្នុងស្រុក) សម្រាប់ <input type="date"> */
export function toDateInput(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' → ISO datetime ម៉ោង 12:00 ក្នុងស្រុក (កុំឱ្យ Timezone រំកិលថ្ងៃ — Gap #89) */
export function fromDateInput(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

export const isValidDateInput = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T00:00:00`).getTime());

/** Event "កំពុងមក" = កាលបរិច្ឆេទ ≥ ថ្ងៃនេះ 00:00 (Client Rule — Gap #87/#88) */
export function isUpcoming(iso) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return new Date(iso).getTime() >= start.getTime();
}

export function formatEventDate(iso, lang) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'km' ? 'km-KH' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return toDateInput(iso);
  }
}

/** form = { name, eventDate:'YYYY-MM-DD', tableCount:string } → Body POST/PATCH /events */
export const buildEventPayload = (form) => ({
  name: form.name.trim(),
  eventDate: fromDateInput(form.eventDate),
  tableCount: Number(form.tableCount),
});

/** សម្រាប់ប្រៀបធៀប Dirty (Back → Modal បោះបង់) */
export const snapshotForm = (f) =>
  JSON.stringify({ n: f.name.trim(), d: f.eventDate, t: String(f.tableCount).trim() });

/** ថ្ងៃ iso នៅក្នុងខែ/ឆ្នាំដូច ref (ម៉ោងក្នុងស្រុក). ref លំនាំដើម = ឥឡូវនេះ */
export function isSameMonth(iso, ref = new Date()) {
  const d = new Date(iso);
  return !Number.isNaN(d.getTime()) && d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}
