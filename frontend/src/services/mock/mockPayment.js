import { ApiError } from '../api';
import { safeStorage } from '../../utils/storage';
import { MOCK_SUB_KEY, mockSubscription } from './mockSubscription';
import { markMockTransactionPaid, recordMockTransaction } from './mockBilling';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * សាកល្បង: Console →
 *   localStorage.setItem('mock.pay', 'fail')            // success | fail | fail-then-success
 *   localStorage.setItem('mock.saved', 'none')          // លាក់ Saved method (សាកល្បង Validation)
 */
const PAY_KEY = 'mock.pay';
const SAVED_KEY = 'mock.saved';
const SUPPORTED = ['ABA_PAYWAY'];
const TX_ID = 'tx-mock-1';
let failedOnce = false;

const SAVED = [
  { id: 'pm-1', provider: 'ABA_PAYWAY', last4: '4242', brand: 'ABA', isDefault: true, createdAt: new Date().toISOString() },
];

const mode = () => {
  const v = safeStorage.get(PAY_KEY);
  return ['success', 'fail', 'fail-then-success'].includes(v) ? v : 'success';
};

const fail = (status, code, message, params, errors) => {
  throw new ApiError({ status, code, message, params, errors });
};

function validateMethod({ paymentMethod, savedPaymentMethodId }) {
  if (paymentMethod && !SUPPORTED.includes(paymentMethod)) {
    fail(400, 'PAYMENT_METHOD_UNSUPPORTED', 'Payment method unsupported');
  }
  if (savedPaymentMethodId) {
    const saved = SAVED.find((s) => s.id === savedPaymentMethodId);
    if (!saved) fail(400, 'PAYMENT_METHOD_NOT_FOUND', 'Payment method not found');
    if (paymentMethod && saved.provider !== paymentMethod) {
      fail(400, 'PAYMENT_METHOD_MISMATCH', 'Payment method mismatch');
    }
  }
}

const activate = () => safeStorage.set(MOCK_SUB_KEY, 'active');

export const mockPayment = {
  /** GET /billing/payment-methods */
  async savedMethods() {
    await delay(300);
    return safeStorage.get(SAVED_KEY) === 'none' ? [] : SAVED.map((s) => ({ ...s }));
  },

  /** POST /subscription/upgrade → { subscription, transaction } */
  async upgrade(body) {
    await delay(1800); // ឱ្យឃើញ Overlay
    validateMethod(body);
    const plan = (await mockSubscription.plans()).find((p) => p.id === body.planId);
    if (!plan) fail(404, 'PLAN_NOT_FOUND', 'Plan not found');
    
    const base = {
      id: TX_ID,
      amount: plan.price,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      paymentMethod: body.paymentMethod || 'ABA_PAYWAY',
      plan: { name: plan.name },
      refundStatus: null,
    };
    
    const m = mode();
    if (m === 'fail' || (m === 'fail-then-success' && !failedOnce)) {
      failedOnce = true;
      recordMockTransaction({ ...base, status: 'FAILED', invoiceNumber: null });
      fail(400, 'PAYMENT_FAILED', 'Payment failed', { reason: 'CARD_DECLINED', transactionId: TX_ID }, [
        { transactionId: TX_ID },
      ]);
    }
    
    failedOnce = false;
    activate();
    
    const transaction = { ...base, status: 'SUCCESS', invoiceNumber: 'INV-0001' };
    recordMockTransaction(transaction);
    
    return { subscription: await mockSubscription.me(), transaction };
  },

  /** POST /subscription/payments/:transactionId/retry → Transaction */
  async retry(transactionId, body) {
    await delay(1800);
    if (transactionId !== TX_ID) fail(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found');
    validateMethod(body);
    if (mode() === 'fail') {
      fail(400, 'PAYMENT_RETRY_FAILED', 'Retry failed', { reason: 'INSUFFICIENT_FUNDS', transactionId });
    }
    failedOnce = false;
    markMockTransactionPaid(transactionId);
    activate();
    return {
      id: TX_ID, amount: '19.00', currency: 'USD', status: 'SUCCESS',
      createdAt: new Date().toISOString(), invoiceNumber: 'INV-0001',
    };
  },
};