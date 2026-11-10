import { describe, test, expect, vi, afterEach } from 'vitest'
import GitHubHttpApi from '@/js/api/gitHubClient/gitHubHttpApi'
import { logger } from '@/js/utils/logger'
import { HttpError } from '@/js/errors'

describe('createHttpError', () => {
  const httpApi = new GitHubHttpApi()

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('adds the API message and URL to the developer details', async () => {
    const url = 'https://api.github.com/repos/octocat/hello-world'
    const response = {
      status: 404,
      json: async () => ({ message: 'Not Found' }),
    }

    const result = await httpApi.createHttpError(response, url)

    expect(result).toBeInstanceOf(HttpError)
    expect(result.status).toBe(404)
    expect(result.url).toBe(url)
    expect(result.apiMessage).toBe('Not Found')
    expect(result.userMessage).toBe('Not Found (404): Repository or resource not found.')
    expect(result.message).toBe(
      'Not Found (404): Repository or resource not found. [API Message: "Not Found", URL: https://api.github.com/repos/octocat/hello-world]',
    )
  })

  test('returns only the user error when the response body and URL are empty', async () => {
    const response = {
      status: 500,
      json: async () => ({}),
    }

    const result = await httpApi.createHttpError(response)

    expect(result).toBeInstanceOf(HttpError)
    expect(result.status).toBe(500)
    expect(result.url).toBe('')
    expect(result.apiMessage).toBe('')
    expect(result.userMessage).toBe(
      'Internal Server Error (500): GitHub encountered an internal error.',
    )
    expect(result.message).toBe(
      'Internal Server Error (500): GitHub encountered an internal error.',
    )
  })

  test('keeps the user message null when the status is invalid', async () => {
    const url = 'https://api.github.com/rate_limit'
    const response = {
      status: 96,
      json: async () => ({}),
    }

    const result = await httpApi.createHttpError(response, url)

    expect(result).toBeInstanceOf(HttpError)
    expect(result.status).toBe(96)
    expect(result.url).toBe(url)
    expect(result.userMessage).toBe(null)
    expect(result.message).toBe('GitHub API error (HTTP 96).')
  })

  test('falls back to the user error and warns when the JSON body is invalid', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const url = 'https://api.github.com/rate_limit'
    const response = {
      status: 403,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    }

    const result = await httpApi.createHttpError(response, url)

    expect(result).toBeInstanceOf(HttpError)
    expect(result.status).toBe(403)
    expect(result.apiMessage).toBe('')
    expect(result.userMessage).toBe(
      'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.',
    )
    expect(result.message).toBe(
      'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded. [URL: https://api.github.com/rate_limit]',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
