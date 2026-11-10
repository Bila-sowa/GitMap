import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { createFile } from '#/fixtures/github/dataParser'
import {
  TEST_REPO_URL,
  PINNED_COMMIT_SHA,
  createResponse,
  useFetch,
} from '#/fixtures/github/gitHubClient'
import { AbortError, HttpError, ValidationError } from '@/js/errors'

const TEST_COMMIT_SHA = PINNED_COMMIT_SHA
const COMMIT_URL = `https://api.github.com/repos/Bila-sowa/GitMap/commits/${TEST_COMMIT_SHA}`

const createFiles = (count) =>
  Array.from({ length: count }, (_, index) => createFile({ filename: `src/file-${index}.js` }))

describe('getCommitFiles', () => {
  const client = new GitHubClient()

  beforeEach(() => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('normalizes commit files for a valid repository URL and commit SHA', async () => {
    const rawFiles = [
      createFile({ filename: 'src/js/<app>.js', status: 'modified', additions: 12, deletions: 3 }),
      createFile({ filename: 'assets/README', status: 'added', additions: 5, deletions: 0 }),
    ]
    const requests = useFetch(
      createResponse({ body: { files: rawFiles }, url: COMMIT_URL }),
      COMMIT_URL,
    )

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA)

    expect(result).toStrictEqual({
      files: [
        {
          name: 'src/js/&lt;app&gt;.js',
          additions: 12,
          deletions: 3,
          extension: 'js',
          fullStatus: 'modified',
          status: 'M',
        },
        {
          name: 'assets/README',
          additions: 5,
          deletions: 0,
          extension: 'file',
          fullStatus: 'added',
          status: 'A',
        },
      ],
      truncated: false,
    })
    expect(requests).toStrictEqual([COMMIT_URL])
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('marks the result as truncated when commit contains 300 files', async () => {
    useFetch(createResponse({ body: { files: createFiles(300) }, url: COMMIT_URL }), COMMIT_URL)

    const result = await client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA)

    expect(result.truncated).toBe(true)
    expect(result.files).toHaveLength(300)
  })

  test('rejects an invalid GitHub repository URL without notifying', async () => {
    const result = client.getCommitFiles('https://example.com/invalid', TEST_COMMIT_SHA)

    await expect(result).rejects.toThrow(ValidationError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Invalid GitHub URL')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test.each([
    { label: 'an empty string', sha: '' },
    { label: 'null', sha: null },
    { label: 'undefined', sha: undefined },
  ])('rejects $label as a commit SHA without notifying', async ({ sha }) => {
    const result = client.getCommitFiles(TEST_REPO_URL, sha)

    await expect(result).rejects.toThrow(ValidationError)

    const error = await result.catch((caught) => caught)

    expect(error.userMessage).toBe('Missing commit SHA')
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws HttpError for GitHub API error responses', async () => {
    useFetch(
      createResponse({
        status: 404,
        body: { message: 'No commit found for SHA' },
        url: COMMIT_URL,
      }),
      COMMIT_URL,
    )

    const userError = 'Not Found (404): Repository or resource not found.'

    const result = client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA)

    await expect(result).rejects.toThrow(HttpError)

    const error = await result.catch((caught) => caught)

    expect(error.status).toBe(404)
    expect(error.userMessage).toBe(userError)
    expect(notifications.notify).not.toHaveBeenCalled()
  })

  test('throws AbortError for request cancellation without notifying', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', async () => {
      throw new DOMException('The operation was aborted.', 'AbortError')
    })

    const result = client.getCommitFiles(TEST_REPO_URL, TEST_COMMIT_SHA, {
      signal: controller.signal,
    })

    await expect(result).rejects.toThrow(AbortError)
    expect(notifications.notify).not.toHaveBeenCalled()
  })
})
