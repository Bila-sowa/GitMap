import { describe, test, expect } from 'vitest'
import { addLinkToHistory, getLinkKey } from '@/js/utils/linkHistory'
import { config } from '@/js/api/config'

describe('linkHistory', () => {
  test('adds a new link to the front', () => {
    const result = addLinkToHistory([], 'https://github.com/example/project')

    expect(result).toStrictEqual(['https://github.com/example/project'])
  })

  test('moves an existing link to the front without duplicating it', () => {
    const history = ['https://github.com/example/one', 'https://github.com/example/two']

    const result = addLinkToHistory(history, 'https://github.com/example/two')

    expect(result).toStrictEqual([
      'https://github.com/example/two',
      'https://github.com/example/one',
    ])
  })

  test('deduplicates equivalent HTTPS and SSH links', () => {
    const history = ['https://github.com/example/project']

    const result = addLinkToHistory(history, 'git@github.com:example/project.git')

    expect(result).toStrictEqual(['git@github.com:example/project.git'])
  })

  test('keeps only the three most recent links', () => {
    const history = [
      'https://github.com/example/one',
      'https://github.com/example/two',
      'https://github.com/example/three',
    ]

    const result = addLinkToHistory(history, 'https://github.com/example/four')

    expect(result).toStrictEqual([
      'https://github.com/example/four',
      'https://github.com/example/one',
      'https://github.com/example/two',
    ])
    expect(result).toHaveLength(config.settings.linkHistory.LINK_HISTORY_LIMIT)
  })

  test('returns a trimmed copy for an empty link', () => {
    const history = ['  https://github.com/example/one  ', 42, '']

    const result = addLinkToHistory(history, '   ')

    expect(result).toStrictEqual(['https://github.com/example/one'])
  })

  test('does not mutate the input history', () => {
    const history = ['https://github.com/example/one']

    addLinkToHistory(history, 'https://github.com/example/two')

    expect(history).toStrictEqual(['https://github.com/example/one'])
  })

  test('returns a stable key for valid and invalid links', () => {
    const valid = getLinkKey('https://github.com/example/project')
    const invalid = getLinkKey('not a url')

    expect(valid).toBe('https://api.github.com/repos/example/project')
    expect(invalid).toBe('not a url')
  })
})
