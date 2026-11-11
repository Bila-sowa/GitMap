/**
 * Data contracts shared across the application. This file contains types only and is not
 * included in the bundle.
 */

type ThemeState = 'system' | 'dark-theme' | 'light-theme'

interface CommitAuthor {
  name: string
  email: string
  avatar: string
  url: string
  date: string
}

interface CommitDetails {
  author: CommitAuthor
  title: string
  description: string
  hash: string
  url: string
  sha: string
  parents: string[]
}

interface RepoData {
  defaultBranch: string
  commitsDetails: CommitDetails[]
  branchesDetails: string[]
}

interface CommitFile {
  name: string
  additions: number
  deletions: number
  extension: string
  fullStatus: string
  status: string
}

interface CommitFilesData {
  files: CommitFile[]
  truncated: boolean
}

interface RawBranch {
  name: string
}

interface RawCommitAuthor {
  name: string
  email: string
  date: string
}

interface RawCommitUser {
  avatar_url?: string | null
  html_url?: string | null
}

interface RawCommit {
  sha: string
  html_url?: string
  commit: { message: string; author: RawCommitAuthor }
  author?: RawCommitUser | null
  parents?: Array<{ sha?: string }>
}

interface RawCommitFile {
  filename: string
  status: string
  additions: number
  deletions: number
}

interface RawRepoResponse {
  defaultBranch?: string
  branches: RawBranch[]
  commits: RawCommit[]
}

interface RawCommitFilesResponse {
  files: RawCommitFile[]
}

interface StoragePreferences {
  saveLink: boolean
  saveToken: boolean
}

interface StorageData {
  link: string
  theme: ThemeState
  token: string
  history: string[]
  localStorage: StoragePreferences
}

interface VersionDetails {
  version: string
  versionType: string
  versionIsStable: boolean | 'unknown'
}

interface AppSettings {
  graph: { renderLimit: number }
  gitHub: { REQUEST_TIMEOUT_MS: number }
  notifications: { showNotifications: boolean; COOLDOWN_MS: number }
  loader: { showLoader: boolean; CLEANUP_TIMEOUT_MS: number }
  linkHistory: { HIDE_DELAY_MS: number; LINK_HISTORY_LIMIT: number }
}

interface AppConfig {
  name: string
  debug: boolean
  versionDetails: VersionDetails
  settings: AppSettings
}

interface RequestOptions {
  signal?: AbortSignal
}

interface TransportRequestOptions extends RequestOptions {
  authorization?: string
  paginate?: boolean
  parseJson?: boolean
  userMessage?: string
  context?: string
}

interface AppErrorOptions {
  cause?: unknown
  userMessage?: string
  code?: string
  context?: string
  [key: string]: unknown
}

interface HttpErrorOptions extends AppErrorOptions {
  status?: number
  url?: string
  apiMessage?: string
}

interface RateLimitData {
  limitPerNumber: number
  usedPerNumber: number
  usedPerPercent: number
}
