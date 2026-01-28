export const APP_CONSTANTS = {
  API_BASE_URL: '/api',
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  DATE_FORMAT: 'MM/DD/YYYY',
  DATETIME_FORMAT: 'MM/DD/YYYY HH:mm',
  CURRENCY: 'USD',
  DEBOUNCE_TIME: 300,
  REQUEST_TIMEOUT: 30000,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: 'Minimum length is {min} characters',
  MAX_LENGTH: 'Maximum length is {max} characters',
  PATTERN: 'Invalid format',
  MIN: 'Minimum value is {min}',
  MAX: 'Maximum value is {max}',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
