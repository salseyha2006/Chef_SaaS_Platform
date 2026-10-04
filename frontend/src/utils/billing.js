export const TX_STATUS_TONE = { success: 'success', failed: 'danger', refunded: 'neutral', pending: 'warning' };
export const REFUND_TONE = { requested: 'warning', approved: 'success', rejected: 'danger' };

/** US-23 S3: Invoice សម្រាប់តែប្រតិបត្តិការជោគជ័យ */
export const canDownloadInvoice = (tx) => tx?.status === 'success';
/** US-25: ប៊ូតុង Refund សម្រាប់ជោគជ័យ ហើយមិនទាន់ស្នើ (Window ត្រួតពិនិត្យដោយ Backend) */
export const canRequestRefund = (tx) => tx?.status === 'success' && !tx?.refundStatus;
/** US-20 S2 */
export const canRetryPayment = (tx) => tx?.status === 'failed';

/** ក្រុមតាមខែ (UX 6.2) — រក្សាលំដាប់ដើម */
export function groupByMonth(list) {
  const map = new Map();
  list.forEach((tx) => {
    const d = new Date(tx.createdAt);
    const key = Number.isNaN(d.getTime())
      ? 'unknown'
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(tx);
  });
  return [...map.entries()].map(([key, items]) => ({ key, items }));
}