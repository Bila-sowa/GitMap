import GitHubHttpApi from './gitHubHttpApi'
import GitHubTokenManager from './gitHubTokenManager'
import GitHubRateLimiter from './gitHubRateLimiter'
import GitHubDataParser from './gitHubDataParser'
import parseGitHubUrl from './gitHubUrlParser'
import { isNonEmptyString } from '@/js/utils/matchers'
import { toTrimmedString } from '@/js/utils/coercions'
import { ValidationError } from '@/js/errors'
import storage from '@/js/data/storage'
import GitHubTransport from './gitHubTransport'

class GitHubClient extends GitHubHttpApi {
  #headers = { Accept: 'application/vnd.github+json' }
  #tokenManager
  #rateLimiter
  #parser
  #transport

  constructor() {
    super()
    this.#rateLimiter = new GitHubRateLimiter()
    this.#transport = new GitHubTransport(this.#headers, this, {
      onResponse: (response) => this.#rateLimiter.updateFromHeaders(response.headers),
    })
    this.#rateLimiter.setTransport(this.#transport)
    this.#tokenManager = new GitHubTokenManager(
      this.#headers,
      this,
      storage,
      undefined,
      this.#transport,
    )
    this.#parser = new GitHubDataParser()
  }

  async #getRawData(url, options = {}) {
    const formatted = parseGitHubUrl(url)

    const requestOptions = {
      signal: options.signal,
      userMessage: 'Failed to fetch repository data',
      context: '#getRawData',
    }
    const [repository, branches, commits] = await Promise.all([
      this.#transport.getJson(formatted.repositoryLink, requestOptions),
      this.#transport.getJson(formatted.branchLink, { ...requestOptions, paginate: true }),
      this.#transport.getJson(formatted.commitsLink, requestOptions),
    ])

    return {
      defaultBranch: repository?.default_branch,
      branches,
      commits,
    }
  }

  async getData(url, options = {}) {
    const data = await this.#getRawData(url, options)

    return this.#parser.parseRepoData(data)
  }

  async getDataByBranch(name, url = storage.getData().link, options = {}) {
    const branchName = toTrimmedString(name)

    if (!isNonEmptyString(branchName)) {
      throw new ValidationError('getDataByBranch requires a valid branch name parameter', {
        userMessage: 'Missing branch name',
        context: 'getDataByBranch',
      })
    }

    const formatted = parseGitHubUrl(url)
    const commitsUrl = `${formatted.commitsLink}?sha=${encodeURIComponent(branchName)}`
    const commits = await this.#transport.getJson(commitsUrl, {
      signal: options.signal,
      userMessage: 'Failed to fetch branch commits',
      context: 'getDataByBranch',
    })

    return this.#parser.parseCommitsData(commits)
  }

  async getCommitFiles(url, sha, options = {}) {
    const formatted = parseGitHubUrl(url)

    if (!isNonEmptyString(sha)) {
      throw new ValidationError('getCommitFiles requires a valid commit SHA parameter', {
        userMessage: 'Missing commit SHA',
        context: 'getCommitFiles',
      })
    }

    const commitUrl = `${formatted.commitsLink}/${sha}`
    const commit = await this.#transport.getJson(commitUrl, {
      signal: options.signal,
      userMessage: 'Failed to fetch commit files',
      context: 'getCommitFiles',
    })

    return this.#parser.parseCommitFilesData(commit)
  }

  async setToken(token, options = {}) {
    return await this.#tokenManager.setToken(token, options)
  }

  async getRateLimitData(options = {}) {
    return await this.#rateLimiter.getRateLimitData(options)
  }

  getCachedRateLimitData() {
    return this.#rateLimiter.getCachedRateLimitData()
  }

  checkIsRateLimitHigh(rateLimitData, percent = 70) {
    return this.#rateLimiter.checkIsRateLimitHigh(rateLimitData, percent)
  }
}

const gitHubClient = new GitHubClient()

export { GitHubClient }
export default gitHubClient
