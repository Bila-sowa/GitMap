import { describe, test, expect } from 'vitest'
import GitHubDataParser from '@/js/api/gitHubClient/gitHubDataParser'
import { createBranch } from '#/fixtures/github/dataParser'
import { expectInvalidParserResult } from '#/vitest/expectInvalidParserResult'

describe('parseBranchesData', () => {
  const parser = new GitHubDataParser()

  test('maps branch records to their names in order', () => {
    const result = parser.parseBranchesData([createBranch('main'), createBranch('feature/a&b')])

    expect(result).toStrictEqual({
      success: true,
      branchesDetails: ['main', 'feature/a&b'],
    })
  })

  test.each([
    { label: 'an empty array', input: [] },
    { label: 'a missing list', input: undefined },
    { label: 'a non-array value', input: 'main' },
  ])('rejects $label', ({ input }) => {
    const result = parser.parseBranchesData(input)

    expectInvalidParserResult(result, 'parseBranchesData', input)
  })

  test('rejects a branch without a name', () => {
    const invalidBranch = { name: '   ' }

    const result = parser.parseBranchesData([createBranch('main'), invalidBranch])

    expectInvalidParserResult(result, 'parseBranchesData', invalidBranch)
  })
})
