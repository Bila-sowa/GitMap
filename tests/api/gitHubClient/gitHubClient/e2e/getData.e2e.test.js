import { describe, test, expect, vi, afterEach } from 'vitest'
import { GitHubClient } from '@/js/api/gitHubClient'
import notifications from '@/js/utils/notificationManager'
import { TEST_REPO_URL, getApiWarning, isSkippableApiError } from '#/fixtures/github/gitHubClient'

describe('getData (live GitHub API)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test(
    'returns repository, branch, and commit details for a public repository',
    { timeout: 30000 },
    async () => {
      vi.spyOn(notifications, 'notify').mockResolvedValue()
      const client = new GitHubClient()
      let result

      try {
        result = await client.getData(TEST_REPO_URL)
      } catch (error) {
        if (!isSkippableApiError(error)) throw error

        console.log(`[WARN] ${getApiWarning(error)}`)
        return
      }

      expect(typeof result.defaultBranch).toBe('string')
      expect(result.defaultBranch.length).toBeGreaterThan(0)
      expect(Array.isArray(result.branchesDetails)).toBe(true)
      expect(result.branchesDetails.length).toBeGreaterThan(0)
      expect(result.branchesDetails).toContain(result.defaultBranch)
      expect(Array.isArray(result.commitsDetails)).toBe(true)
      expect(result.commitsDetails.length).toBeGreaterThan(0)

      const firstCommit = result.commitsDetails[0]
      expect(typeof firstCommit.hash).toBe('string')
      expect(typeof firstCommit.sha).toBe('string')
      expect(typeof firstCommit.title).toBe('string')
      expect(typeof firstCommit.url).toBe('string')
      expect(typeof firstCommit.author).toBe('object')
      expect(typeof firstCommit.author.name).toBe('string')
      expect(typeof firstCommit.author.date).toBe('string')
      expect(Array.isArray(firstCommit.parents)).toBe(true)
    },
  )
})
