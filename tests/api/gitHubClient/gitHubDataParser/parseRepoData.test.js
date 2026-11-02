import { describe, test, expect } from 'vitest'
import GitHubDataParser from '@/js/api/gitHubClient/gitHubDataParser'
import { createBranch, createCommit } from '#/fixtures/github/dataParser'
import { expectInvalidParserResult } from '#/vitest/expectInvalidParserResult'

describe('parseRepoData', () => {
  const parser = new GitHubDataParser()

  test('combines parsed branches and commits for a branch in the list', () => {
    const commit = createCommit({ message: 'Fix login flow' })
    const raw = {
      defaultBranch: 'main',
      branches: [createBranch('main'), createBranch('dev')],
      commits: [commit],
    }

    const result = parser.parseRepoData(raw)

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
          description: '',
          hash: '51c497d',
          url: commit.html_url,
          sha: commit.sha,
          parents: [commit.parents[0].sha],
        },
      ],
      branchesDetails: ['main', 'dev'],
    })
  })

  test('prepends a default branch that is missing from the branch list', () => {
    const raw = {
      defaultBranch: 'feature/a&b',
      branches: [createBranch('main')],
      commits: [createCommit()],
    }

    const result = parser.parseRepoData(raw)

    expect(result.success).toBe(true)
    expect(result.defaultBranch).toBe('feature/a&b')
    expect(result.branchesDetails).toStrictEqual(['feature/a&b', 'main'])
  })

  test('falls back to the first branch when the default branch is blank', () => {
    const raw = {
      defaultBranch: '   ',
      branches: [createBranch('dev'), createBranch('main')],
      commits: [createCommit()],
    }

    const result = parser.parseRepoData(raw)

    expect(result.success).toBe(true)
    expect(result.defaultBranch).toBe('dev')
    expect(result.branchesDetails).toStrictEqual(['dev', 'main'])
  })

  test('returns the branch parsing error', () => {
    const raw = {
      defaultBranch: 'main',
      branches: [],
      commits: [createCommit()],
    }

    const result = parser.parseRepoData(raw)

    expectInvalidParserResult(result, 'parseBranchesData', raw.branches)
  })

  test('returns the commit parsing error', () => {
    const raw = {
      defaultBranch: 'main',
      branches: [createBranch('main')],
      commits: [],
    }

    const result = parser.parseRepoData(raw)

    expectInvalidParserResult(result, 'parseCommitsData', raw.commits)
  })

  test('rejects a non-object response', () => {
    const raw = null

    const result = parser.parseRepoData(raw)

    expectInvalidParserResult(result, 'parseRepoData', raw)
  })
})
