import { isPlainObject } from './matchers.js'

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
  return await globalThis.crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

function isEncryptedValue(value) {
  return (
    isPlainObject(value) &&
    value.v === ENVELOPE_VERSION &&
    typeof value.iv === 'string' &&
    value.iv.length > 0 &&
    typeof value.data === 'string' &&
    value.data.length > 0
  )
}

function assertEncryptedValue(value) {
  if (!isEncryptedValue(value)) {
    throw new TypeError('decrypt: expected an encrypted value envelope')
  }
}

async function encrypt(plaintext, key) {
  if (typeof plaintext !== 'string') {
    throw new TypeError(`encrypt: plaintext must be a string, got ${typeof plaintext}`)
  }

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
}

async function decrypt(envelope, key) {
  assertEncryptedValue(envelope)

  const decrypted = await globalThis.crypto.subtle.decrypt(
    { name: ALGORITHM, iv: fromBase64(envelope.iv) },
    key,
    fromBase64(envelope.data),
  )

  return new TextDecoder().decode(decrypted)
}

export { decrypt, encrypt, generateKey, isEncryptedValue }
