import { toFiniteNumber } from './coercions.js'
import { isRecord } from './matchers.js'

const EMPTY_RATE_LIMIT_DATA = Object.freeze({
  limitPerNumber: 0,
  usedPerNumber: 0,
  usedPerPercent: 0,
})

const createRateLimitData = (limit, used) => {
  return {
    limitPerNumber: limit,
    usedPerNumber: used,
    usedPerPercent: limit > 0 ? Number(((used / limit) * 100).toFixed(2)) : 0,
  }
}

const normalizeRateLimitData = (rateLimit) => {
  const source = isRecord(rateLimit) ? rateLimit : {}
  const usedPerPercent = toFiniteNumber(source.usedPerPercent, 0)

  return {
    limitPerNumber: toFiniteNumber(source.limitPerNumber, 0),
    usedPerNumber: toFiniteNumber(source.usedPerNumber, 0),
    usedPerPercent: Math.min(Math.max(usedPerPercent, 0), 100),
  }
}

export { EMPTY_RATE_LIMIT_DATA, createRateLimitData, normalizeRateLimitData }
