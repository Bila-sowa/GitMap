const isRecord = (value) => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const isString = (value) => {
  return typeof value === 'string'
}

const isBoolean = (value) => {
  return typeof value === 'boolean'
}

const isNonEmptyString = (value) => {
  return isString(value) && value.trim().length > 0
}

const isValidDate = (value) => {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value))
}

const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

const isFiniteNumber = (value) => {
  return Number.isFinite(value)
}

const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0
}

const isNumberInRange = (value, min, max) => {
  return isFiniteNumber(value) && value >= min && value <= max
}

const isIntegerInRange = (value, min, max) => {
  return Number.isInteger(value) && value >= min && value <= max
}

const isAbortError = (error) => {
  return error?.name === 'AbortError'
}

const matchSshUrl = (url) => {
  return isString(url) ? url.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?\/?$/i) : null
}

const matchHttpsUrl = (url) => {
  return isString(url)
    ? url.match(
        /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i,
      )
    : null
}

const isCorrectHttpStatus = (status) => {
  return isIntegerInRange(status, 100, 599)
}

export {
  isRecord,
  isString,
  isBoolean,
  isNonEmptyString,
  isValidDate,
  isPlainObject,
  isFiniteNumber,
  isPositiveInteger,
  isNumberInRange,
  isIntegerInRange,
  isAbortError,
  matchSshUrl,
  matchHttpsUrl,
  isCorrectHttpStatus,
}
