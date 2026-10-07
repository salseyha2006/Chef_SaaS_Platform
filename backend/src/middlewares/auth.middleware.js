const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      ApiError.unauthorized('Access token is missing', { code: 'AUTH_ACCESS_TOKEN_MISSING' })
    );
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(
        ApiError.unauthorized('Access token has expired', { code: 'AUTH_ACCESS_TOKEN_EXPIRED' })
      );
    }
    return next(
      ApiError.unauthorized('Access token is invalid', { code: 'AUTH_ACCESS_TOKEN_INVALID' })
    );
  }

  req.chef = { id: decoded.id, email: decoded.email };
  next();
}

module.exports = requireAuth;
