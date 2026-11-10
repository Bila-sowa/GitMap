import { assert, assertString } from './assertions.js'
import { isNonEmptyString, isPlainObject } from './matchers.js'
import { CryptoError } from '@/js/errors'

const ALGORITHM = 'AES-GCM'
const IV_LENGTH = 12
const KEY_LENGTH = 256
const ENVELOPE_VERSION = 1

function toBase64(bytes) {
  let binary = ''

  for (const byte of bytes) binary += String.fromCharCode(byte)

  return btoa(binary)
}

function fromBase64(value) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)

  return bytes
}

async function generateKey() {
  try {
    return await globalThis.crypto.subtle.generateKey(
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt'],
    )
  } catch (cause) {
    throw new CryptoError('generateKey: unable to generate an encryption key', {
      cause,
      userMessage: 'Unable to create the encryption key.',
      context: 'cipher.generateKey',
    })
  }
}

function isEncryptedValue(value) {
  return (
    isPlainObject(value) &&
    value.v === ENVELOPE_VERSION &&
    isNonEmptyString(value.iv) &&
    isNonEmptyString(value.data)
  )
}

function assertEncryptedValue(value) {
  assert(isEncryptedValue(value), 'decrypt: expected an encrypted value envelope', {
    context: 'cipher.decrypt',
  })
}

async function encrypt(plaintext, key) {
  assertString(plaintext, `encrypt: plaintext must be a string, got ${typeof plaintext}`, {
    context: 'cipher.encrypt',
  })

  try {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    const encrypted = await globalThis.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      new TextEncoder().encode(plaintext),
    )

    return {
      v: ENVELOPE_VERSION,
      iv: toBase64(iv),
      data: toBase64(new Uint8Array(encrypted)),
    }
  } catch (cause) {
    throw new CryptoError('encrypt: unable to encrypt the value', {
      cause,
      userMessage: 'Unable to encrypt the token for local storage.',
      context: 'cipher.encrypt',
    })
  }
}

async function decrypt(envelope, key) {
  assertEncryptedValue(envelope)

  try {
    const decrypted = await globalThis.crypto.subtle.decrypt(
      { name: ALGORITHM, iv: fromBase64(envelope.iv) },
      key,
      fromBase64(envelope.data),
    )

    return new TextDecoder().decode(decrypted)
  } catch (cause) {
    throw new CryptoError('decrypt: unable to decrypt the value', {
      cause,
      userMessage: 'Unable to decrypt the saved token. Please enter the token again.',
      context: 'cipher.decrypt',
    })
  }
}

export { decrypt, encrypt, generateKey, isEncryptedValue }
