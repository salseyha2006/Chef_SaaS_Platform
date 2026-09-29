const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

function buildLimiter({ windowMs, max, code }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      next(
        new ApiError(429, 'Too many requests, please try again later', [], {
          code,
          params: { minutes: Math.ceil(options.windowMs / 60000) },
        })
      );
    },
  });
}

// US-02 Technical Note: rate limit registration per IP/device
const registerLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  code: 'AUTH_REGISTER_RATE_LIMITED',
});

// US-05 Technical Note: rate limit login attempts per IP (in addition to per-account lockout)
const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  code: 'AUTH_LOGIN_RATE_LIMITED',
});

// Defense-in-depth per-IP layer, on top of the per-account 3-in-10-min limit in the controller
const resendOtpLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  code: 'AUTH_RESEND_RATE_LIMITED',
});

module.exports = { registerLimiter, loginLimiter, resendOtpLimiter };