import { isPlainObject } from '../utils/matchers'
import { config } from '@/js/api/config'

class Storage {
  #link = ''
  #theme = 'system'
  #token = ''
  #history = []
  #localStorage = {
    saveLink: false,
    saveToken: false,
  }

  getData() {
    return {
      link: this.#link,
      theme: this.#theme,
      token: this.#token,
      history: [...this.#history],
      localStorage: { ...this.#localStorage },
    }
  }

  setData(data = {}) {
    if (!isPlainObject(data)) {
      throw new TypeError('setData: expected a plain object')
    }

    if (data.link !== undefined) {
      if (typeof data.link !== 'string') {
        throw new TypeError(`setData: link must be a string, got ${typeof data.link}`)
      }
      this.#link = data.link.trim()
    }

    if (data.token !== undefined) {
      if (typeof data.token !== 'string') {
        throw new TypeError(`setData: token must be a string, got ${typeof data.token}`)
      }

      this.#token = data.token.trim()
    }

    if (data.localStorage !== undefined) {
      if (
        data.localStorage === null ||
        typeof data.localStorage !== 'object' ||
        Array.isArray(data.localStorage)
      ) {
        throw new TypeError('setData: localStorage must be a plain object')
      }

      const { saveLink, saveToken } = data.localStorage

      if (saveLink !== undefined) {
        if (typeof saveLink !== 'boolean') {
          throw new TypeError(
            `setData: localStorage.saveLink must be a boolean, got ${typeof saveLink}`,
          )
        }
        this.#localStorage.saveLink = saveLink
      }
      if (saveToken !== undefined) {
        if (typeof saveToken !== 'boolean') {
          throw new TypeError(
            `setData: localStorage.saveToken must be a boolean, got ${typeof saveToken}`,
          )
        }
        this.#localStorage.saveToken = saveToken
      }
    }

    if (data.theme !== undefined) {
      const theme = typeof data.theme === 'string' ? data.theme.trim() : data.theme
      const isValid = theme === 'system' || theme === 'light-theme' || theme === 'dark-theme'
      this.#theme = isValid ? theme : 'system'
      if (!isValid) {
        throw new TypeError(
          `setData: invalid theme "${theme}", expected "system", "light-theme", or "dark-theme"`,
        )
      }
    }

    if (data.history !== undefined) {
      if (!Array.isArray(data.history)) {
        throw new TypeError('setData: history must be an array')
      }

      const history = data.history.map((item) => {
        if (typeof item !== 'string') {
          throw new TypeError(`setData: history items must be strings, got ${typeof item}`)
        }

        return item.trim()
      })

      this.#history = history
        .filter(Boolean)
        .slice(0, config.settings.linkHistory.LINK_HISTORY_LIMIT)
    }
  }

  reset() {
    this.#link = ''
    this.#theme = 'system'
    this.#token = ''
    this.#history = []
    this.#localStorage = {
      saveLink: false,
      saveToken: false,
    }
  }
}

const storage = new Storage()
export { Storage }
export default storage
