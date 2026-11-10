import { isString } from '../utils/matchers'
import { DEFAULT_THEME, isThemeState } from '../utils/theme'
import { config } from '@/js/api/config'
import {
  assert,
  assertArray,
  assertBoolean,
  assertPlainObject,
  assertString,
} from '@/js/utils/assertions'

class Storage {
  #link = ''
  #theme = DEFAULT_THEME
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
    const context = 'Storage.setData'

    assertPlainObject(data, 'setData: expected a plain object', { context })

    if (data.link !== undefined) {
      assertString(data.link, `setData: link must be a string, got ${typeof data.link}`, {
        context,
      })
      this.#link = data.link.trim()
    }

    if (data.token !== undefined) {
      assertString(data.token, `setData: token must be a string, got ${typeof data.token}`, {
        context,
      })

      this.#token = data.token.trim()
    }

    if (data.localStorage !== undefined) {
      assertPlainObject(data.localStorage, 'setData: localStorage must be a plain object', {
        context,
      })

      const { saveLink, saveToken } = data.localStorage

      if (saveLink !== undefined) {
        assertBoolean(
          saveLink,
          `setData: localStorage.saveLink must be a boolean, got ${typeof saveLink}`,
          { context },
        )
        this.#localStorage.saveLink = saveLink
      }
      if (saveToken !== undefined) {
        assertBoolean(
          saveToken,
          `setData: localStorage.saveToken must be a boolean, got ${typeof saveToken}`,
          { context },
        )
        this.#localStorage.saveToken = saveToken
      }
    }

    if (data.theme !== undefined) {
      const theme = isString(data.theme) ? data.theme.trim() : data.theme
      const isValid = isThemeState(theme)
      this.#theme = isValid ? theme : DEFAULT_THEME
      assert(
        isValid,
        `setData: invalid theme "${theme}", expected "system", "light-theme", or "dark-theme"`,
        { context, userMessage: 'Invalid theme value' },
      )
    }

    if (data.history !== undefined) {
      assertArray(data.history, 'setData: history must be an array', { context })

      const history = data.history.map((item) => {
        assertString(item, `setData: history items must be strings, got ${typeof item}`, {
          context,
        })

        return item.trim()
      })

      this.#history = history
        .filter(Boolean)
        .slice(0, config.settings.linkHistory.LINK_HISTORY_LIMIT)
    }
  }

  reset() {
    this.#link = ''
    this.#theme = DEFAULT_THEME
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
