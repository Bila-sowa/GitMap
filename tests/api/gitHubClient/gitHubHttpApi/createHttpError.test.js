import { describe, test, expect, vi, afterEach } from 'vitest'
import GitHubHttpApi from '@/js/api/gitHubClient/gitHubHttpApi'

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

    expect(result).toStrictEqual({
      error: 'Not Found (404): Repository or resource not found.',
      devError: {
        status: 404,
        message:
          'Not Found (404): Repository or resource not found. [API Message: "Not Found", URL: https://api.github.com/repos/octocat/hello-world]',
        url,
      },
    })
  })

  test('returns only the user error when the response body and URL are empty', async () => {
    const response = {
      status: 500,
      json: async () => ({}),
    }

    const result = await httpApi.createHttpError(response)

    expect(result).toStrictEqual({
      error: 'Internal Server Error (500): GitHub encountered an internal error.',
      devError: {
        status: 500,
        message: 'Internal Server Error (500): GitHub encountered an internal error.',
        url: '',
      },
    })
  })

  test('keeps the user error null when the status is invalid', async () => {
    const url = 'https://api.github.com/rate_limit'
    const response = {
      status: 96,
      json: async () => ({}),
    }

    const result = await httpApi.createHttpError(response, url)

    expect(result).toStrictEqual({
      error: null,
      devError: {
        status: 96,
        message: null,
        url,
      },
    })
  })

  test('falls back to the user error and warns when the JSON body is invalid', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const url = 'https://api.github.com/rate_limit'
    const response = {
      status: 403,
      json: async () => {
        throw new SyntaxError('Unexpected token')
      },
    }

    const result = await httpApi.createHttpError(response, url)

    expect(result).toStrictEqual({
      error: 'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded.',
      devError: {
        status: 403,
        message:
          'Forbidden (403): Access denied, SAML enforcement, or rate limit exceeded. [URL: https://api.github.com/rate_limit]',
        url,
      },
    })
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
