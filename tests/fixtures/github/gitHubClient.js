import { vi } from 'vitest'
import { HttpError, NetworkError, TimeoutError } from '@/js/errors'

export const TEST_REPO_URL = 'https://github.com/Bila-sowa/GitMap'
export const PINNED_COMMIT_SHA = '46f5cd270ddda0267790caf4fe48ec8895149ec6'

export const HTTP_ERROR_MIN = 400
export const HTTP_ERROR_MAX = 599

const RATE_LIMIT_STATUSES = new Set([403, 429])
const SERVER_ERROR_MIN = 500

/**
 * Returns the HTTP status code from a typed application error if it falls in
 * the error range, or null when the error is not an HTTP error.
 */
export const getHttpErrorStatus = (error) => {
  const status = error?.status

  return Number.isInteger(status) && status >= HTTP_ERROR_MIN && status <= HTTP_ERROR_MAX
    ? status
    : null
}

/**
 * Reports whether an E2E failure is caused by external GitHub availability
 * (rate limit, server error, network, or timeout) rather than by a contract
 * change or a defect in the client.
 */
export const isSkippableApiError = (error) => {
  if (error instanceof NetworkError || error instanceof TimeoutError) return true
  if (!(error instanceof HttpError)) return false

  return (
    RATE_LIMIT_STATUSES.has(error.status) ||
    (error.status >= SERVER_ERROR_MIN && error.status <= HTTP_ERROR_MAX)
  )
}

/**
 * Builds a human-readable warning for a skippable E2E failure.
 * HTTP failures are reported with their status; network and timeout failures
 * are reported as incomplete requests.
 */
export const getApiWarning = (error) => {
  const status = getHttpErrorStatus(error)
  const message = error?.userMessage || error?.message || 'Unknown error'

  return status === null
    ? `GitHub request could not be completed: ${message}`
    : `GitHub API error (HTTP ${status}): ${message}`
}

/**
 * Builds a minimal Response-like object for mocking fetch in local tests.
 * The caller must supply the url that matches the intercepted endpoint so that
 * the response.url field is accurate and useFetch can enforce strict URL matching.
 */
export const createResponse = ({ status = 200, body = {}, url, headers = new Headers() } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  url,
  headers,
  json: async () => body,
})

/**
 * Stubs globalThis.fetch to intercept requests to an explicit list of routes.
 * Any request to a URL outside that list throws an error to catch accidental
 * network calls in the offline local test environment.
 * Returns the requests array so callers can assert which URLs were fetched.
 */
export const useFetchRoutes = (routes) => {
  const requests = []
  const responsesByUrl = new Map(routes.map(({ url, response }) => [url, response]))

  vi.stubGlobal('fetch', async (url) => {
    requests.push(url)

    if (!responsesByUrl.has(url)) {
      throw new Error(`Unexpected request: ${url}`)
    }

    return responsesByUrl.get(url)
  })

  return requests
}

/**
 * Stubs globalThis.fetch to intercept requests to exactly one expectedUrl.
 * Returns the requests array so callers can assert which URLs were fetched.
 */
export const useFetch = (response, expectedUrl) => useFetchRoutes([{ url: expectedUrl, response }])
