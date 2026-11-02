import { matchHttpsUrl, matchSshUrl } from '@/js/utils/matchers'
import { GITHUB_API_ORIGIN } from './gitHubConstants'

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
      return {
        success: false,
        error: 'Invalid GitHub URL',
        devError: `Failed to parse GitHub URL: "${url}". Expected HTTPS or SSH format.`,
      }
    }

    return {
      success: true,
      repositoryLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}`,
      branchLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}/branches`,
      commitsLink: `${GITHUB_API_ORIGIN}/repos/${owner}/${repo}/commits`,
    }
  } catch (err) {
    return {
      success: false,
      error: 'Invalid GitHub URL',
      devError: `URL parsing exception: ${err.message}`,
    }
  }
}

export default parseGitHubUrl
