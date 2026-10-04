import i18n from '../i18n';
import { getErrorMessage } from './errors';

const PAYMENT_ERROR_CODES = ['PAYMENT_FAILED', 'PAYMENT_RETRY_FAILED'];

/** សារបរាជ័យបង់ប្រាក់: Map params.reason → payment:reasons.*; ផ្សេងទៀតប្រើ getErrorMessage */
export function getPaymentFailureMessage(err) {
  if (PAYMENT_ERROR_CODES.includes(err?.code)) {
    const reason = err.params?.reason;
    const key = `payment:reasons.${reason}`;
    return reason && i18n.exists(key) ? i18n.t(key) : i18n.t('payment:processing.failedGeneric');
  }
  return getErrorMessage(err);
}