import { config } from '@/js/api/config'
import { isAbortError } from '@/js/utils/matchers'
import { logger } from '@/js/utils/logger'
import { AbortError, NetworkError, ParseError, TimeoutError } from '@/js/errors'
import RequestControl from './requestControl'
import { isGitHubApiUrl } from './gitHubConstants'

class GitHubTransport {
  #headers
  #httpApi
  /** @type {typeof fetch} */
  #fetch
  #onResponse

  /**
   * @param {Record<string, string>} headers
   * @param {object} httpApi
   * @param {{ fetcher?: typeof fetch, onResponse?: (response: Response) => void }} [options]
   */
  constructor(headers, httpApi, { fetcher, onResponse } = {}) {
    this.#headers = headers
    this.#httpApi = httpApi
    this.#fetch = fetcher || ((...args) => globalThis.fetch(...args))
    this.#onResponse = onResponse
  }

  #getSafeHeaders(url, authorization = this.#headers.Authorization) {
    const headers = { Accept: this.#headers.Accept }

    try {
      if (isGitHubApiUrl(url) && authorization) {
        headers.Authorization = authorization
      }
    } catch (error) {
      logger.warn(`getSafeHeaders: invalid URL "${url}", Authorization header omitted.`, error)
    }

    return headers
  }

  #getNextPage(response, url, userMessage, context) {
    const link = response.headers?.get?.('Link')
    const next = link?.split(',').find((part) => /;\s*rel="?next"?/i.test(part))
    const match = next?.match(/<([^>]+)>/)

    if (!match) return null

    try {
      const nextUrl = new URL(match[1], url)

      if (!isGitHubApiUrl(nextUrl)) {
        throw new ParseError('Invalid GitHub pagination URL', { userMessage, context })
      }

      return nextUrl.href
    } catch (cause) {
      if (cause instanceof ParseError) throw cause

      throw new ParseError('Invalid GitHub pagination URL', {
        cause,
        userMessage,
        context,
      })
    }
  }

  async #request(url, request, authorization, userMessage, context) {
    try {
      return await this.#fetch(url, {
        headers: this.#getSafeHeaders(url, authorization),
        signal: request.signal,
      })
    } catch (cause) {
      if (request.didTimeout()) {
        throw new TimeoutError('GitHub request timed out', {
          cause,
          userMessage: 'GitHub request timed out',
          context,
        })
      }

      if (isAbortError(cause) || request.signal.aborted) {
        throw new AbortError('GitHub request was cancelled', { cause, context })
      }

      throw new NetworkError(`Network or fetch exception in ${context}: ${cause.message}`, {
        cause,
        userMessage,
        context,
      })
    }
  }

  async #parseJson(response, userMessage, context) {
    try {
      return await response.json()
    } catch (cause) {
      throw new ParseError(`Failed to parse GitHub response JSON in ${context}`, {
        cause,
        userMessage,
        context,
      })
    }
  }

  async getJson(url, options = {}) {
    const {
      signal,
      authorization,
      paginate = false,
      parseJson = true,
      userMessage = 'Failed to fetch GitHub data',
      context = 'getJson',
    } = options
    const request = new RequestControl(signal, config.settings.gitHub.REQUEST_TIMEOUT_MS)
    const pages = []
    const visited = new Set()
    let nextUrl = url

    try {
      while (nextUrl) {
        if (visited.has(nextUrl)) {
          throw new ParseError('GitHub pagination loop detected', { userMessage, context })
        }
        visited.add(nextUrl)

        const response = await this.#request(nextUrl, request, authorization, userMessage, context)

        if (isGitHubApiUrl(response.url || nextUrl)) {
          this.#onResponse?.(response)
        }

        if (!response.ok) {
          throw await this.#httpApi.createHttpError(response, nextUrl)
        }

        if (!parseJson) return undefined

        const data = await this.#parseJson(response, userMessage, context)
        if (!paginate) return data
        if (!Array.isArray(data)) {
          throw new ParseError('Expected an array in paginated GitHub response', {
            userMessage,
            context,
          })
        }

        pages.push(...data)
        nextUrl = this.#getNextPage(response, nextUrl, userMessage, context)
      }

      return pages
    } finally {
      request.cleanup()
    }
  }
}

export default GitHubTransport
