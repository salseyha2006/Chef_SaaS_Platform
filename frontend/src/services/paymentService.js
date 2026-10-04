import { api } from './api';
import { mockPayment } from './mock/mockPayment';
import { toSavedPaymentMethod, toSubscription, toTransaction } from '../utils/format';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const methodBody = ({ paymentMethod, savedPaymentMethodId } = {}) => ({
  ...(paymentMethod ? { paymentMethod } : {}),
  ...(savedPaymentMethodId ? { savedPaymentMethodId } : {}),
});

/** GET /billing/payment-methods → [{id, provider, last4, brand, isDefault}] */
async function getSavedMethods() {
  const data = USE_MOCK ? await mockPayment.savedMethods() : await api.get('/billing/payment-methods');
  return (data || []).map(toSavedPaymentMethod);
}

/**
 * POST /subscription/upgrade → { subscription, transaction }
 * បរាជ័យ: 400 PAYMENT_FAILED (params.reason, params.transactionId)
 */
async function upgrade({ planId, paymentMethod, savedPaymentMethodId }) {
  const body = { planId, ...methodBody({ paymentMethod, savedPaymentMethodId }) };
  const data = USE_MOCK ? await mockPayment.upgrade(body) : await api.post('/subscription/upgrade', body);
  return {
    subscription: toSubscription(data.subscription),
    transaction: toTransaction(data.transaction),
  };
}

/** POST /subscription/payments/:transactionId/retry → Transaction (បរាជ័យ: 400 PAYMENT_RETRY_FAILED) */
async function retry(transactionId, selection) {
  const body = methodBody(selection);
  const data = USE_MOCK
    ? await mockPayment.retry(transactionId, body)
    : await api.post(`/subscription/payments/${encodeURIComponent(transactionId)}/retry`, body);
  return toTransaction(data);
}

export const paymentService = { getSavedMethods, upgrade, retry };