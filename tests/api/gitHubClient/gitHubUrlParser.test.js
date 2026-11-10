import { describe, test, expect } from 'vitest'
import parseGitHubUrl from '@/js/api/gitHubClient/gitHubUrlParser'
import { ValidationError } from '@/js/errors'

const EXPECTED_LINKS = {
  repositoryLink: 'https://api.github.com/repos/Bila-sowa/GitMap',
  branchLink: 'https://api.github.com/repos/Bila-sowa/GitMap/branches',
  commitsLink: 'https://api.github.com/repos/Bila-sowa/GitMap/commits',
}

describe('parseGitHubUrl', () => {
  test.each([
    { label: 'an HTTPS URL', url: 'https://github.com/Bila-sowa/GitMap' },
    { label: 'an HTTPS URL with .git', url: 'https://github.com/Bila-sowa/GitMap.git' },
    { label: 'an SSH URL', url: 'git@github.com:Bila-sowa/GitMap.git' },
  ])('returns API links for $label', ({ url }) => {
    const result = parseGitHubUrl(url)

    expect(result).toStrictEqual(EXPECTED_LINKS)
  })

  test.each([
    { label: 'an external URL', url: 'https://example.com/invalid' },
    { label: 'a non-GitHub SSH URL', url: 'git@example.com:Bila-sowa/GitMap.git' },
    { label: 'an empty string', url: '' },
    { label: 'null', url: null },
  ])('rejects $label with a ValidationError', ({ url }) => {
    const result = () => parseGitHubUrl(url)

    expect(result).toThrow(ValidationError)
  })

  test('exposes a stable user message for invalid URLs', () => {
    const result = () => parseGitHubUrl('https://example.com/invalid')

    expect(result).toThrow(ValidationError)

    try {
      result()
    } catch (error) {
      expect(error.userMessage).toBe('Invalid GitHub URL')
      expect(error.context).toBe('parseGitHubUrl')
    }
  })
})
