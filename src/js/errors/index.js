const APP_ERROR = Symbol.for('gitmap.appError')

const applyErrorDetails = (error, options = {}) => {
  const { cause, userMessage, code, context, ...details } = options

  error[APP_ERROR] = true
  error.userMessage = userMessage === undefined ? error.message : userMessage
  if (cause !== undefined) error.cause = cause
  if (code !== undefined) error.code = code
  if (context !== undefined) error.context = context

  Object.assign(error, details)

  return error
}

class ValidationError extends TypeError {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ValidationError'
    applyErrorDetails(this, { code: 'VALIDATION', ...options })
  }
}

class RangeValidationError extends RangeError {
  constructor(message, options = {}) {
    super(message)
    this.name = 'RangeValidationError'
    applyErrorDetails(this, { code: 'RANGE_VALIDATION', ...options })
  }
}

class ParseError extends SyntaxError {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ParseError'
    applyErrorDetails(this, { code: 'PARSE', ...options })
  }
}

class NetworkError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'NetworkError'
    applyErrorDetails(this, { code: 'NETWORK', ...options })
  }
}

class TimeoutError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'TimeoutError'
    applyErrorDetails(this, { code: 'TIMEOUT', ...options })
  }
}

class AbortError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'AbortError'
    applyErrorDetails(this, { code: 'ABORT', ...options })
  }
}

class HttpError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'HttpError'

    const status = options.status ?? null

    applyErrorDetails(this, {
      code: status === null ? 'HTTP' : `HTTP_${status}`,
      ...options,
    })
    this.status = status
    this.url = options.url ?? ''
    this.apiMessage = options.apiMessage ?? ''
  }
}

class StorageError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'StorageError'
    applyErrorDetails(this, { code: 'STORAGE', ...options })
  }
}

class CryptoError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'CryptoError'
    applyErrorDetails(this, { code: 'CRYPTO', ...options })
  }
}

class ConfigError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ConfigError'
    applyErrorDetails(this, { code: 'CONFIG', ...options })
  }
}

const isAppError = (error) => {
  return Boolean(error?.[APP_ERROR])
}

const getUserMessage = (error, fallback = 'Something went wrong') => {
  if (typeof error?.userMessage === 'string' && error.userMessage) return error.userMessage

  return fallback
}

export {
  AbortError,
  ConfigError,
  CryptoError,
  HttpError,
  NetworkError,
  ParseError,
  RangeValidationError,
  StorageError,
  TimeoutError,
  ValidationError,
  getUserMessage,
  isAppError,
}
