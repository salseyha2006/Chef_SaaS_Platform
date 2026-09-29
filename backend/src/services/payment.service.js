const ApiError = require('../utils/ApiError');
const abaPaywayService = require('./abaPayway.service');

// US-18 Technical Note: abstraction layer so a new gateway (Stripe, Wing, ...) can be
// added later without touching subscription/payment business logic elsewhere.
const PROVIDERS = {
  ABA_PAYWAY: abaPaywayService,
};

function getProvider(paymentMethod) {
  const provider = PROVIDERS[paymentMethod];
  if (!provider) {
    throw ApiError.badRequest(
      `Payment method ${paymentMethod} is not yet supported`,
      [],
      { code: 'PAYMENT_METHOD_UNSUPPORTED', params: { method: paymentMethod } }
    );
  }
  return provider;
}

async function charge(paymentMethod, params) {
  const provider = getProvider(paymentMethod);
  return provider.charge(params);
}

module.exports = { charge, getProvider };