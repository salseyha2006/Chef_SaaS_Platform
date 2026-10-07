const ApiError = require('../utils/ApiError');

function mapZodIssue(issue) {
  switch (issue.code) {
    case 'invalid_type':
      return issue.received === 'undefined'
        ? { code: 'VALIDATION_REQUIRED' }
        : { code: 'VALIDATION_INVALID_TYPE', params: { expected: issue.expected } };

    case 'invalid_string':
      if (issue.validation === 'email') return { code: 'VALIDATION_INVALID_EMAIL' };
      if (issue.validation === 'uuid') return { code: 'VALIDATION_INVALID_ID' };
      if (issue.validation === 'url') return { code: 'VALIDATION_INVALID_URL' };
      if (issue.validation === 'datetime') return { code: 'VALIDATION_INVALID_DATETIME' };
      return { code: 'VALIDATION_INVALID_FORMAT' };

    case 'too_small':
      if (issue.exact) {
        return { code: 'VALIDATION_LENGTH_EXACT', params: { length: issue.minimum } };
      }
      if (issue.type === 'string') {
        return issue.minimum === 1
          ? { code: 'VALIDATION_REQUIRED' }
          : { code: 'VALIDATION_TOO_SHORT', params: { min: issue.minimum } };
      }
      if (issue.type === 'array') {
        return { code: 'VALIDATION_ARRAY_MIN', params: { min: issue.minimum } };
      }
      return {
        code: 'VALIDATION_TOO_SMALL',
        params: { min: issue.minimum, inclusive: issue.inclusive },
      };

    case 'too_big':
      if (issue.exact) {
        return { code: 'VALIDATION_LENGTH_EXACT', params: { length: issue.maximum } };
      }
      if (issue.type === 'string') {
        return { code: 'VALIDATION_TOO_LONG', params: { max: issue.maximum } };
      }
      if (issue.type === 'array') {
        return { code: 'VALIDATION_ARRAY_MAX', params: { max: issue.maximum } };
      }
      return {
        code: 'VALIDATION_TOO_BIG',
        params: { max: issue.maximum, inclusive: issue.inclusive },
      };

    case 'invalid_enum_value':
      return { code: 'VALIDATION_INVALID_OPTION', params: { options: issue.options } };

    default:
      return { code: 'VALIDATION_INVALID' };
  }
}

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        ...mapZodIssue(issue),
      }));
      return next(ApiError.badRequest('Validation failed', errors, { code: 'VALIDATION_FAILED' }));
    }
    req.body = result.data;
    next();
  };
}

module.exports = validate;
