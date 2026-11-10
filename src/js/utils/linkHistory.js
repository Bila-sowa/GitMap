import parseGitHubUrl from '../api/gitHubClient/gitHubUrlParser.js'
import { config } from '../api/config.js'
import { isNonEmptyString } from './matchers.js'
import { toArray, toTrimmedString } from './coercions.js'

function getLinkKey(link) {
  const trimmed = toTrimmedString(link)

  if (!trimmed) return ''

  try {
    const parsed = parseGitHubUrl(trimmed)

    return parsed.repositoryLink.toLowerCase()
  } catch {
    // Invalid URLs keep their raw value as the comparison key.
    return trimmed.toLowerCase()
  }
}

function addLinkToHistory(history, link) {
  const current = toArray(history)
    .filter((item) => isNonEmptyString(item))
    .map((item) => item.trim())
  const trimmed = toTrimmedString(link)

  if (!trimmed) return current.slice(0, config.settings.linkHistory.LINK_HISTORY_LIMIT)

  const key = getLinkKey(trimmed)
  const rest = current.filter((item) => getLinkKey(item) !== key)

  return [trimmed, ...rest].slice(0, config.settings.linkHistory.LINK_HISTORY_LIMIT)
}

export { addLinkToHistory, getLinkKey }
