import { describe, test, expect, vi, afterEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { TEST_REPO_URL, getApiWarning, isSkippableApiError } from '#/fixtures/github/gitHubClient'

const TEST_BRANCH_NAME = 'main'

describe('getDataByBranch (live GitHub API)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns commit details for an existing public branch', { timeout: 20000 }, async () => {
    vi.spyOn(notifications, 'notify').mockResolvedValue()
    const client = new GitHubClient()
    let result

    try {
      result = await client.getDataByBranch(TEST_BRANCH_NAME, TEST_REPO_URL)
    } catch (error) {
      if (!isSkippableApiError(error)) throw error

      console.log(`[WARN] ${getApiWarning(error)}`)
      return
    }

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)

    const firstCommit = result[0]
    expect(typeof firstCommit.hash).toBe('string')
    expect(typeof firstCommit.sha).toBe('string')
    expect(typeof firstCommit.title).toBe('string')
    expect(typeof firstCommit.url).toBe('string')
    expect(typeof firstCommit.author).toBe('object')
    expect(typeof firstCommit.author.name).toBe('string')
    expect(typeof firstCommit.author.date).toBe('string')
    expect(Array.isArray(firstCommit.parents)).toBe(true)
  })
})
