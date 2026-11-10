import storage from '@/js/data/storage'
import { AbortError } from '@/js/errors'
import GitHubTransport from './gitHubTransport'
import { GITHUB_API_ORIGIN } from './gitHubConstants'

class GitHubTokenManager {
  #headers
  #storage
  #transport
  #tokenOperationId = 0

  constructor(headers, httpApi, storageInstance = storage, fetcher, transport) {
    this.#headers = headers
    this.#storage = storageInstance
    this.#transport = transport || new GitHubTransport(headers, httpApi, { fetcher })
  }

  async #validateToken(token, options = {}) {
    await this.#transport.getJson(`${GITHUB_API_ORIGIN}/rate_limit`, {
      signal: options.signal,
      authorization: `Bearer ${token}`,
      parseJson: false,
      userMessage: 'Failed to validate GitHub token',
      context: '#validateToken',
    })
  }

  async setToken(token, options = {}) {
    const operationId = ++this.#tokenOperationId

    if (!token) {
      delete this.#headers.Authorization
      this.#storage.setData({ token: '' })
      return
    }

    let validationError = null

    try {
      await this.#validateToken(token, options)
    } catch (error) {
      validationError = error
    }

    if (operationId !== this.#tokenOperationId) {
      throw new AbortError('Token operation was superseded by a newer request', {
        context: 'GitHubTokenManager.setToken',
      })
    }

    if (validationError) throw validationError

    this.#storage.setData({ token })
    this.#headers.Authorization = `Bearer ${token}`
  }

  getHeaders() {
    return { ...this.#headers }
  }

  getAuthorizationHeader() {
    return this.#headers.Authorization || null
  }
}

export default GitHubTokenManager
