import { isFiniteNumber, isString } from './matchers.js'

const toTrimmedString = (value) => {
  return isString(value) ? value.trim() : ''
}

const toArray = (value) => {
  return Array.isArray(value) ? value : []
}

const toFiniteNumber = (value, fallback = 0) => {
  return isFiniteNumber(value) ? value : fallback
}

export { toTrimmedString, toArray, toFiniteNumber }
