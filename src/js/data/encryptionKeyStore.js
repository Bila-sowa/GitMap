import { generateKey } from '../utils/cipher.js'
import { StorageError } from '@/js/errors'

const DATABASE_NAME = 'GitMap'
const DATABASE_VERSION = 1
const STORE_NAME = 'keys'
const TOKEN_KEY_ID = 'token'

function openDatabase(indexedDB) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new StorageError('Unable to open the encryption key database'))
    request.onblocked = () =>
      reject(new StorageError('The encryption key database is blocked by another tab'))
  })
}

function readValue(database, id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new StorageError('Unable to read the encryption key'))
  })
}

/**
 * @param {IDBDatabase} database
 * @param {IDBValidKey} id
 * @param {unknown} value
 * @returns {Promise<void>}
 */
function writeValue(database, id, value) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')

    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new StorageError('Unable to store the encryption key'))

    const request = transaction.objectStore(STORE_NAME).put(value, id)

    request.onerror = () =>
      reject(request.error ?? new StorageError('Unable to store the encryption key'))
  })
}

/**
 * @param {IDBDatabase} database
 * @param {IDBValidKey} id
 * @returns {Promise<void>}
 */
function deleteValue(database, id) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')

    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new StorageError('Unable to delete the encryption key'))

    const request = transaction.objectStore(STORE_NAME).delete(id)

    request.onerror = () =>
      reject(request.error ?? new StorageError('Unable to delete the encryption key'))
  })
}

class EncryptionKeyStore {
  #indexedDB
  #databasePromise = null
  #keyPromise = null

  constructor(indexedDB = globalThis.indexedDB) {
    this.#indexedDB = indexedDB
  }

  async getKey() {
    if (this.#keyPromise) return await this.#keyPromise

    this.#keyPromise = this.#loadOrCreateKey().catch((error) => {
      this.#keyPromise = null
      throw error
    })

    return await this.#keyPromise
  }

  async deleteKey() {
    this.#keyPromise = null

    const database = await this.#getDatabase()

    await deleteValue(database, TOKEN_KEY_ID)
  }

  async #loadOrCreateKey() {
    const database = await this.#getDatabase()
    const existingKey = await readValue(database, TOKEN_KEY_ID)

    if (existingKey) return existingKey

    const key = await generateKey()

    await writeValue(database, TOKEN_KEY_ID, key)

    return key
  }

  #getDatabase() {
    if (!this.#indexedDB) {
      return Promise.reject(
        new StorageError('IndexedDB is not available', {
          userMessage: 'Unable to access the encryption key storage.',
          context: 'EncryptionKeyStore.getDatabase',
        }),
      )
    }

    if (!this.#databasePromise) {
      this.#databasePromise = openDatabase(this.#indexedDB).catch((error) => {
        this.#databasePromise = null
        throw error
      })
    }

    return this.#databasePromise
  }
}

const encryptionKeyStore = new EncryptionKeyStore()

export { EncryptionKeyStore }
export default encryptionKeyStore
