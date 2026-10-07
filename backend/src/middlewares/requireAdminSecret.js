const ApiError = require('../utils/ApiError');

function requireAdminSecret(req, res, next) {
  const secret = req.headers['x-admin-secret'];

  if (!process.env.ADMIN_SECRET) {
    return next(ApiError.internal('Admin access is not configured on this server'));
  }

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return next(ApiError.unauthorized('Invalid or missing admin secret', { code: 'ADMIN_UNAUTHORIZED' }));
  }

  next();
}

module.exports = requireAdminSecret;
