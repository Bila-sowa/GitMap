import { describe, test, expect, vi, afterEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { getHttpErrorStatus } from '#/fixtures/github/gitHubClient'

const EMPTY_RATE_LIMIT_DATA = { limitPerNumber: 0, usedPerNumber: 0, usedPerPercent: 0 }

describe('getRateLimitData (live GitHub API)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns numeric core rate limit values', { timeout: 20000 }, async () => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
    const client = new GitHubClient()

    const result = await client.getRateLimitData()
    const httpErrorStatus = getHttpErrorStatus(result)

    if (httpErrorStatus !== null) {
      console.log(`[WARN] GitHub API error (HTTP ${httpErrorStatus}): ${result.error}`)

      expect(result.success).toBe(false)
      expect(result.data).toStrictEqual(EMPTY_RATE_LIMIT_DATA)
      return
    }

    expect(result.success, result.error).toBe(true)

    const { limitPerNumber, usedPerNumber, usedPerPercent } = result.data

    expect(Number.isInteger(limitPerNumber)).toBe(true)
    expect(limitPerNumber).toBeGreaterThan(0)
    expect(Number.isInteger(usedPerNumber)).toBe(true)
    expect(usedPerNumber).toBeGreaterThanOrEqual(0)
    expect(usedPerNumber).toBeLessThanOrEqual(limitPerNumber)
    expect(typeof usedPerPercent).toBe('number')
    expect(usedPerPercent).toBeGreaterThanOrEqual(0)
    expect(usedPerPercent).toBeLessThanOrEqual(100)
  })
})
