import { isNonEmptyString, isPositiveInteger } from './matchers.js'
import { toArray } from './coercions.js'

const getParentShas = (commit) => {
  return toArray(commit?.parents).filter((sha) => isNonEmptyString(sha))
}

const buildCommitGraphLayout = (commits, renderLimit = commits?.length) => {
  const commitList = toArray(commits)
  const parsedLimit = Number.parseInt(renderLimit, 10)
  const limit = isPositiveInteger(parsedLimit) ? parsedLimit : commitList.length
  const visibleCommits = commitList.slice(0, limit)
  const activeLanes = []
  const nodes = []

  visibleCommits.forEach((commit, row) => {
    let lane = activeLanes.indexOf(commit.sha)

    if (lane === -1) {
      lane = activeLanes.findIndex((sha) => sha === null)
      if (lane === -1) lane = activeLanes.length
      activeLanes[lane] = commit.sha
    }

    const parents = getParentShas(commit)
    const [firstParent, ...mergeParents] = parents

    nodes.push({ commit, lane, parents, row })

    if (!firstParent) {
      activeLanes[lane] = null
    } else {
      const existingParentLane = activeLanes.indexOf(firstParent)
      activeLanes[lane] =
        existingParentLane !== -1 && existingParentLane !== lane ? null : firstParent
    }

    mergeParents.forEach((parentSha) => {
      if (activeLanes.includes(parentSha)) return

      let parentLane = activeLanes.findIndex((sha) => sha === null)
      if (parentLane === -1) parentLane = activeLanes.length
      activeLanes[parentLane] = parentSha
    })
  })

  const levelBySha = new Map()

  if (nodes.length) levelBySha.set(nodes[0].commit.sha, 0)

  nodes.forEach((node) => {
    const level = levelBySha.get(node.commit.sha) ?? 0
    node.level = level

    node.parents.forEach((parentSha, parentIndex) => {
      const parentLevel = parentIndex === 0 ? level : level + 1
      const knownLevel = levelBySha.get(parentSha)

      if (knownLevel === undefined || parentLevel < knownLevel) {
        levelBySha.set(parentSha, parentLevel)
      }
    })
  })

  const nodesBySha = new Map(nodes.map((node) => [node.commit.sha, node]))
  const edges = nodes.flatMap((node) =>
    node.parents.map((parentSha) => {
      const parent = nodesBySha.get(parentSha)
      const toLevel = parent?.level ?? levelBySha.get(parentSha) ?? node.level

      return {
        fromLane: node.lane,
        fromRow: node.row,
        fromSha: node.commit.sha,
        isContinuation: !parent,
        level: Math.max(node.level, toLevel),
        toLane: parent?.lane ?? node.lane,
        toRow: parent?.row ?? null,
        toSha: parentSha,
      }
    }),
  )
  const laneCount = nodes.reduce((count, node) => Math.max(count, node.lane + 1), 1)

  return {
    edges,
    hasHiddenCommits: commitList.length > visibleCommits.length,
    laneCount,
    nodes,
  }
}

export { buildCommitGraphLayout }
