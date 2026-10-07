const crypto = require('crypto');

// OTPs are short-lived and rate-limited, so a fast SHA-256 hash is enough —
// no need for bcrypt's deliberate slowness here.
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

module.exports = { hashOtp };
