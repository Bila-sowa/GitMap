import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import GitHubTokenManager from '@/js/api/gitHubClient/gitHubTokenManager'
import { Storage } from '@/js/data/storage'
import notifications from '@/js/utils/notificationManager'
import { AbortError, HttpError } from '@/js/errors'

const ACTIVE_TOKEN = 'ghp_activeToken'

const createHeaders = () => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${ACTIVE_TOKEN}`,
})

const createStorage = () => {
  const storage = new Storage()
  storage.setData({ token: ACTIVE_TOKEN })
  return storage
}

const createHttpApi = () => ({
  createHttpError: async (response) =>
    new HttpError('Unauthorized', { status: response.status, userMessage: 'Unauthorized' }),
})

const createDeferredFetcher = () => {
  const requests = []
  const fetcher = async (url, options) =>
    new Promise((resolve) => {
      requests.push({
        url,
        authorization: options.headers.Authorization,
        headers: options.headers,
        resolve,
      })
    })
  const findRequest = (token) =>
    requests.find((request) => request.authorization === `Bearer ${token}`)
  const resolveRequest = (token, response) => findRequest(token).resolve(response)

  return { fetcher, findRequest, resolveRequest }
}

describe('setToken', () => {
  const { fetcher, findRequest, resolveRequest } = createDeferredFetcher()

  beforeEach(() => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('preserves the current authorization and storage when the token is rejected', async () => {
    const storage = createStorage()
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher)
    const pendingRequest = tokenManager.setToken('ghp_invalidToken')
    const assertion = expect(pendingRequest).rejects.toThrow(HttpError)

    resolveRequest('ghp_invalidToken', { ok: false, status: 401 })
    await assertion

    const error = await pendingRequest.catch((caught) => caught)

    expect(error.userMessage).toBe('Unauthorized')
    expect(tokenManager.getAuthorizationHeader()).toBe(`Bearer ${ACTIVE_TOKEN}`)
    expect(storage.getData().token).toBe(ACTIVE_TOKEN)
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('applies only the latest successful token and isolates candidate headers', async () => {
    const storage = createStorage()
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher)
    const staleRequest = tokenManager.setToken('ghp_staleSuccessToken')
    const latestRequest = tokenManager.setToken('ghp_latestSuccessToken')
    const staleAssertion = expect(staleRequest).rejects.toThrow(AbortError)
    const staleCandidate = findRequest('ghp_staleSuccessToken')
    const latestCandidate = findRequest('ghp_latestSuccessToken')

    expect(staleCandidate.headers).not.toBe(latestCandidate.headers)
    expect(staleCandidate.authorization).toBe('Bearer ghp_staleSuccessToken')
    expect(latestCandidate.authorization).toBe('Bearer ghp_latestSuccessToken')

    resolveRequest('ghp_latestSuccessToken', { ok: true })
    const latestResult = await latestRequest
    resolveRequest('ghp_staleSuccessToken', { ok: true })
    await staleAssertion

    expect(latestResult).toBeUndefined()
    expect(tokenManager.getAuthorizationHeader()).toBe('Bearer ghp_latestSuccessToken')
    expect(storage.getData().token).toBe('ghp_latestSuccessToken')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('cancels a stale failure after the latest token succeeds', async () => {
    const storage = createStorage()
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher)
    const staleRequest = tokenManager.setToken('ghp_staleFailureToken')
    const latestRequest = tokenManager.setToken('ghp_latestFailureToken')
    const staleAssertion = expect(staleRequest).rejects.toThrow(AbortError)

    resolveRequest('ghp_latestFailureToken', { ok: true })
    await latestRequest
    resolveRequest('ghp_staleFailureToken', { ok: false, status: 401 })
    await staleAssertion

    expect(tokenManager.getAuthorizationHeader()).toBe('Bearer ghp_latestFailureToken')
    expect(storage.getData().token).toBe('ghp_latestFailureToken')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('clears the authorization and storage and cancels a pending request for an empty token', async () => {
    const storage = createStorage()
    const tokenManager = new GitHubTokenManager(createHeaders(), createHttpApi(), storage, fetcher)
    const pendingRequest = tokenManager.setToken('ghp_pendingToken')
    const pendingAssertion = expect(pendingRequest).rejects.toThrow(AbortError)
    const result = await tokenManager.setToken('')

    resolveRequest('ghp_pendingToken', { ok: true })
    await pendingAssertion

    expect(result).toBeUndefined()
    expect(tokenManager.getAuthorizationHeader()).toBe(null)
    expect(storage.getData().token).toBe('')
  })
})
