import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { createBranch, createCommit } from '#/fixtures/github/dataParser'
import { TEST_REPO_URL, createResponse, useFetchRoutes } from '#/fixtures/github/gitHubClient'

const REPOSITORY_URL = 'https://api.github.com/repos/Bila-sowa/GitMap'
const BRANCHES_URL = `${REPOSITORY_URL}/branches`
const COMMITS_URL = `${REPOSITORY_URL}/commits`
const NEXT_BRANCHES_URL = `${BRANCHES_URL}?page=2`

const createRepositoryResponse = (defaultBranch) =>
  createResponse({ body: { default_branch: defaultBranch }, url: REPOSITORY_URL })

describe('getData', () => {
  beforeEach(() => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('normalizes repository data with paginated branches and commits', async () => {
    const firstPage = createResponse({
      body: [createBranch('main')],
      url: BRANCHES_URL,
      headers: new Headers({ Link: `<${NEXT_BRANCHES_URL}>; rel="next"` }),
    })
    const secondPage = createResponse({
      body: [createBranch('dev'), createBranch('release')],
      url: NEXT_BRANCHES_URL,
    })
    const requests = useFetchRoutes([
      { url: REPOSITORY_URL, response: createRepositoryResponse('main') },
      { url: BRANCHES_URL, response: firstPage },
      { url: COMMITS_URL, response: createResponse({ body: [createCommit()], url: COMMITS_URL }) },
      { url: NEXT_BRANCHES_URL, response: secondPage },
    ])
    const client = new GitHubClient()

    const result = await client.getData(TEST_REPO_URL)

    expect(result).toStrictEqual({
      success: true,
      defaultBranch: 'main',
      commitsDetails: [
        {
          author: {
            name: 'Test User',
            email: 'test@example.com',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            url: 'https://github.com/test-user',
            date: '2026-08-28T12:58:44Z',
          },
          title: 'Fix login flow',
          description: '\nHandle expired sessions.',
          hash: '51c497d',
          url: 'https://github.com/example/project/commit/51c497d0faee027f4b124401823c59416bda590a',
          sha: '51c497d0faee027f4b124401823c59416bda590a',
          parents: ['282fa46d7bdd39f183a8aa924211106fa250f9a3'],
        },
      ],
      branchesDetails: ['main', 'dev', 'release'],
    })
    expect(requests).toStrictEqual([REPOSITORY_URL, BRANCHES_URL, COMMITS_URL, NEXT_BRANCHES_URL])
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('prepends a default branch that is missing from the branch list', async () => {
    useFetchRoutes([
      { url: REPOSITORY_URL, response: createRepositoryResponse('feature/a&b') },
      {
        url: BRANCHES_URL,
        response: createResponse({ body: [createBranch('main')], url: BRANCHES_URL }),
      },
      { url: COMMITS_URL, response: createResponse({ body: [createCommit()], url: COMMITS_URL }) },
    ])
    const client = new GitHubClient()

    const result = await client.getData(TEST_REPO_URL)

    expect(result.success).toBe(true)
    expect(result.defaultBranch).toBe('feature/a&b')
    expect(result.branchesDetails).toStrictEqual(['feature/a&b', 'main'])
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('notifies and rejects an invalid GitHub repository URL', async () => {
    const client = new GitHubClient()

    const result = await client.getData('https://example.com/invalid')

    expect(result).toStrictEqual({
      success: false,
      error: 'Invalid GitHub URL',
      devError:
        'Failed to parse GitHub URL: "https://example.com/invalid". Expected HTTPS or SSH format.',
    })
    expect(notifications.notify).toHaveBeenCalledWith('Invalid GitHub URL', 'error')
  })

  test('returns the repository HTTP error from parallel requests', async () => {
    const userError = 'Not Found (404): Repository or resource not found.'
    useFetchRoutes([
      {
        url: REPOSITORY_URL,
        response: createResponse({
          status: 404,
          body: { message: 'Repository not found' },
          url: REPOSITORY_URL,
        }),
      },
      {
        url: BRANCHES_URL,
        response: createResponse({ body: [createBranch('main')], url: BRANCHES_URL }),
      },
      { url: COMMITS_URL, response: createResponse({ body: [createCommit()], url: COMMITS_URL }) },
    ])
    const client = new GitHubClient()

    const result = await client.getData(TEST_REPO_URL)

    expect(result).toStrictEqual({
      success: false,
      error: userError,
      devError: {
        status: 404,
        message: `${userError} [API Message: "Repository not found", URL: ${REPOSITORY_URL}]`,
        url: REPOSITORY_URL,
      },
    })
    expect(notifications.notify).toHaveBeenCalledWith(userError, 'error')
  })

  test('handles parser failure for an invalid commit payload', async () => {
    const invalidCommit = createCommit({ sha: '' })
    useFetchRoutes([
      { url: REPOSITORY_URL, response: createRepositoryResponse('main') },
      {
        url: BRANCHES_URL,
        response: createResponse({ body: [createBranch('main')], url: BRANCHES_URL }),
      },
      { url: COMMITS_URL, response: createResponse({ body: [invalidCommit], url: COMMITS_URL }) },
    ])
    const client = new GitHubClient()

    const result = await client.getData(TEST_REPO_URL)

    expect(result).toStrictEqual({
      success: false,
      error: 'Unexpected response format from GitHub',
      devError: {
        message: 'Invalid response data in parseCommitsData',
        rawResponse: invalidCommit,
      },
    })
    expect(notifications.notify).toHaveBeenCalledWith(
      'Unexpected response format from GitHub',
      'error',
    )
  })

  test('handles request cancellation via AbortSignal without notifying', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', async () => {
      throw new DOMException('The operation was aborted.', 'AbortError')
    })
    const client = new GitHubClient()

    const result = await client.getData(TEST_REPO_URL, { signal: controller.signal })

    expect(result).toStrictEqual({
      success: false,
      cancelled: true,
    })
    expect(notifications.notify).not.toHaveBeenCalled()
  })
})
