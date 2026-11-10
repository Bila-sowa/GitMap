import { isFiniteNumber } from '@/js/utils/matchers'
import { logger } from '@/js/utils/logger'
import { ParseError } from '@/js/errors'
import { createRateLimitData, isRateLimitHigh } from '@/js/utils/rateLimit'
import { GITHUB_API_ORIGIN } from './gitHubConstants'

class GitHubRateLimiter {
  #transport
  #latestData = null

  setTransport(transport) {
    this.#transport = transport
  }

  updateFromHeaders(headers) {
    const limitHeader = headers?.get?.('X-RateLimit-Limit') ?? null
    const remainingHeader = headers?.get?.('X-RateLimit-Remaining') ?? null
    const usedHeader = headers?.get?.('X-RateLimit-Used') ?? null
    if (limitHeader === null) return
    if (usedHeader === null && remainingHeader === null) return

    const limit = Number(limitHeader)
    const used = usedHeader === null ? limit - Number(remainingHeader) : Number(usedHeader)

    if (!isFiniteNumber(limit) || limit <= 0 || !isFiniteNumber(used) || used < 0) {
      logger.debug('Ignoring malformed GitHub rate limit headers.', {
        limitHeader,
        remainingHeader,
        usedHeader,
      })
      return
    }

    this.#latestData = createRateLimitData(limit, used)
  }

  getCachedRateLimitData() {
    return this.#latestData
  }

  checkIsRateLimitHigh(rateLimitData, percent = 70) {
    return isRateLimitHigh(rateLimitData, percent)
  }

  async getRateLimitData(options = {}) {
    const data = await this.#transport.getJson(`${GITHUB_API_ORIGIN}/rate_limit`, {
      signal: options.signal,
      userMessage: 'Failed to fetch rate limit data',
      context: 'getRateLimitData',
    })

    const core = data?.resources?.core
    if (!core) {
      throw new ParseError('Missing data.resources.core in GitHub rate_limit response', {
        userMessage: 'Invalid rate limit response format',
        context: 'getRateLimitData',
      })
    }

    const { limit, remaining, used } = core
    const usedCount = used ?? limit - remaining

    if (!isFiniteNumber(limit) || limit <= 0 || !isFiniteNumber(usedCount) || usedCount < 0) {
      throw new ParseError('Invalid core rate limit values in GitHub rate_limit response', {
        userMessage: 'Invalid rate limit response format',
        context: 'getRateLimitData',
      })
    }

    this.#latestData = createRateLimitData(limit, usedCount)

    return this.#latestData
  }
}

export default GitHubRateLimiter
