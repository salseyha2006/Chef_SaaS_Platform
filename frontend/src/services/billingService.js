import { api, getBlob } from './api';
import { mockBilling } from './mock/mockBilling';
import { toTransaction } from '../utils/format';
import { shareOrDownloadFile } from '../utils/file';
import { safeStorage } from '../utils/storage';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/** GET /billing/transactions → Transaction[] (Backend តម្រៀប createdAt↓; តម្រៀបម្តងទៀតសុវត្ថិភាព) */
async function getTransactions() {
  const data = USE_MOCK ? await mockBilling.list() : await api.get('/billing/transactions');
  return (data || [])
    .map(toTransaction)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/** GET /billing/transactions/:id (404 TRANSACTION_NOT_FOUND) */
async function getTransaction(id) {
  const data = USE_MOCK ? await mockBilling.get(id) : await api.get(`/billing/transactions/${encodeURIComponent(id)}`);
  return toTransaction(data);
}

/** GET /billing/transactions/:id/invoice (PDF) → 'shared' | 'cancelled' | 'downloaded' */
async function downloadInvoice(tx) {
  const filename = `invoice-${tx.invoiceNumber || tx.id}.pdf`;
  const blob = USE_MOCK
    ? await mockBilling.invoice(tx.id)
    : await getBlob(`/billing/transactions/${encodeURIComponent(tx.id)}/invoice`);
  return shareOrDownloadFile(blob, filename);
}

/** POST /billing/transactions/:id/refund-request {reason} → Transaction (refundStatus:'REQUESTED') */
async function requestRefund(id, reason) {
  const body = { reason };
  const data = USE_MOCK
    ? await mockBilling.requestRefund(id, body)
    : await api.post(`/billing/transactions/${encodeURIComponent(id)}/refund-request`, body);
  return toTransaction(data);
}

// ⚠️ Contract គ្មាន GET /billing/info (Gap #37) → Cache ក្នុង Device នេះ ដើម្បី Prefill
const infoKey = (chefId) => `chef.billingInfo.${chefId}`;

function getCachedInfo(chefId) {
  if (!chefId) return null;
  try {
    return JSON.parse(safeStorage.get(infoKey(chefId)) || 'null');
  } catch {
    return null;
  }
}

/** PATCH /billing/info → BillingInfo (upsert). Field ទទេមិនត្រូវផ្ញើ (Contract min length) */
async function updateInfo(chefId, { billingName, shopAddress, phoneNumber }) {
  const body = {
    billingName,
    shopAddress,
    ...(phoneNumber ? { phoneNumber } : {}),
  };
  const data = USE_MOCK ? await mockBilling.updateInfo(body) : await api.patch('/billing/info', body);
  if (chefId) {
    safeStorage.set(infoKey(chefId), JSON.stringify({ billingName, shopAddress, phoneNumber: phoneNumber || '' }));
  }
  return data;
}

export const billingService = {
  getTransactions,
  getTransaction,
  downloadInvoice,
  requestRefund,
  getCachedInfo,
  updateInfo,
};