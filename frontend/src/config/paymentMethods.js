/**
 * មធ្យោបាយបង់ប្រាក់ (UX 5.1). supported=false → បង្ហាញ Disabled "ឆាប់ៗនេះ"
 * Backend បច្ចុប្បន្នគាំទ្រតែ ABA_PAYWAY (Gap #5/8) — ប្តូរទៅ true ពេល Backend ត្រៀមរួច
 */
export const PAYMENT_METHODS = [
  { id: 'ABA_PAYWAY', supported: true },
  { id: 'VISA_MASTERCARD', supported: false },
  { id: 'WING', supported: false },
];

export const isMethodSupported = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.supported ?? false;