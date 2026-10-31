function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value))
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false

  const prototype = Object.getPrototypeOf(value)

  return prototype === Object.prototype || prototype === null
}

export { isRecord, isNonEmptyString, isValidDate, isPlainObject }
