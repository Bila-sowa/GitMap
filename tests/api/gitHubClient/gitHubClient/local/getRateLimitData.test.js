import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { createResponse, useFetch } from '#/fixtures/github/gitHubClient'
import { HttpError, ParseError } from '@/js/errors'

const RATE_LIMIT_URL = 'https://api.github.com/rate_limit'

describe('getRateLimitData', () => {
  const client = new GitHubClient()

  beforeEach(() => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('parses the core rate limit and computes the used percentage', async () => {
    const requests = useFetch(
      createResponse({
        body: { resources: { core: { limit: 60, remaining: 47, used: 13 } } },
        url: RATE_LIMIT_URL,
      }),
      RATE_LIMIT_URL,
    )

    const result = await client.getRateLimitData()

    expect(result).toStrictEqual({
      limitPerNumber: 60,
      usedPerNumber: 13,
      usedPerPercent: 21.67,
    })
    expect(requests).toStrictEqual([RATE_LIMIT_URL])
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('derives the used count from the remaining count', async () => {
    useFetch(
      createResponse({
        body: { resources: { core: { limit: 60, remaining: 45 } } },
        url: RATE_LIMIT_URL,
      }),
      RATE_LIMIT_URL,
    )

    const result = await client.getRateLimitData()

    expect(result).toStrictEqual({
      limitPerNumber: 60,
      usedPerNumber: 15,
      usedPerPercent: 25,
    })
  })

  test('reports when the used percentage reaches the warning threshold', async () => {
    useFetch(
      createResponse({
        body: { resources: { core: { limit: 60, remaining: 18, used: 42 } } },
        url: RATE_LIMIT_URL,
      }),
      RATE_LIMIT_URL,
    )

    const result = await client.getRateLimitData()

    expect(result).toStrictEqual({
      limitPerNumber: 60,
      usedPerNumber: 42,
      usedPerPercent: 70,
    })
    expect(client.checkIsRateLimitHigh(result)).toBe(true)
    expect(client.checkIsRateLimitHigh({ usedPerPercent: 69 })).toBe(false)
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws ParseError when resources.core is missing', async () => {
    const body = { resources: { search: { limit: 10, remaining: 10 } } }
    useFetch(createResponse({ body, url: RATE_LIMIT_URL }), RATE_LIMIT_URL)

    const result = client.getRateLimitData()

    await expect(result).rejects.toThrow(ParseError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Invalid rate limit response format')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws HttpError when the HTTP request fails', async () => {
    useFetch(
      createResponse({
        status: 403,
        body: { message: 'API rate limit exceeded' },
        url: RATE_LIMIT_URL,
      }),
      RATE_LIMIT_URL,
    )

    const userError = 'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.'

    const result = client.getRateLimitData()

    await expect(result).rejects.toThrow(HttpError)

    const error = await result.catch((caught) => caught)

    expect(error.status).toBe(403)
    expect(error.userMessage).toBe(userError)
    expect(notifications.notify).not.toHaveBeenCalled()
  })
})
