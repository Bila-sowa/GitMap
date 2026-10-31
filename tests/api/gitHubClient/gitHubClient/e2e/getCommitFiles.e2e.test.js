import { describe, test, expect, vi, afterEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import {
  TEST_REPO_URL,
  PINNED_COMMIT_SHA,
  getHttpErrorStatus,
} from '#/fixtures/github/gitHubClient'

describe('getCommitFiles (live GitHub API)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns commit files for a pinned commit SHA', { timeout: 20000 }, async () => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
    const client = new GitHubClient()

    const result = await client.getCommitFiles(TEST_REPO_URL, PINNED_COMMIT_SHA)
    const httpErrorStatus = getHttpErrorStatus(result)

    if (httpErrorStatus !== null) {
      console.log(`[WARN] GitHub API error (HTTP ${httpErrorStatus}): ${result.error}`)

      expect(result.success).toBe(false)
      return
    }

    expect(result.success, result.error).toBe(true)
    expect(Array.isArray(result.files)).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
    expect(typeof result.truncated).toBe('boolean')

    const firstFile = result.files[0]
    expect(typeof firstFile.name).toBe('string')
    expect(typeof firstFile.status).toBe('string')
    expect(typeof firstFile.fullStatus).toBe('string')
    expect(typeof firstFile.extension).toBe('string')
    expect(typeof firstFile.additions).toBe('number')
    expect(typeof firstFile.deletions).toBe('number')
  })
})
