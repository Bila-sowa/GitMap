import {
  isBoolean,
  isFiniteNumber,
  isIntegerInRange,
  isNonEmptyString,
  isPlainObject,
  isString,
} from './matchers.js'
import { RangeValidationError, ValidationError } from '@/js/errors'

const fail = (message, options) => {
  throw new ValidationError(message, options)
}

const assert = (condition, message, options = {}) => {
  if (condition) return

  fail(message, options)
}

const assertPlainObject = (value, message, options = {}) => {
  assert(isPlainObject(value), message, options)
}

const assertString = (value, message, options = {}) => {
  assert(isString(value), message, options)
}

const assertNonEmptyString = (value, message, options = {}) => {
  assert(isNonEmptyString(value), message, options)
}

const assertBoolean = (value, message, options = {}) => {
  assert(isBoolean(value), message, options)
}

const assertArray = (value, message, options = {}) => {
  assert(Array.isArray(value), message, options)
}

const assertFiniteNumber = (value, message, options = {}) => {
  assert(isFiniteNumber(value), message, options)
}

const assertIntegerInRange = (value, min, max, message, options = {}) => {
  if (isIntegerInRange(value, min, max)) return

  throw new RangeValidationError(message, options)
}

export {
  assert,
  assertArray,
  assertBoolean,
  assertFiniteNumber,
  assertIntegerInRange,
  assertNonEmptyString,
  assertPlainObject,
  assertString,
}
