import { describe, test, expect } from 'vitest'
import GitHubTransport from '@/js/api/gitHubClient/gitHubTransport'
import GitHubRateLimiter from '@/js/api/gitHubClient/gitHubRateLimiter'

const BRANCHES_URL = 'https://api.github.com/repos/example/project/branches'
const NEXT_PAGE_URL = `${BRANCHES_URL}?page=2`

const createHeaders = () => ({
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer secret',
})

const createHttpApi = () => ({
  createHttpError: async (response) => ({ error: `HTTP ${response.status}` }),
})

describe('GitHubTransport', () => {
  test('follows the Link header and collects every page', async () => {
    const requests = []
    const fetcher = async (url) => {
      requests.push(url)

      if (url === NEXT_PAGE_URL) {
        return { ok: true, headers: new Headers(), json: async () => [{ name: 'dev' }] }
      }

      return {
        ok: true,
        headers: new Headers({ Link: `<${NEXT_PAGE_URL}>; rel="next"` }),
        json: async () => [{ name: 'main' }],
      }
    }
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })

    const result = await transport.getJson(BRANCHES_URL, { paginate: true })

    expect(result).toStrictEqual({
      success: true,
      data: [{ name: 'main' }, { name: 'dev' }],
    })
    expect(requests).toStrictEqual([BRANCHES_URL, NEXT_PAGE_URL])
  })

  test('sends the authorization header only to the GitHub API', async () => {
    const requests = []
    const fetcher = async (url, options) => {
      requests.push({ url, headers: options.headers })
      return { ok: true, headers: new Headers(), json: async () => [] }
    }
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })

    const gitHubResult = await transport.getJson(BRANCHES_URL)
    const externalResult = await transport.getJson('https://example.com/data')

    expect(requests).toStrictEqual([
      {
        url: BRANCHES_URL,
        headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer secret' },
      },
      {
        url: 'https://example.com/data',
        headers: { Accept: 'application/vnd.github+json' },
      },
    ])
    expect(gitHubResult).toStrictEqual({ success: true, data: [] })
    expect(externalResult).toStrictEqual({ success: true, data: [] })
  })

  test('skips JSON parsing when it is disabled', async () => {
    const fetcher = async () => ({
      ok: true,
      headers: new Headers(),
      json: async () => {
        throw new Error('Unexpected JSON parse')
      },
    })
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })

    const result = await transport.getJson('https://example.com/data', { parseJson: false })

    expect(result).toStrictEqual({ success: true })
  })

  test('updates the cached rate limit from response headers without an implicit refresh', async () => {
    const requests = []
    const rateLimiter = new GitHubRateLimiter()
    const fetcher = async (url) => {
      requests.push(url)
      return {
        ok: true,
        headers: new Headers({ 'X-RateLimit-Limit': '60', 'X-RateLimit-Used': '12' }),
        json: async () => [],
      }
    }
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), {
      fetcher,
      onResponse: (response) => rateLimiter.updateFromHeaders(response.headers),
    })
    rateLimiter.setTransport(transport)

    await transport.getJson(BRANCHES_URL)
    const result = rateLimiter.getCachedRateLimitData()
    const rateLimitRequests = requests.filter((url) => url.endsWith('/rate_limit'))

    expect(result).toStrictEqual({
      success: true,
      data: { limitPerNumber: 60, usedPerNumber: 12, usedPerPercent: 20 },
    })
    expect(rateLimitRequests).toStrictEqual([])
  })

  test('refreshes the rate limit explicitly and caches the used count', async () => {
    const requests = []
    const rateLimiter = new GitHubRateLimiter()
    const fetcher = async (url) => {
      requests.push(url)
      return {
        ok: true,
        headers: new Headers(),
        json: async () => ({ resources: { core: { limit: 60, remaining: 47, used: 13 } } }),
      }
    }
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })
    rateLimiter.setTransport(transport)

    const result = await rateLimiter.getRateLimitData()

    expect(result).toStrictEqual({
      success: true,
      data: { limitPerNumber: 60, usedPerNumber: 13, usedPerPercent: 21.67 },
    })
    expect(requests).toStrictEqual(['https://api.github.com/rate_limit'])
  })

  test('returns a cancelled result for an already aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetcher = async () => {
      throw new DOMException('Aborted', 'AbortError')
    }
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })

    const result = await transport.getJson('https://api.github.com/data', {
      signal: controller.signal,
    })

    expect(result).toStrictEqual({ success: false, cancelled: true })
  })

  test('returns the HTTP API error for a failed response', async () => {
    const fetcher = async () => ({ ok: false, status: 403 })
    const transport = new GitHubTransport(createHeaders(), createHttpApi(), { fetcher })

    const result = await transport.getJson('https://api.github.com/data')

    expect(result).toStrictEqual({ success: false, error: 'HTTP 403' })
  })
})
