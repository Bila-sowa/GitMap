import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import storage from '@/js/data/storage'
import { createCommit } from '#/fixtures/github/dataParser'
import { TEST_REPO_URL, createResponse, useFetch } from '#/fixtures/github/gitHubClient'
import { AbortError, HttpError, ParseError, ValidationError } from '@/js/errors'

const TEST_BRANCH_NAME = 'main'
const COMMITS_URL = 'https://api.github.com/repos/Bila-sowa/GitMap/commits?sha=main'

describe('getDataByBranch', () => {
  const client = new GitHubClient()

  beforeEach(() => {
    storage.reset()
    vi.spyOn(notifications, 'notify').mockResolvedValue()
  })

  afterEach(() => {
    storage.reset()
    vi.restoreAllMocks()
  })

  test('normalizes commits for a valid repository URL and branch name', async () => {
    const rawCommits = [createCommit()]
    const requests = useFetch(createResponse({ body: rawCommits, url: COMMITS_URL }), COMMITS_URL)

    const result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL)

    expect(result).toStrictEqual([
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
    ])
    expect(requests).toStrictEqual([COMMITS_URL])
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('properly encodes special characters in branch names', async () => {
    const branchWithSpecialChars = 'feature/a&b'
    const expectedUrl = 'https://api.github.com/repos/Bila-sowa/GitMap/commits?sha=feature%2Fa%26b'
    const requests = useFetch(
      createResponse({ body: [createCommit()], url: expectedUrl }),
      expectedUrl,
    )

    const result = await client.getDataByBranch(branchWithSpecialChars, TEST_REPO_URL)

    expect(result).toHaveLength(1)
    expect(requests).toStrictEqual([expectedUrl])
  })

  test('falls back to repository link stored in storage when url is omitted', async () => {
    storage.setData({ link: TEST_REPO_URL })
    useFetch(createResponse({ body: [createCommit()], url: COMMITS_URL }), COMMITS_URL)

    const result = await client.getDataByBranch(TEST_BRANCH_NAME)

    expect(result).toHaveLength(1)
  })

  test.each([
    { label: 'an empty string', branch: '' },
    { label: 'a whitespace string', branch: '   ' },
    { label: 'null', branch: null },
    { label: 'undefined', branch: undefined },
    { label: 'a number', branch: 42 },
    { label: 'a boolean', branch: true },
  ])('rejects $label as a branch name without notifying', async ({ branch }) => {
    const result = client.getDataByBranch(branch, TEST_REPO_URL)

    await expect(result).rejects.toThrow(ValidationError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Missing branch name')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('rejects an invalid GitHub repository URL without notifying', async () => {
    const result = client.getDataByBranch(TEST_BRANCH_NAME, 'https://example.com/invalid')

    await expect(result).rejects.toThrow(ValidationError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Invalid GitHub URL')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws HttpError for GitHub API error responses', async () => {
    useFetch(
      createResponse({ status: 404, body: { message: 'Branch not found' }, url: COMMITS_URL }),
      COMMITS_URL,
    )

    const userError = 'Not Found (404): Repository or resource not found.'

    const result = client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL)

    await expect(result).rejects.toThrow(HttpError)

    const error = await result.catch((caught) => caught)

    expect(error.status).toBe(404)
    expect(error.userMessage).toBe(userError)
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws ParseError for invalid commit payloads without notifying', async () => {
    const invalidCommit = createCommit({ sha: '' })
    useFetch(createResponse({ body: [invalidCommit], url: COMMITS_URL }), COMMITS_URL)

    const result = client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL)

    await expect(result).rejects.toThrow(ParseError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Unexpected response format from GitHub')
    expect(error.context).toBe('parseCommitsData')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws AbortError for request cancellation without notifying', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', async () => {
      throw new DOMException('The operation was aborted.', 'AbortError')
    })

    const result = client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL, {
      signal: controller.signal,
    })

    await expect(result).rejects.toThrow(AbortError)
    expect(notifications.notify).not.toHaveBeenCalled()
  })
})
