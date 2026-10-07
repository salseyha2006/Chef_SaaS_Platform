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

const registerLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  code: 'AUTH_REGISTER_RATE_LIMITED',
});

const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  code: 'AUTH_LOGIN_RATE_LIMITED',
});

const resendOtpLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  code: 'AUTH_RESEND_RATE_LIMITED',
});

module.exports = { registerLimiter, loginLimiter, resendOtpLimiter };
