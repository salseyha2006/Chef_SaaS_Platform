const crypto = require('crypto');

const OTP_EXPIRY_MINUTES = 10;

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function getOtpExpiry(minutes = OTP_EXPIRY_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = { generateOtp, getOtpExpiry, OTP_EXPIRY_MINUTES };