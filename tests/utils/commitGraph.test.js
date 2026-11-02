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
    expect(result.nodes.map((node) => node.level)).toStrictEqual([0, 0, 1, 0])
    expect(result.laneCount).toBe(2)
    expect(result.hasHiddenCommits).toBe(false)

    expect(branchEdge?.fromLane).toBe(1)
    expect(branchEdge?.toLane).toBe(0)
    expect(branchEdge?.level).toBe(1)

    expect(continuationEdge?.isContinuation).toBe(true)
    expect(continuationEdge?.level).toBe(0)
    expect(continuationEdge?.toRow).toBeNull()
  })

  test('keeps independent branches from main at the same level', () => {
    const commits = [
      { sha: 'merge-a', parents: ['main-a', 'side-a'] },
      { sha: 'main-a', parents: ['merge-b'] },
      { sha: 'side-a', parents: ['base'] },
      { sha: 'merge-b', parents: ['main-b', 'side-b'] },
      { sha: 'main-b', parents: ['base'] },
      { sha: 'side-b', parents: ['base'] },
      { sha: 'base', parents: [] },
    ]

    const result = buildCommitGraphLayout(commits)
    const sideAEdge = result.edges.find(
      (edge) => edge.fromSha === 'side-a' && edge.toSha === 'base',
    )

    expect(result.nodes.map((node) => [node.commit.sha, node.level])).toStrictEqual([
      ['merge-a', 0],
      ['main-a', 0],
      ['side-a', 1],
      ['merge-b', 0],
      ['main-b', 0],
      ['side-b', 1],
      ['base', 0],
    ])
    expect(sideAEdge?.level).toBe(1)
  })

  test('increments the level for a branch that forks from another branch', () => {
    const commits = [
      { sha: 'main-merge', parents: ['main-head', 'branch-one'] },
      { sha: 'main-head', parents: ['main-base'] },
      { sha: 'branch-one', parents: ['branch-one-head', 'branch-two'] },
      { sha: 'branch-one-head', parents: ['main-base'] },
      { sha: 'branch-two', parents: ['main-base'] },
      { sha: 'main-base', parents: [] },
    ]

    const result = buildCommitGraphLayout(commits)
    const branchTwoEdge = result.edges.find(
      (edge) => edge.fromSha === 'branch-one' && edge.toSha === 'branch-two',
    )

    expect(result.nodes.map((node) => [node.commit.sha, node.level])).toStrictEqual([
      ['main-merge', 0],
      ['main-head', 0],
      ['branch-one', 1],
      ['branch-one-head', 1],
      ['branch-two', 2],
      ['main-base', 0],
    ])
    expect(branchTwoEdge?.level).toBe(2)
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
