import { matchHttpsUrl, matchSshUrl } from '@/js/utils/matchers'
import { ParseError, ValidationError } from '@/js/errors'
import { GITHUB_API_ORIGIN } from './gitHubConstants'

const INVALID_URL_MESSAGE = 'Invalid GitHub URL'

const parseGitHubUrl = (url) => {
  try {
    let owner
    let repo

    const sshMatch = matchSshUrl(url)
    const httpsMatch = matchHttpsUrl(url)

    if (sshMatch) {
      ;[, owner, repo] = sshMatch
    } else if (httpsMatch) {
      ;[, owner, repo] = httpsMatch
    } else {
      throw new ValidationError(
        `Failed to parse GitHub URL: "${url}". Expected HTTPS or SSH format.`,
        {
          userMessage: INVALID_URL_MESSAGE,
          context: 'parseGitHubUrl',
        },
      )
    }

    return {
      repositoryLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}`,
      branchLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}/branches`,
      commitsLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}/commits`,
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error

    throw new ParseError(`URL parsing exception: ${error.message}`, {
      cause: error,
      userMessage: INVALID_URL_MESSAGE,
      context: 'parseGitHubUrl',
    })
  }
}

export default parseGitHubUrl
