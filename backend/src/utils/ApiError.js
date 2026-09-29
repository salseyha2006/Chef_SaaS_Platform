const DEFAULT_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_ERROR',
};

class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message  English fallback text (Frontend should translate by `code`)
   * @param {Array}  errors   extra details (e.g. per-field validation errors)
   * @param {{ code?: string, params?: object }} options
   */
  constructor(statusCode, message, errors = [], { code, params } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.code = code || DEFAULT_CODES[statusCode] || 'ERROR';
    this.params = params;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = [], options) {
    return new ApiError(400, message, errors, options);
  }

  static unauthorized(message = 'Unauthorized', options) {
    return new ApiError(401, message, [], options);
  }

  static forbidden(message = 'Forbidden', options) {
    return new ApiError(403, message, [], options);
  }

  static notFound(message = 'Resource not found', options) {
    return new ApiError(404, message, [], options);
  }

  static conflict(message = 'Conflict', options) {
    return new ApiError(409, message, [], options);
  }

  static internal(message = 'Internal server error', options) {
    return new ApiError(500, message, [], options);
  }
}

module.exports = ApiError;