/**
 * MOCK IMPLEMENTATION — replace with real ABA PayWay API calls
 * once merchant credentials & API docs are available.
 * Keep the function signatures the same so callers don't need to change.
 */

async function charge({ amount, currency, chefEmail, description, savedToken, idempotencyKey }) {
  // TODO: pass `idempotencyKey` as the gateway's idempotency header (US-19 Technical Note)
  // TODO: if `savedToken` is present, charge that stored card instead of prompting for new details
  const isSuccess = Math.random() > 0.1;

  if (!isSuccess) {
    return {
      success: false,
      gatewayRef: null,
      failureReason: 'Card declined by issuing bank (simulated)',
    };
  }

  return {
    success: true,
    gatewayRef: `ABA-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    failureReason: null,
  };
}

async function verifyTransaction(gatewayRef) {
  return { verified: true, gatewayRef };
}

module.exports = { charge, verifyTransaction };