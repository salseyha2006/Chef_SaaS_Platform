const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  let error = err;

  if (error.code === 'P2002') {
    error = ApiError.conflict(`Duplicate value for field: ${error.meta?.target}`, {
      code: 'DUPLICATE_VALUE',
      params: { field: error.meta?.target },
    });
  } else if (error.code === 'P2003') {
    error = ApiError.badRequest('Invalid reference to another record', [], {
      code: 'INVALID_REFERENCE',
    });
  } else if (error.code === 'P2025') {
    error = ApiError.notFound('Record not found', { code: 'RECORD_NOT_FOUND' });
  } else if (error.type === 'entity.parse.failed') {
    error = ApiError.badRequest('Invalid JSON body', [], { code: 'INVALID_JSON' });
  } else if (error.type === 'entity.too.large') {
    error = new ApiError(413, 'Request body is too large', [], { code: 'PAYLOAD_TOO_LARGE' });
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(error.statusCode || 500, error.message || 'Internal server error');
  }

  if (error.statusCode >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') {
      error = ApiError.internal('Internal server error');
    }
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    params: error.params,
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
  });
}

module.exports = errorHandler;
