import { config } from '../api/config'
import { generateLoader, removeLoader } from '../components/Loader/index.js'
import {
  bindSettingsModalEvents,
  generateSettingsModalHTML,
  getTokenStatusState,
} from '../components/SettingsModal/index.js'
import notifications from '../utils/notificationManager.js'
import { isNonEmptyString, isAbortError } from '../utils/matchers.js'
import { getUserMessage } from '../errors/index.js'
import { logger } from '../utils/logger.js'
import { notifyIfRateLimitHigh } from '../utils/rateLimitWarning.js'

class SettingsController {
  #button
  #gitHubClient
  #storage
  #localStorage
  #abortController = null
  #closeModal = null

  #isOpening = false

  #modal = null

  constructor(button, gitHubClient, storage, localStorage) {
    this.#button = button
    this.#gitHubClient = gitHubClient
    this.#storage = storage
    this.#localStorage = localStorage
  }

  init() {
    this.#bindEvents()
    return this
  }

  #bindEvents() {
    this.#abortController?.abort()
    this.#abortController = new AbortController()
    this.#button.addEventListener('click', () => this.#openSettings(), {
      signal: this.#abortController.signal,
    })
  }

  async #openSettings() {
    if (this.#isOpening || this.#modal?.isConnected) return

    this.#isOpening = true
    const { signal } = this.#abortController
    const loader = generateLoader()

    try {
      const token = this.#storage.getData().token
      let tokenError = null

      if (isNonEmptyString(token)) {
        try {
          await this.#gitHubClient.setToken(token, { signal })
          notifications.notify('The token has been successfully set', 'success')
        } catch (error) {
          if (signal.aborted || isAbortError(error)) return

          tokenError = error
          logger.error('Failed to validate the saved GitHub token:', error)
          notifications.notify(getUserMessage(error, 'Failed to validate GitHub token'), 'error')
        }
      }

      if (signal.aborted) return
      const tokenState = getTokenStatusState(tokenError, Boolean(token))

      let rateLimitData = null

      try {
        rateLimitData = await this.#gitHubClient.getRateLimitData({ signal })
        notifyIfRateLimitHigh(rateLimitData)
      } catch (error) {
        if (signal.aborted || isAbortError(error)) return

        logger.error('Failed to fetch rate limit data for the settings modal:', error)
        notifications.notify(getUserMessage(error, 'Failed to fetch rate limit data'), 'error')
      }

      if (signal.aborted) return
      const modalHTML = generateSettingsModalHTML(rateLimitData, tokenState, config.versionDetails)

      if (!modalHTML) return

      const template = document.createElement('template')
      template.innerHTML = modalHTML.trim()
      const modal = template.content.firstElementChild

      if (!modal) return

      document.body.append(modal)
      const tokenInput = modal.querySelector('#token-input')
      if (tokenInput) tokenInput.value = token
      this.#modal = modal
      this.#closeModal = bindSettingsModalEvents(
        modal,
        () => {
          if (this.#modal === modal) this.#modal = null
          this.#closeModal = null
        },
        {
          storage: this.#storage,
          localStorage: this.#localStorage,
          gitHubClient: this.#gitHubClient,
        },
      )
    } catch (error) {
      notifications.notify('Failed to open settings', 'error')
      logger.error('Failed to open settings:', error)
    } finally {
      this.#isOpening = false
      removeLoader(loader)
    }
  }

  destroy() {
    this.#abortController?.abort()
    this.#abortController = null
    this.#closeModal?.()
  }
}

export { SettingsController }
