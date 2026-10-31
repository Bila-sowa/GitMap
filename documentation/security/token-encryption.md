# Token Encryption

GitMap keeps a configured GitHub token in application memory so it can authenticate GitHub REST API requests. When **Save current token in page** is enabled, the token is also persisted in `localStorage`. This document describes how that persisted value is encrypted, what the encryption protects against, and what it does not.

## Threat model

The encryption protects the token **at rest** in `localStorage`. It prevents the token from appearing as plain text in:

- the browser's storage inspector;
- storage dumps, backups, and screenshots of the Application tab;
- tools and extensions that can read `localStorage` but cannot execute code in the page.

It does **not** protect against code execution in the page. Cross-site scripting, a compromised dependency, or a browser extension with page access can:

- read the decrypted token from `Storage`, the GitHub client headers, or the Settings input;
- call `crypto.subtle.decrypt` with the same non-extractable key;
- replace `fetch`, `crypto.subtle.decrypt`, or storage methods before the application starts.

A non-extractable `CryptoKey` prevents exporting the raw key material through JavaScript, but it does not prevent using the key. The application must decrypt the token during bootstrap to authenticate requests, so the plaintext exists in memory for the lifetime of the page.

Encryption therefore raises the cost of opportunistic storage inspection. It is not a substitute for a strict Content Security Policy, short-lived fine-grained tokens, or not persisting the token at all.

## Design

- `src/js/utils/cipher.js` implements AES-256-GCM through Web Crypto. Every call generates a fresh 12-byte initialization vector. The result is an envelope with a version, the IV, and the ciphertext, both encoded as base64.
- `src/js/data/encryptionKeyStore.js` stores one non-extractable AES-GCM key in IndexedDB (`GitMap` database, `keys` object store, `token` record). The key is created lazily on the first save that includes a token.
- `src/js/controllers/localStorage.js` encrypts only the `token` field. The repository link, theme, and save flags remain readable so the application can restore its interface without the key.
- Saves are serialized through an internal queue so concurrent writes cannot commit out of order.
- If IndexedDB is unavailable, the token is not persisted. The application never falls back to plaintext.

## Envelope format

```json
{
  "v": 1,
  "iv": "<base64 12-byte initialization vector>",
  "data": "<base64 AES-GCM ciphertext and authentication tag>"
}
```

The `GitMap` `localStorage` record keeps its existing shape; only `token` changes from a string to this envelope.

## Key lifecycle

- The key is created on the first save with a non-empty token and reused afterwards.
- The key is scoped to the application origin by IndexedDB.
- `EncryptionKeyStore.deleteKey()` removes the stored key. A later save creates a new one.
- Clearing site data removes the key and the ciphertext together.

## Migration and failure handling

- A legacy plaintext string in `token` is loaded, then rewritten as an envelope on the same load.
- If `saveToken` is disabled, any persisted token is removed during load instead of waiting for the next save.
- If the envelope is malformed, the key is missing, or decryption fails, the token is discarded, the user is notified, and the rest of the saved settings are preserved. The application does not crash during bootstrap.

## DOM handling

The Settings modal no longer interpolates the token into the generated HTML string. The value is assigned to the input through the `value` property after the modal is inserted and cleared when the modal closes. This keeps the token out of serialized markup and `outerHTML`, but the input value is still plaintext while the modal is open.

## Verification

- `tests/utils/cipher.test.js` covers round trips, unique IVs, tampered ciphertext, wrong keys, and malformed envelopes.
- `tests/data/encryptionKeyStore.test.js` covers key creation, reuse, deletion, concurrency, and unavailable IndexedDB.
- `tests/controllers/localStorage.test.js` covers encrypted saves, decryption on load, legacy migration, disabled saving, decryption failures, encryption failures, and write ordering.
