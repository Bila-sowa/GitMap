import { describe, test, expect } from 'vitest'
import { buildCommitGraphLayout } from '@/js/utils/commitGraph'

describe('buildCommitGraphLayout', () => {
  const commits = [
    { sha: 'merge', parents: ['main-parent', 'branch-parent'] },
    { sha: 'main-parent', parents: ['common'] },
    { sha: 'branch-parent', parents: ['common'] },
    { sha: 'common', parents: ['outside-page'] },
  ]

  test('builds graph layout for branch, merge, and continuation edges', () => {
    const result = buildCommitGraphLayout(commits, 30)
    const branchEdge = result.edges.find(
      (edge) => edge.fromSha === 'branch-parent' && edge.toSha === 'common',
    )
    const continuationEdge = result.edges.find((edge) => edge.toSha === 'outside-page')

    expect(result.edges.length).toBe(5)
    expect(result.nodes.map((node) => node.lane)).toStrictEqual([0, 0, 1, 0])
    expect(result.laneCount).toBe(2)
    expect(result.hasHiddenCommits).toBe(false)

    expect(branchEdge?.fromLane).toBe(1)
    expect(branchEdge?.toLane).toBe(0)

    expect(continuationEdge?.isContinuation).toBe(true)
    expect(continuationEdge?.toRow).toBeNull()
  })

  test('handles empty array safely', () => {
    const result = buildCommitGraphLayout([])

    expect(result).toStrictEqual({
      edges: [],
      hasHiddenCommits: false,
      laneCount: 1,
      nodes: [],
    })
  })

  test.each([{ invalidValue: undefined }, { invalidValue: null }, { invalidValue: NaN }])(
    'handles $invalidValue safely',
    ({ invalidValue }) => {
      const result = buildCommitGraphLayout(invalidValue)

      expect(result).toStrictEqual({
        edges: [],
        hasHiddenCommits: false,
        laneCount: 1,
        nodes: [],
      })
    },
  )

  test('respects renderLimit and flags hidden commits', () => {
    const result = buildCommitGraphLayout(commits, 2)

    expect(result.nodes.length).toBe(2)
    expect(result.hasHiddenCommits).toBe(true)
    expect(result.nodes.map((node) => node.commit.sha)).toStrictEqual(['merge', 'main-parent'])
  })
})
