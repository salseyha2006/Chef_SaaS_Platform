import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const DAY = 86400000;
const REFUND_WINDOW_DAYS = 7;

/**
 * Mock ក្នុង Memory (Reset ពេល Refresh)។ ទទេ: localStorage.setItem('mock.tx','empty')
 * tx-mock-1 = failed (សាកល្បង Retry) · tx-a = refund បាន · tx-b = ហួស 7 ថ្ងៃ · tx-d = កំពុងពិនិត្យ · tx-c = refunded
 */
const ago = (days) => new Date(Date.now() - days * DAY).toISOString();
const make = (id, days, status, extra = {}) => ({
  id,
  amount: '19.00',
  currency: 'USD',
  status,
  createdAt: ago(days),
  invoiceNumber: status === 'FAILED' ? null : `INV-${id.toUpperCase()}`,
  paymentMethod: 'ABA_PAYWAY',
  plan: { name: 'Pro' },
  refundStatus: null,
  ...extra,
});

function seed() {
  const base = [
    make('tx-mock-1', 1, 'FAILED'),
    make('tx-a', 2, 'SUCCESS'),
    make('tx-d', 5, 'SUCCESS', { refundStatus: 'REQUESTED', refundReason: 'កាត់ប្រាក់ខុសប្រក្រតី' }),
    make('tx-b', 40, 'SUCCESS'),
    make('tx-c', 70, 'REFUNDED', { refundStatus: 'APPROVED' }),
  ];
  const filler = Array.from({ length: 30 }, (_, i) =>
    make(`tx-f${i + 1}`, 100 + i * 30, 'SUCCESS', { amount: '9.00', plan: { name: 'Basic' } }),
  );
  return [...base, ...filler];
}

let rows = seed();

const fail = (status, code, message, errors) => {
  throw new ApiError({ status, code, message, errors });
};
const find = (id) => {
  const row = rows.find((r) => r.id === id);
  if (!row) fail(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
  return row;
};

/** mockPayment ហៅ: បន្ថែម/ជំនួស Transaction (តាម id) ដាក់លើគេ */
export function recordMockTransaction(raw) {
  rows = [raw, ...rows.filter((r) => r.id !== raw.id)];
}
/** mockPayment.retry ជោគជ័យ */
export function markMockTransactionPaid(id) {
  rows = rows.map((r) =>
    r.id === id ? { ...r, status: 'SUCCESS', invoiceNumber: `INV-${id.toUpperCase()}` } : r,
  );
}

const MOCK_PDF =
  '%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
  '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF';

export const mockBilling = {
  /** GET /billing/transactions (createdAt↓) */
  async list() {
    await delay(500);
    if (safeStorage.get('mock.tx') === 'empty') return [];
    return rows.map((r) => ({ ...r }));
  },

  /** GET /billing/transactions/:id → Transaction + plan + chef */
  async get(id) {
    await delay(350);
    return { ...find(id), chef: { email: 'demo@chef.com', displayName: 'Demo Chef' } };
  },

  /** GET /billing/transactions/:id/invoice → PDF Blob */
  async invoice(id) {
    await delay(600);
    find(id);
    return new Blob([MOCK_PDF], { type: 'application/pdf' });
  },

  /** POST /billing/transactions/:id/refund-request */
  async requestRefund(id, { reason }) {
    await delay(700);
    const row = find(id);
    if (row.refundStatus) fail(409, 'REFUND_ALREADY_REQUESTED', 'Refund already requested');
    const tooOld = Date.now() - new Date(row.createdAt).getTime() > REFUND_WINDOW_DAYS * DAY;
    if (row.status !== 'SUCCESS' || tooOld) fail(400, 'REFUND_NOT_ALLOWED', 'Refund not allowed');
    const updated = { ...row, refundStatus: 'REQUESTED', refundReason: reason };
    rows = rows.map((r) => (r.id === id ? updated : r));
    return { ...updated };
  },

  /** PATCH /billing/info (upsert) */
  async updateInfo(body) {
    await delay(600);
    const errors = [];
    const tooShort = (v, min) => v !== undefined && String(v).trim().length < min;
    if (tooShort(body.billingName, 2)) errors.push({ field: 'billingName', message: 'Too short', code: 'VALIDATION_TOO_SHORT' });
    if (tooShort(body.shopAddress, 2)) errors.push({ field: 'shopAddress', message: 'Too short', code: 'VALIDATION_TOO_SHORT' });
    if (tooShort(body.phoneNumber, 6)) errors.push({ field: 'phoneNumber', message: 'Too short', code: 'VALIDATION_TOO_SHORT' });
    if (errors.length) fail(400, 'VALIDATION_FAILED', 'Validation failed', errors);
    return { id: 'mock-billing-info', ...body };
  },
};