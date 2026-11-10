import formatter from '@/js/utils/formatter'
import { isFiniteNumber, isNonEmptyString, isRecord, isValidDate } from '@/js/utils/matchers'
import { toArray } from '@/js/utils/coercions'
import { escapeHTML } from '@/js/utils/utils'
import { ParseError } from '@/js/errors'

const isValidCommitAuthor = (author) => {
  return (
    isRecord(author) &&
    isNonEmptyString(author.name) &&
    isNonEmptyString(author.email) &&
    isValidDate(author.date)
  )
}

const isValidCommit = (commit) => {
  const commitData = commit?.commit

  return (
    isRecord(commit) &&
    isNonEmptyString(commit.sha) &&
    isRecord(commitData) &&
    isNonEmptyString(commitData.message) &&
    isValidCommitAuthor(commitData.author) &&
    (commit.author === null || commit.author === undefined || isRecord(commit.author))
  )
}

const isValidCommitFile = (file) => {
  return (
    isRecord(file) &&
    isNonEmptyString(file.filename) &&
    isNonEmptyString(file.status) &&
    isFiniteNumber(file.additions) &&
    isFiniteNumber(file.deletions)
  )
}

class GitHubDataParser {
  #throwInvalidData(method) {
    throw new ParseError(`Invalid response data in ${method}`, {
      userMessage: 'Unexpected response format from GitHub',
      context: method,
    })
  }

  parseBranchesData(branches) {
    if (!Array.isArray(branches) || !branches.length) {
      this.#throwInvalidData('parseBranchesData')
    }

    const branchesDetails = []

    for (const branch of branches) {
      if (!isRecord(branch) || !isNonEmptyString(branch.name)) {
        this.#throwInvalidData('parseBranchesData')
      }

      branchesDetails.push(branch.name)
    }

    return branchesDetails
  }

  parseCommitsData(commits) {
    if (!Array.isArray(commits) || !commits.length) {
      this.#throwInvalidData('parseCommitsData')
    }

    const commitsDetails = []

    for (const commit of commits) {
      if (!isValidCommit(commit)) {
        this.#throwInvalidData('parseCommitsData')
      }

      const commitData = commit.commit
      const author = commitData.author

      const formattedTitle = formatter.getFormattedTitle(commitData.message)
      const formattedDescription = formatter.getFormattedDescription(commitData.message)
      const shortHash = formatter.getShortHash(commit.sha)

      const details = {
        author: {
          name: escapeHTML(author.name),
          email: escapeHTML(author.email),
          avatar: isNonEmptyString(commit.author?.avatar_url) ? commit.author.avatar_url : '',
          url: isNonEmptyString(commit.author?.html_url) ? commit.author.html_url : '',
          date: author.date,
        },
        title: escapeHTML(formattedTitle),
        description: formattedDescription ? escapeHTML(formattedDescription) : '',
        hash: shortHash,
        url: isNonEmptyString(commit.html_url) ? commit.html_url : '',
        sha: commit.sha,
        parents: toArray(commit.parents)
          .map((parent) => parent?.sha)
          .filter((sha) => isNonEmptyString(sha)),
      }

      commitsDetails.push(details)
    }

    return commitsDetails
  }

  parseRepoData(raw) {
    if (!isRecord(raw)) this.#throwInvalidData('parseRepoData')

    const branchNames = this.parseBranchesData(raw.branches)
    const commitsDetails = this.parseCommitsData(raw.commits)

    const branchesDetails = [...branchNames]
    const hasDefaultBranch = isNonEmptyString(raw.defaultBranch)
    const defaultBranch = hasDefaultBranch ? raw.defaultBranch.trim() : branchesDetails[0]

    if (defaultBranch && !branchesDetails.includes(defaultBranch)) {
      branchesDetails.unshift(defaultBranch)
    }

    return {
      defaultBranch,
      commitsDetails,
      branchesDetails,
    }
  }

  parseCommitFilesData(raw) {
    if (!isRecord(raw) || !Array.isArray(raw.files)) {
      this.#throwInvalidData('parseCommitFilesData')
    }

    const { files } = raw
    const formattedData = []

    for (const file of files) {
      if (!isValidCommitFile(file)) {
        this.#throwInvalidData('parseCommitFilesData')
      }

      const extension = formatter.getFormattedExtension(file.filename)
      const status = formatter.getShortStatus(file.status)

      const fileData = {
        name: escapeHTML(file.filename),
        additions: file.additions,
        deletions: file.deletions,
        extension: escapeHTML(extension),
        fullStatus: file.status,
        status: status,
      }

      formattedData.push(fileData)
    }

    return {
      files: formattedData,
      truncated: files.length >= 300,
    }
  }
}

export default GitHubDataParser
