import { describe, test, expect } from 'vitest'
import { EncryptionKeyStore } from '@/js/data/encryptionKeyStore'
import { decrypt, encrypt } from '@/js/utils/cipher'

function createFakeIndexedDB() {
  const databases = new Map()

  function createStore(values) {
    return {
      get(id) {
        const request = {}

        queueMicrotask(() => {
          const value = values.get(id)
          request.result = value === undefined ? undefined : structuredClone(value)
          request.onsuccess?.()
        })

        return request
      },
      put(value, id) {
        const request = {}

        queueMicrotask(() => {
          values.set(id, structuredClone(value))
          request.onsuccess?.()
        })

        return request
      },
      delete(id) {
        const request = {}

        queueMicrotask(() => {
          values.delete(id)
          request.onsuccess?.()
        })

        return request
      },
    }
  }

  return {
    open(name) {
      const request = {}

      queueMicrotask(() => {
        if (!databases.has(name)) databases.set(name, new Map())

        const stores = databases.get(name)
        const database = {
          objectStoreNames: { contains: (storeName) => stores.has(storeName) },
          createObjectStore: (storeName) => {
            stores.set(storeName, new Map())
            return createStore(stores.get(storeName))
          },
          transaction: (storeName) => {
            const transaction = { oncomplete: null, onerror: null }
            const store = createStore(stores.get(storeName))

            transaction.objectStore = () => store
            queueMicrotask(() => {
              queueMicrotask(() => transaction.oncomplete?.())
            })

            return transaction
          },
        }

        request.result = database
        request.onupgradeneeded?.()
        request.onsuccess?.()
      })

      return request
    },
  }
}

describe('EncryptionKeyStore', () => {
  test('creates a non-extractable key once and reuses it', async () => {
    const store = new EncryptionKeyStore(createFakeIndexedDB())
    const first = await store.getKey()
    const second = await store.getKey()

    expect(first).toBe(second)
    expect(first.extractable).toBe(false)
    expect(first.algorithm.name).toBe('AES-GCM')
  })

  test('creates a new key after the stored key is deleted', async () => {
    const store = new EncryptionKeyStore(createFakeIndexedDB())
    const first = await store.getKey()

    await store.deleteKey()
    const second = await store.getKey()

    expect(second).not.toBe(first)
  })

  test('returns the same key for concurrent requests', async () => {
    const store = new EncryptionKeyStore(createFakeIndexedDB())
    const [first, second] = await Promise.all([store.getKey(), store.getKey()])

    expect(first).toBe(second)
  })

  test('persists the key for a new store instance', async () => {
    const indexedDB = createFakeIndexedDB()
    const firstStore = new EncryptionKeyStore(indexedDB)
    const firstKey = await firstStore.getKey()

    const secondStore = new EncryptionKeyStore(indexedDB)
    const secondKey = await secondStore.getKey()
    const envelope = await encrypt('ghp_secretToken', firstKey)
    const result = await decrypt(envelope, secondKey)

    expect(result).toBe('ghp_secretToken')
  })

  test('rejects when IndexedDB is unavailable', async () => {
    const store = new EncryptionKeyStore(null)
    const result = store.getKey()

    await expect(result).rejects.toThrow(Error)
  })
})
