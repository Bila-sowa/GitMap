import { decrypt, encrypt, isEncryptedValue } from '../utils/cipher.js'
import { isNonEmptyString, isPlainObject, isString } from '../utils/matchers.js'
import { CryptoError, ParseError, StorageError, getUserMessage } from '../errors/index.js'
import { logger } from '../utils/logger.js'
import encryptionKeyStore from '../data/encryptionKeyStore.js'

const STORAGE_KEY = 'GitMap'
const INVALID_PARSE_MESSAGE =
  'Invalid local storage parse. Please check your data in the local storage or delete its data.'
const SAVE_ERROR_MESSAGE = 'Unable to save data in local storage.'
const ENCRYPT_ERROR_MESSAGE = 'Unable to encrypt the token for local storage.'
const INVALID_TOKEN_MESSAGE = 'Invalid saved token data. Please enter the token again.'
const DECRYPT_ERROR_MESSAGE = 'Unable to decrypt the saved token. Please enter the token again.'

class LocalStorageController {
  #storage
  #notifications
  #keyStore
  #writeQueue = Promise.resolve()

  constructor(storage, notifications, keyStore = encryptionKeyStore) {
    this.#storage = storage
    this.#notifications = notifications
    this.#keyStore = keyStore
  }

  async init() {
    return await this.load()
  }

  destroy() {}

  async save() {
    return await this.#enqueue(async () => {
      const currentData = this.#storage.getData()
      const token = await this.#encryptToken(currentData)

      const dataToSave = {
        ...currentData,
        localStorage: { ...currentData.localStorage },
        link: currentData.localStorage.saveLink ? currentData.link : '',
        token,
      }

      try {
        globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
      } catch (cause) {
        const error = new StorageError('Unable to save the local storage data', {
          cause,
          userMessage: SAVE_ERROR_MESSAGE,
          context: 'LocalStorageController.save',
        })

        this.#notifyError(error)
        throw error
      }
    })
  }

  get() {
    let value

    try {
      value = globalThis.localStorage.getItem(STORAGE_KEY)
    } catch (cause) {
      throw new ParseError('Unable to read the local storage data', {
        cause,
        userMessage: INVALID_PARSE_MESSAGE,
        context: 'LocalStorageController.get',
      })
    }

    if (!value) return {}

    try {
      const parsed = JSON.parse(value)

      if (!isPlainObject(parsed)) {
        throw new ParseError('The stored local storage value is not an object', {
          userMessage: INVALID_PARSE_MESSAGE,
          context: 'LocalStorageController.get',
        })
      }

      return parsed
    } catch (cause) {
      if (cause instanceof ParseError) throw cause

      throw new ParseError('Unable to parse the local storage data', {
        cause,
        userMessage: INVALID_PARSE_MESSAGE,
        context: 'LocalStorageController.get',
      })
    }
  }

  async load() {
    let data

    try {
      data = this.get()
    } catch (error) {
      this.#notifyError(error)
      return null
    }

    if (!Object.keys(data).length) return null

    const update = {}

    if (data.theme) update.theme = data.theme
    if (data.localStorage) update.localStorage = data.localStorage
    if (data.history) update.history = data.history

    if (Object.keys(update).length) {
      try {
        this.#storage.setData(update)
      } catch (error) {
        // Invalid stored values (e.g. unknown theme) are silently ignored;
        // setData applies what it can before throwing, so partial updates take effect.
        logger.debug('Ignoring invalid stored values while loading local storage.', error)
      }
    }

    const { localStorage: ls } = this.#storage.getData()
    let shouldRewrite = false

    if (ls.saveLink && data.link) {
      try {
        this.#storage.setData({ link: data.link })
      } catch (error) {
        // Invalid stored link is ignored to prevent initialization failure.
        logger.debug('Ignoring an invalid stored link.', error)
      }
    }

    if (ls.saveToken && data.token) {
      const token = await this.#decryptToken(data.token)

      if (token === null) {
        shouldRewrite = true
      } else {
        try {
          this.#storage.setData({ token })
        } catch (error) {
          logger.debug('Ignoring an invalid stored token.', error)
          shouldRewrite = true
        }

        if (!isEncryptedValue(data.token)) shouldRewrite = true
      }
    } else if (data.token) {
      shouldRewrite = true
    }

    if (shouldRewrite) {
      try {
        await this.save()
      } catch (error) {
        // save() already reports the failure at this boundary.
        logger.debug('Failed to rewrite the local storage data.', error)
      }
    }

    return this.#storage.getData()
  }

  async #encryptToken(currentData) {
    if (!currentData.localStorage.saveToken || !isNonEmptyString(currentData.token)) return ''

    try {
      const key = await this.#keyStore.getKey()

      return await encrypt(currentData.token, key)
    } catch (cause) {
      const error = new CryptoError('Unable to encrypt the token for local storage', {
        cause,
        userMessage: ENCRYPT_ERROR_MESSAGE,
        context: 'LocalStorageController.#encryptToken',
      })

      this.#notifyError(error)
      this.#removePlaintextToken()
      throw error
    }
  }

  #removePlaintextToken() {
    let stored

    try {
      stored = this.get()
    } catch (error) {
      logger.debug('Unable to inspect the stored token for plaintext cleanup.', error)
      return
    }

    if (!isNonEmptyString(stored?.token) || isEncryptedValue(stored.token)) return

    try {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, token: '' }))
    } catch (error) {
      // The failed save already reports the storage error to the user.
      logger.warn('Failed to remove the plaintext token from local storage.', error)
    }
  }

  async #decryptToken(storedToken) {
    if (isString(storedToken)) return storedToken

    if (!isEncryptedValue(storedToken)) {
      this.#notifications.notify(INVALID_TOKEN_MESSAGE, 'error')
      return null
    }

    try {
      const key = await this.#keyStore.getKey()

      return await decrypt(storedToken, key)
    } catch (error) {
      logger.error('Failed to decrypt the saved token:', error)
      this.#notifications.notify(DECRYPT_ERROR_MESSAGE, 'error')
      return null
    }
  }

  #notifyError(error) {
    this.#notifications.notify(getUserMessage(error, SAVE_ERROR_MESSAGE), 'error')
  }

  #enqueue(task) {
    const result = this.#writeQueue.then(task, task)

    this.#writeQueue = result.then(
      () => undefined,
      () => undefined,
    )

    return result
  }
}

export { LocalStorageController }
