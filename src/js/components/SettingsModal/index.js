import { normalizeRateLimitData } from '@/js/utils/rateLimit'
import notifications from '@/js/utils/notificationManager'
import { isAbortError } from '@/js/utils/matchers'
import { getUserMessage } from '@/js/errors'
import { logger } from '@/js/utils/logger'
import { notifyIfRateLimitHigh } from '@/js/utils/rateLimitWarning'
import styles from './styles.module.scss'

const UNAVAILABLE_RATE_LIMIT_TITLE = 'Rate limit data is unavailable.'

const tokenStatusDetails = {
  checking: {
    label: 'Checking',
    title: 'Checking whether the GitHub token is valid.',
  },
  valid: {
    label: 'Active',
    title: 'The token is active, now your limit is 5000 requests per hour.',
  },
  invalid: {
    label: 'Invalid',
    title: 'The token was rejected by GitHub.',
  },
  unavailable: {
    label: 'Unavailable',
    title: 'GitHub token status could not be checked.',
  },
  'no-token': {
    label: 'No token',
    title: 'No GitHub token is configured, so the limit is 60 requests per hour.',
  },
}

function getTokenStatusState(tokenError, hasToken) {
  if (!hasToken) return 'no-token'
  if (!tokenError) return 'valid'
  if (tokenError.status === 401) return 'invalid'

  return 'unavailable'
}

function renderTokenStatus(modal, tokenState) {
  const status = modal.querySelector('#token-status')
  const details = tokenStatusDetails[tokenState] || tokenStatusDetails.unavailable

  if (!status) return

  status.textContent = details.label
  status.title = details.title
  status.classList.toggle('active-color', tokenState === 'valid')
  status.classList.toggle('non-active-color', tokenState !== 'valid')
  status.setAttribute('aria-busy', String(tokenState === 'checking'))
}

function renderRateLimitProgressBar(modal, rateLimitData) {
  const progress = modal.querySelector('#settings-rest-api-limit-progress')
  const bar = modal.querySelector('#settings-rest-api-limit-bar')

  if (!progress || !bar) return

  if (!rateLimitData) {
    const title = UNAVAILABLE_RATE_LIMIT_TITLE

    bar.style.width = '0%'
    progress.title = title
    progress.setAttribute('aria-label', title)
    progress.removeAttribute('aria-valuenow')
    return
  }

  const { usedPerNumber, limitPerNumber, usedPerPercent } = normalizeRateLimitData(rateLimitData)
  const title = `Used: ${usedPerNumber} / ${limitPerNumber}`

  bar.style.width = `${usedPerPercent}%`
  progress.title = title
  progress.setAttribute('aria-label', title)
  progress.setAttribute('aria-valuenow', String(usedPerPercent))
}

const generateSettingsModalHTML = (rateLimitData, tokenState, versionDetails) => {
  const { usedPerNumber, limitPerNumber, usedPerPercent } = normalizeRateLimitData(rateLimitData)
  const tokenStatus = tokenStatusDetails[tokenState] || tokenStatusDetails.unavailable
  const rateLimitAvailable = Boolean(rateLimitData)
  const rateLimitLabel = rateLimitAvailable
    ? `Used: ${usedPerNumber} / ${limitPerNumber}`
    : UNAVAILABLE_RATE_LIMIT_TITLE

  const notStableMessage =
    "This version provides no guarantees regarding your security and the program's operability."

  const { version, versionIsStable } = versionDetails

  const stabilityLabel =
    versionIsStable === 'unknown'
      ? '<span class="text-small">(unknown)</span>'
      : versionIsStable === false
        ? `<span title="${notStableMessage}" class="text-small cursor-help">(not stable)</span>`
        : ''

  return `
        <div class="overlay">
            <div class="${styles.settings}" id="settings-content" role="dialog">
                <div class="${styles['settings-header']}">
                    <h1>Settings</h1>
                    <button class="close-button rounded-full" id="close-settings-button">&times;</button>
                </div>
                <div class="${styles['settings-content']}">
                    <div class="${styles['settings-section']}">
                        <h3>GitHub</h3>
                        <div class="${styles['settings-item']} rounded-normal border-sm">
                            <label for="token-input">GitHub rest api token</label>
                            <input style="height: 30px" class="rounded-normal border-sm" type="password" id="token-input" placeholder="ghp_ or github_pat_">
                        </div>
                        <div class="${styles['settings-item']} rounded-normal border-sm">
                            <span>GitHub Rest api token status:</span>
                            <span id="token-status" class="
                                ${tokenState === 'valid' ? 'active-color' : 'non-active-color'}
                                ${styles['settings-token-status']} rounded-full"
                                title="${tokenStatus.title}"
                                aria-live="polite"
                                aria-busy="${tokenState === 'checking'}"
                            >
                                ${tokenStatus.label}
                            </span>
                        </div>
                    </div>
                    <div class="${styles['settings-section']}">
                        <h3>LocalStorage</h3>
                        <div class="${styles['settings-item']} rounded-normal border-sm">
                            <span id="save-link-label">Save current repo in page</span>
                            <input class="visually-hidden ${styles['settings-toggle-input']}" type="checkbox" id="save-link" aria-labelledby="save-link-label">
                            <label class="${styles['settings-toggle-button']} rounded-full" for="save-link"></label>
                        </div>
                        <div class="${styles['settings-item']} rounded-normal border-sm">
                            <span id="save-token-label">Save current token in page</span>
                            <input class="visually-hidden ${styles['settings-toggle-input']}" type="checkbox" id="save-token" aria-labelledby="save-token-label">
                            <label class="${styles['settings-toggle-button']} rounded-full" for="save-token"></label>
                        </div>
                        <div class="${styles['settings-item']} rounded-normal border-sm">
                            <span>Rest API Limit:</span>
                            <div
                                id="settings-rest-api-limit-progress"
                                class="${styles['settings-rest-api-limit-progress']}
                                rounded-full border-normal"
                                title="${rateLimitLabel}"
                                role="progressbar"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                ${rateLimitAvailable ? `aria-valuenow="${usedPerPercent}"` : ''}
                                aria-label="${rateLimitLabel}"
                            >
                                <span id="settings-rest-api-limit-bar"
                                    class="${styles['settings-rest-api-limit-bar']}"
                                    style="width: ${rateLimitAvailable ? usedPerPercent : 0}%"></span>
                            </div>
                        </div>
                    </div>
                    <div class="${styles['settings-version-text-container']}">
                        <span class="text-small">Version: </span>
                        <a class="text-small link is-disabled" href="#" target="_blank" title="View in changelog" aria-disabled="true">${version}</a>
                        ${stabilityLabel}
                    </div>
                </div>
            </div>
        </div>
    `
}

function getSettingsModal() {
  return document.querySelector('#settings-content')?.closest('.overlay')
}

/**
 * @param {Element | null} [modal]
 * @param {() => void} [onClose]
 * @param {{
 *   storage?: {
 *     getData: () => { localStorage: { saveLink: boolean, saveToken: boolean } },
 *     setData: (data: object) => void,
 *   },
 *   localStorage?: { save: () => Promise<void> },
 *   gitHubClient?: {
 *     setToken: (token: string, options?: { signal?: AbortSignal }) => Promise<unknown>,
 *     getRateLimitData: (options?: { signal?: AbortSignal }) => Promise<unknown>,
 *   },
 * }} [options]
 */
function bindSettingsModalEvents(
  modal = getSettingsModal(),
  onClose,
  { storage, localStorage, gitHubClient } = {},
) {
  const modalContent = modal?.querySelector('#settings-content')

  if (!modal || !modalContent) return

  const controller = new AbortController()
  const { signal } = controller

  const closeButton = modal.querySelector('#close-settings-button')
  /** @type {HTMLInputElement | null} */
  const tokenInput = modal.querySelector('#token-input')
  /** @type {HTMLInputElement | null} */
  const saveLinkToggle = modal.querySelector('#save-link')
  /** @type {HTMLInputElement | null} */
  const saveTokenToggle = modal.querySelector('#save-token')
  async function saveToken() {
    const token = tokenInput.value.trim()

    renderTokenStatus(modal, 'checking')

    let tokenError = null

    try {
      await gitHubClient.setToken(token)
      if (signal.aborted) return
      if (token) notifications.notify('The token has been successfully set', 'success')
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return

      tokenError = error
      logger.error('Failed to validate the GitHub token:', error)
      notifications.notify(getUserMessage(error, 'Failed to validate GitHub token'), 'error')
    }

    if (signal.aborted) return

    const tokenState = getTokenStatusState(tokenError, Boolean(token))
    renderTokenStatus(modal, tokenState)

    if (!tokenError && storage.getData().localStorage.saveToken) {
      await saveLocalStorage()
    }

    let rateLimitData = null

    try {
      rateLimitData = await gitHubClient.getRateLimitData({ signal })
    } catch (error) {
      if (signal.aborted || isAbortError(error)) return

      logger.error('Failed to fetch rate limit data:', error)
      notifications.notify(getUserMessage(error, 'Failed to fetch rate limit data'), 'error')
    }

    if (!signal.aborted) {
      notifyIfRateLimitHigh(rateLimitData)
      renderRateLimitProgressBar(modal, rateLimitData)
    }
  }

  async function saveLocalStorage() {
    try {
      await localStorage.save()
    } catch (error) {
      // save() reports the failure at its own boundary.
      logger.debug('Failed to save the local storage state.', error)
    }
  }

  function closeModal() {
    if (signal.aborted) return

    tokenInput.value = ''
    controller.abort()
    modal.remove()
    onClose?.()
  }

  function handleOutsideClick(e) {
    if (e.target === modal) {
      closeModal()
    }
  }

  function handleEscapeKey(e) {
    if (e.code === 'Escape') {
      closeModal()
    }
  }

  async function toggleSaveLink() {
    storage.setData({ localStorage: { saveLink: saveLinkToggle.checked } })
    await saveLocalStorage()
  }

  async function toggleSaveToken() {
    storage.setData({ localStorage: { saveToken: saveTokenToggle.checked } })
    await saveLocalStorage()
  }

  tokenInput.addEventListener('blur', saveToken, { signal })
  closeButton.addEventListener('click', closeModal, { signal })
  document.addEventListener('click', handleOutsideClick, { signal })
  document.addEventListener('keydown', handleEscapeKey, { signal })

  saveLinkToggle.checked = storage.getData().localStorage.saveLink
  saveLinkToggle.addEventListener('change', toggleSaveLink, { signal })

  saveTokenToggle.checked = storage.getData().localStorage.saveToken
  saveTokenToggle.addEventListener('change', toggleSaveToken, { signal })

  return closeModal
}

export {
  generateSettingsModalHTML,
  bindSettingsModalEvents,
  getTokenStatusState,
  renderRateLimitProgressBar,
}
