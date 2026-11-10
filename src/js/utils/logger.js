const REDACTED = '[redacted]'
const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /github_pat_[A-Za-z0-9_]+/g,
  /gh[pousr]_[A-Za-z0-9]+/gi,
]

let debugEnabled = false

const redact = (value) => {
  if (typeof value !== 'string') return value

  return SECRET_PATTERNS.reduce((result, pattern) => result.replace(pattern, REDACTED), value)
}

const sanitize = (value, seen = new WeakSet()) => {
  if (typeof value === 'string') return redact(value)

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redact(value.message),
      code: value.code,
      cause: value.cause === undefined ? undefined : sanitize(value.cause, seen),
    }
  }

  if (value === null || typeof value !== 'object') return value

  if (seen.has(value)) return '[circular]'
  seen.add(value)

  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen))

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitize(item, seen)]))
}

const write = (method, message, details) => {
  console[method](redact(message), ...details.map((detail) => sanitize(detail)))
}

class Logger {
  setDebug(enabled) {
    debugEnabled = Boolean(enabled)
  }

  isDebugEnabled() {
    return debugEnabled
  }

  debug(message, ...details) {
    if (!debugEnabled) return

    write('debug', message, details)
  }

  info(message, ...details) {
    if (!debugEnabled) return

    write('info', message, details)
  }

  warn(message, ...details) {
    write('warn', message, details)
  }

  error(message, ...details) {
    write('error', message, details)
  }
}

const logger = new Logger()

export { Logger, logger, redact, sanitize }
