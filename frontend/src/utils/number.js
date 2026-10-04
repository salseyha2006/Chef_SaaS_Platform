/** "1.5" ឬ "1,5" → 1.5 (មិនគាំទ្រសញ្ញាខណ្ឌពាន់) */
export const parseDecimal = (v) => Number(String(v ?? '').trim().replace(',', '.'));

/** Format 2 ខ្ទង់ ពេល blur (ទទេ/មិនមែនលេខ → រក្សាដើម) */
export function formatDecimal(v) {
  const raw = String(v ?? '').trim();
  const n = parseDecimal(raw);
  return raw !== '' && Number.isFinite(n) ? n.toFixed(2) : raw;
}