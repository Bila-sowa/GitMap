import { describe, test, expect, vi, afterEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { getApiWarning, isSkippableApiError } from '#/fixtures/github/gitHubClient'

describe('getRateLimitData (live GitHub API)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns numeric core rate limit values', { timeout: 20000 }, async () => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
    const client = new GitHubClient()
    let result

    try {
      result = await client.getRateLimitData()
    } catch (error) {
      if (!isSkippableApiError(error)) throw error

      console.log(`[WARN] ${getApiWarning(error)}`)
      return
    }

    expect(Number.isInteger(result.limitPerNumber)).toBe(true)
    expect(result.limitPerNumber).toBeGreaterThan(0)
    expect(Number.isInteger(result.usedPerNumber)).toBe(true)
    expect(result.usedPerNumber).toBeGreaterThanOrEqual(0)
    expect(result.usedPerNumber).toBeLessThanOrEqual(result.limitPerNumber)
    expect(typeof result.usedPerPercent).toBe('number')
    expect(result.usedPerPercent).toBeGreaterThanOrEqual(0)
    expect(result.usedPerPercent).toBeLessThanOrEqual(100)
  })
})
