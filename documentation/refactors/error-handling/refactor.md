# Error Handling and Runtime Validation Refactor

## Quick Navigation

| Section | Contents |
| --- | --- |
| [Status and scope](#status-and-scope) | What this plan covers and what it does not |
| [Starting point](#starting-point) | Current failure handling and its constraints |
| [Baseline](#baseline) | Recorded baseline checks and failure inventory |
| [Decisions](#decisions) | Approved direction for the refactor |
| [Target architecture](#target-architecture) | Layers, contracts, error types, logging, validation |
| [Migration rules](#migration-rules) | Rules that apply to every phase |
| [Phase 0](#phase-0) | Record the baseline and inventory |
| [Phase 1](#phase-1) | Add the error foundation |
| [Phase 2](#phase-2) | Migrate the data and utility layer |
| [Phase 3](#phase-3) | Migrate the GitHub API layer |
| [Phase 4](#phase-4) | Migrate controllers and the UI boundary |
| [Phase 5](#phase-5) | Clean up, document, and accept |
| [Verification](#verification) | Required checks and manual scenarios |
| [Risks](#risks) | Pitfalls and mitigations |
| [Acceptance criteria](#acceptance-criteria) | Definition of done |
| [Assumptions](#assumptions) | Decisions that must remain explicit |

<a id="status-and-scope"></a>

## Status and Scope

This document is a migration plan. It describes proposed behavior, not behavior
that has already been implemented. The current application remains on the
`{ success, error, devError }` result model until the phases below are applied.

Scope:

- All application code under `src/js`.
- Error propagation, error classification, runtime validation, logging, and
  user-facing failure messages.
- Tests and documentation required to keep the new behavior verified.

Out of scope:

- Migrating the project to TypeScript.
- Adding a runtime dependency or a build-time type checker.
- Redesigning the interface or changing the application flow.
- Rewriting user-facing copy that is not required by the new error model.
- Making `storage.setData` atomic.
- Making configuration loading fail-fast.
- Creating commits, tags, or releases.

<a id="starting-point"></a>

## Starting Point

`AGENT.md` requires focused changes, preservation of the project structure, and
no silent suppression of errors. The current code uses one failure channel for
almost every layer:

- `{ success: false, error, devError }` is returned by the GitHub client,
  transport, rate limiter, token manager, data parser, URL parser, controllers,
  local storage controller, and bootstrap helpers.
- There are more than 30 occurrences of `success: false` or `success: true` in
  `src/js`.
- `devError` is the only place where developer details survive. It is a plain
  object, not an `Error`, and it is not logged centrally.
- Some layers already discard the cause:
  - `src/js/controllers/localStorage.js` returns only `err.name`.
  - `src/js/controllers/graph.js` returns only `error.message`.
  - `src/js/controllers/settings.js` logs and shows a generic notification.
  - `src/js/api/config.js` logs the error and returns the default configuration.
- `gitHubTransport.js` distinguishes `cancelled` and `timedOut` with result
  flags instead of error types.
- `components/SettingsModal/index.js` depends on `devError.status === 401` to
  show the invalid-token state.

Existing typed validation:

- `src/js/data/storage.js` already throws `TypeError` for invalid input.
- `src/js/utils/cipher.js` already throws `TypeError`.
- `src/js/data/encryptionKeyStore.js` throws `Error` for IndexedDB failures.
- Existing tests assert `toThrow(TypeError)` for some of these paths.

Constraints discovered during planning:

- Local tests assert exact result shapes with `toStrictEqual`, including
  `devError` contents. A contract change requires updating those tests in the
  same phase.
- `vitest.config.js` lists local and e2e test files explicitly. Every new test
  file must be registered there.
- Configuration loading is intentionally resilient: a failed `config.json`
  request returns defaults.
- `storage.setData` validates fields as it applies them. Invalid stored values
  can leave a partial update in memory before throwing.
- An invalid stored token currently prevents the initial graph render in
  `bootstrap.js`.
- Notifications are currently emitted from API-layer modules as well as from
  controllers. The target architecture moves error notifications to the UI
  boundary.

At plan creation, the working tree was clean on branch `fix/error-handling`.
Phase 0 must re-check the working tree and record the actual baseline.

<a id="baseline"></a>

## Baseline and Inventory

Recorded on 2026-11-02 on branch `fix/error-handling`.

### Environment and working tree

- Node.js: `v26.7.0`.
- npm: `11.19.0`.
- Vitest: `5.0.3`.
- Vite: `8.2.1`.
- At the start of Phase 0, `git status --short` showed only the untracked
  `documentation/refactors/error-handling/` directory.
- No tracked source files are modified or staged.
- After the baseline checks, unrelated documentation changes appeared:
  `documentation/refactors/vitest/` was moved to
  `documentation/refactors/complete/vitest/`. Those changes were not created by
  this task and were left untouched. The baseline check results remain valid.
- `dist/` is generated build output and is not tracked as a source change.

### Baseline checks

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Passed, exit code 0 | 28 test files, 280 tests passed in 47.82 s |
| `npm run check:all` | Passed, exit code 0 | ESLint and Stylelint reported no errors |
| `npm run build` | Passed, exit code 0 | Vite transformed 54 modules and built in 10.31 s |

No pre-existing failures were observed in these commands. The local suite and
the build are green before the refactor starts.

### API-layer failure inventory

| Location | Current failure path | Cause handling | Target |
| --- | --- | --- | --- |
| `src/js/api/config.js:127-142` | `getConfigData` catches fetch and parse errors, logs with `console.error`, and returns defaults | Cause exists only in the console call | `ConfigError` internally; fail-soft at the configuration boundary; logger |
| `src/js/api/gitHubClient/gitHubUrlParser.js:15-22` | Invalid URL returns `{ success: false, error: 'Invalid GitHub URL', devError: string }` | `devError` is a formatted string | `ValidationError` or `ParseError` |
| `src/js/api/gitHubClient/gitHubUrlParser.js:30-36` | URL parsing exception returns the same failure shape | Original exception is reduced to `err.message` | `ParseError` with `cause` |
| `src/js/api/gitHubClient/gitHubUrlParser.js:24-29` | Success returns `{ success: true, repositoryLink, branchLink, commitsLink }` | Not applicable | Return the parsed links directly |
| `src/js/api/gitHubClient/gitHubHttpApi.js:11-39` | `createHttpError` returns `{ error, devError: { status, message, url } }` | Status and URL survive, but the result is not an `Error` | `HttpError` with `status`, `url`, and `apiMessage` |
| `src/js/api/gitHubClient/gitHubHttpApi.js:14-21` | Response-body JSON parse failure is logged and ignored | Cause is logged only | Keep the request alive; log through the central logger |
| `src/js/api/gitHubClient/gitHubTransport.js:22-28` | Invalid URL prevents the authorization header and logs a warning | Cause is logged only | Keep the safe fallback; use the central logger |
| `src/js/api/gitHubClient/gitHubTransport.js:42` | Invalid pagination URL throws a generic `Error` | No typed error | `ParseError` |
| `src/js/api/gitHubClient/gitHubTransport.js:64` | Pagination loop throws a generic `Error` | No typed error | `ParseError` |
| `src/js/api/gitHubClient/gitHubTransport.js:75-78` | Non-success HTTP response returns `{ success: false, ...httpError }` | Delegated to `createHttpError`; not an `Error` | `HttpError` |
| `src/js/api/gitHubClient/gitHubTransport.js:80-90` | Success paths return `{ success: true, data }` or `{ success: true }` | Not applicable | Return data directly; return `undefined` when parsing is disabled |
| `src/js/api/gitHubClient/gitHubTransport.js:84` | Non-array paginated response throws a generic `Error` | No typed error | `ParseError` |
| `src/js/api/gitHubClient/gitHubTransport.js:91-107` | Timeout, cancellation, and network failures return flags or `{ error, devError }` | Timeout and abort are flags; network cause is reduced to `err.message` and `stack` | `TimeoutError`, propagate `AbortError`, `NetworkError` with `cause` |
| `src/js/api/gitHubClient/gitHubDataParser.js:39-48` | Invalid payload returns `{ success: false, error, devError: { message, rawResponse } }` | Raw response is kept in `devError` | `ParseError` with method/source; do not expose raw payload in production logs |
| `src/js/api/gitHubClient/gitHubDataParser.js:65,108,131,167` | Success paths return `{ success: true, ...data }` | Not applicable | Return plain parsed data |
| `src/js/api/gitHubClient/gitHubClient.js:36-44` | `#notifyFailure` and `#createMissingParameterResult` notify and return failure objects | Cause is reduced to a message; notification is emitted by the API layer | `ValidationError`; UI owns notifications |
| `src/js/api/gitHubClient/gitHubClient.js:46-72` | `#getRawData` forwards parser/transport results and returns `{ success: true, ...data }` | Result composition loses the original error | Return plain data; let typed errors propagate |
| `src/js/api/gitHubClient/gitHubClient.js:74-136` | Public methods return transport and parser results unchanged | Cause is whatever the lower layer returned | Return plain data; throw typed errors |
| `src/js/api/gitHubClient/gitHubRateLimiter.js:18-38` | Malformed rate-limit headers are silently ignored; success is cached as `{ success: true, data }` | No cause is retained for malformed headers | Keep non-fatal; log at debug level; cache plain data |
| `src/js/api/gitHubClient/gitHubRateLimiter.js:44-58` | `checkIsRateLimitHigh` emits a warning notification | Warning is emitted by the API layer | Return the check result; UI decides whether to notify |
| `src/js/api/gitHubClient/gitHubRateLimiter.js:60-97` | Transport failure and invalid `resources.core` return failure objects with empty data | Cause is reduced to a message; notification is emitted here | `HttpError`/`ParseError`; UI shows unavailable data |
| `src/js/api/gitHubClient/gitHubTokenManager.js:18-52` | Validation failure notifies and returns the transport result; stale operations return `{ cancelled: true }`; success notifies and returns `{ success: true }` | Cancellation is a flag; notifications are emitted by the API layer | `HttpError`, `AbortError`, `void`; UI owns notifications |
| `src/js/api/gitHubClient/requestControl.js:4-29` | Internal `#timedOut` flag drives transport timeout detection | Not a public failure result | Keep internal; transport maps it to `TimeoutError` |

### Controller and component failure inventory

| Location | Current failure path | Cause handling | Target |
| --- | --- | --- | --- |
| `src/js/controllers/graph.js:57-89` | Missing link returns `{ success: false, error }`; cancellation returns a flag; catch returns `error.message` | Cause is reduced to a message; abort is a flag | Return `null` or `{ currentBranch }`; log full cause; notify; ignore `AbortError` |
| `src/js/controllers/graph.js:91-131` | Same pattern for branch rendering | Same as above | Same as above |
| `src/js/controllers/graph.js:368-384` | Commit-file failure silently returns from the click handler | Cause is discarded | Catch, log, and notify; ignore `AbortError` |
| `src/js/controllers/localStorage.js:25-47` | Encryption failure returns `{ success: false, error }`; storage write failure returns `{ error: err.name }` | Cause is reduced to `err.name` | `CryptoError`/`StorageError`; log and notify at the controller boundary |
| `src/js/controllers/localStorage.js:49-68` | Invalid stored JSON returns `{ data: {}, success: false }` or `{ error: err.name }` | Cause is reduced to `err.name`; parse details are lost | `ParseError`/`StorageError`; load handles and notifies |
| `src/js/controllers/localStorage.js:70-124` | Missing data returns `{ success: false, data: null }`; invalid stored values are partially applied | Some invalid values are intentionally ignored | Return `null` or data; keep intentional ignores with comments and debug logs |
| `src/js/controllers/localStorage.js:126-139` | Encryption failure returns `{ success: false, error: err.name }` | Cause is reduced to `err.name` | `CryptoError`; caller handles |
| `src/js/controllers/localStorage.js:141-156` | Plaintext-token cleanup failure is silently ignored | No cause is retained | Keep best-effort; comment and log at debug level |
| `src/js/controllers/localStorage.js:158-178` | Decryption failure logs with `console.error` and returns `null` | Cause is logged only | `CryptoError`/`ParseError`; load handles and notifies |
| `src/js/controllers/settings.js:50-92` | Token and rate-limit failures are caught, logged with `console.error`, and shown as a generic notification | Cause is logged only; token/rate-limit states are not distinguished | Distinguish `HttpError` 401 from unavailable; log full cause; keep the modal usable |
| `src/js/components/SettingsModal/index.js:29-35` | Token state depends on `devError.status === 401` | Depends on the old result shape | `HttpError.status` |
| `src/js/components/SettingsModal/index.js:181-202` | `saveToken` checks `result.cancelled` and `result.success` | Cancellation and success are result flags | Catch `AbortError`; use plain success/error state |
| `src/js/components/FullCommitModal/index.js:59,99` | File details depend on `filesData.success` | Failure is rendered as unavailable data | Consume plain `{ files, truncated }` |
| `src/js/controllers/link.js:264-281` | Link history and save decisions depend on `result.success` | Error state is reduced to a boolean | Adapt to `null`/`{ currentBranch }` from the graph |
| `src/js/controllers/refresh.js:19-21` | Refresh click calls the graph without awaiting or catching | Potential unhandled rejection | Catch and log at the UI boundary |
| `src/js/controllers/dropDown.js:56-74` | `onSelect` errors are not caught; only `aria-busy` cleanup runs in `finally` | Potential unhandled rejection | Catch and log; keep cleanup |
| `src/js/controllers/theme.js:50-56` | Theme save is not awaited or caught | Potential unhandled rejection | Catch, log, and notify without blocking theme application |
| `src/js/utils/utils.js:7-23` | Clipboard failure shows a notification but drops the cause | Cause is discarded | Keep the notification; log the cause |
| `src/js/bootstrap.js:29-32` | Missing token is represented as `{ success: true }` | Not a failure, but part of the old result contract | Remove the fallback result; handle the token error explicitly |
| `src/js/bootstrap.js:57-66` | Controller initialization failure cleans up and rethrows | Good behavior; no logging at this boundary | Keep cleanup; let `index.js` log and notify |
| `src/js/bootstrap.js:80-86` | Initial render depends on `tokenResult.success` | Token failure blocks rendering through a result flag | Preserve current skip behavior; handle the error explicitly |
| `src/js/index.js:4` | Fatal bootstrap failure is logged with `console.error` | Cause is logged only | Central logger plus a user-facing notification when possible |

### Data and utility failure inventory

| Location | Current failure path | Cause handling | Target |
| --- | --- | --- | --- |
| `src/js/data/storage.js:25-98` | Invalid data throws `TypeError` after applying earlier valid fields | The native error is preserved | `ValidationError`/`RangeValidationError`; keep partial-update behavior |
| `src/js/utils/cipher.js:42-77` | Invalid arguments throw `TypeError`; WebCrypto failures propagate as `DOMException` | Native errors are preserved | `ValidationError`; wrap WebCrypto failures in `CryptoError` with `cause` |
| `src/js/data/encryptionKeyStore.js:8-117` | IndexedDB and key operations reject with generic `Error` | Native error is preserved only as a rejection | `StorageError`/`CryptoError`; keep promise reset behavior |

### Test expectations that will change

| Location | Current expectation | Planned change |
| --- | --- | --- |
| `tests/vitest/expectInvalidParserResult.js` | Asserts `{ success: false, error, devError }` | Assert `ParseError` and its metadata |
| `tests/api/gitHubClient/gitHubDataParser/*` | Assert success result objects | Assert plain parsed data |
| `tests/api/gitHubClient/gitHubTransport/gitHubTransport.test.js` | Asserts success, cancelled, and HTTP error result objects | Assert plain data, `AbortError`, and `HttpError` |
| `tests/api/gitHubClient/gitHubHttpApi/createHttpError.test.js` | Asserts `devError` objects | Assert `HttpError` fields |
| `tests/api/gitHubClient/gitHubClient/local/*` | Asserts exact result shapes, `devError`, and `cancelled` | Assert data or typed errors |
| `tests/api/gitHubClient/gitHubClient/e2e/*` | Asserts success result shapes | Assert plain data and typed errors |
| `tests/controllers/localStorage.test.js` | Asserts `{ error: 'Error', success: false }` | Assert data/boolean and typed errors |
| `tests/controllers/link.test.js` | Passes `renderResult: { success: true/false }` | Pass `{ currentBranch }` or `null` |
| `tests/controllers/theme.test.js` | Mocks `localStorage.save` as `{ success: true }` | Mock a plain resolved save or error |
| `tests/components/settingsModal.test.js` | Uses `{ success: true }` and `devError.status` | Use plain state and `HttpError.status` |
| `tests/fixtures/github/gitHubClient.js` | `getHttpErrorStatus` reads `devError.status` | Read `HttpError.status` or an equivalent helper |
| `tests/data/storage.test.js`, `tests/utils/cipher.test.js` | Assert `toThrow(TypeError)` | Prefer specific error classes while remaining compatible with native types |

### User-facing strings to preserve

- `Invalid GitHub URL`
- `Unexpected response format from GitHub`
- `GitHub request timed out`
- `Missing repository URL`
- `Repository data or branch name is missing`
- `Failed to render the repository graph`
- `Failed to render the selected branch`
- `Failed to open settings`
- `Unable to save data in local storage.`
- `Invalid local storage parse. Please check your data in the local storage or delete its data.`
- `Unable to encrypt the token for local storage.`
- `Invalid saved token data. Please enter the token again.`
- `Unable to decrypt the saved token. Please enter the token again.`
- `The token has been successfully set`
- `The graph has been successfully generated`
- `Successfully copied`
- The clipboard error message in `src/js/utils/utils.js`
- The rate-limit warning in `src/js/api/gitHubClient/gitHubRateLimiter.js`
- The messages in `HTTP_ERROR_MESSAGES`
- `Failed to fetch repository data`
- `Failed to fetch branch commits`
- `Failed to fetch commit files`
- `Failed to validate GitHub token`
- `Failed to fetch rate limit data`

### Special cases confirmed

| Case | Current behavior | Refactor constraint |
| --- | --- | --- |
| `SettingsModal` token state | Uses `devError.status === 401` | Replace with `HttpError.status` |
| `config.json` failure | Logs and returns defaults | Keep fail-soft |
| `storage.setData` | Applies valid fields before throwing | Preserve partial update |
| Invalid stored token | Prevents the initial graph render | Preserve current behavior |
| Cancellation | `{ cancelled: true }` through API results | Use `AbortError`; UI ignores it |
| Timeout | `{ timedOut: true }` result | Use `TimeoutError`; check it before abort |
| API notifications | Client, rate limiter, and token manager notify | Move error/success/warning decisions to the UI boundary |
| Test discovery | `vitest.config.js` lists files explicitly | Register every new test file |
| Exact result assertions | Many tests use `toStrictEqual` | Update tests in the same phase |

<a id="decisions"></a>

## Decisions

| Decision | Approved direction |
| --- | --- |
| Error transport | Throw typed errors inside domain modules; catch at controller and UI boundaries |
| Error taxonomy | Subclasses of native error types plus network, storage, crypto, and configuration errors |
| Public API contract | Return plain data on success; throw on failure |
| Cancellation | Throw `AbortError`; the UI ignores it |
| Timeout | Throw `TimeoutError` |
| Runtime validation | Shared assertions built on existing matchers, plus JSDoc typedefs |
| Scope | All `src/js` code, delivered in phases |
| Diagnostics | Central logger and `userMessage`; remove `devError` |
| Notifications | Error, success, and warning notifications are decided by the UI boundary, not by data or API modules |

<a id="target-architecture"></a>

## Target Architecture

### Layer boundaries

| Layer | Responsibility | Failure behavior |
| --- | --- | --- |
| `src/js/utils`, `src/js/data`, `src/js/api` | Validation, parsing, storage, network access | Throw typed errors; return plain data on success |
| `src/js/controllers`, `src/js/components` | User interaction, rendering, notifications | Catch errors, log them, map them to user messages, return simple values |
| `src/js/bootstrap.js`, `src/js/index.js` | Application startup and fatal boundary | Log fatal errors, notify when possible, clean up partial initialization |

Rules:

- Domain modules must not call `notifications` for errors.
- Domain modules must not return `{ success: false }` for failures.
- UI methods must not leave an unhandled promise rejection.
- `AbortError` is expected control flow. It is not logged as an error and is not
  shown to the user.
- Expected validation failures are shown with their `userMessage`.
- Unexpected failures are logged with their full `cause` and shown with a safe
  fallback message.
- Empty or unavailable data is not an error when it is a valid application
  state. For example, no saved data in local storage is not a failure.

### Contract example

```js
// Before
const result = await gitHubClient.getData(link, { signal })
if (!result.success) {
  notifications.notify(result.error, 'error')
  return { success: false, error: result.error }
}
useData(result)

// After
try {
  const data = await gitHubClient.getData(link, { signal })
  useData(data)
} catch (error) {
  if (isAbortError(error)) return
  logger.error('GraphController.render', error)
  notifications.notify(getUserMessage(error, 'Failed to render the repository graph'), 'error')
}
```

### Error types

A new module at `src/js/errors/index.js` defines the error classes.

| Class | Inherits from | Use |
| --- | --- | --- |
| `ValidationError` | `TypeError` | Invalid argument type, shape, or required value |
| `RangeValidationError` | `RangeError` | Numeric value outside an allowed range |
| `ParseError` | `SyntaxError` | Invalid URL, JSON, configuration, or GitHub payload |
| `NetworkError` | `Error` | Fetch or network failure |
| `TimeoutError` | `NetworkError` | Request exceeded the configured timeout |
| `HttpError` | `Error` | HTTP response with a non-success status |
| `StorageError` | `Error` | `localStorage` or IndexedDB failure |
| `CryptoError` | `Error` | WebCrypto, encryption, or decryption failure |
| `ConfigError` | `Error` | Configuration loading or validation failure |

`Error` subclasses preserve the existing native semantics:

- `ValidationError` is still `instanceof TypeError`.
- `ParseError` is still `instanceof SyntaxError`.
- `RangeValidationError` is still `instanceof RangeError`.
- Tests can assert either the specific class or the native class, but prefer the
  specific class.

### Error metadata

Every application error should support:

| Field | Purpose |
| --- | --- |
| `name` | Stable class name, for example `ValidationError` |
| `code` | Stable machine-readable code, for example `INVALID_REPOSITORY_URL` |
| `message` | Developer-facing description for logs and tests |
| `userMessage` | Safe message for the interface |
| `context` | Function or module where the error originated |
| `cause` | Original error, when wrapping a lower-level failure |

Class-specific fields:

- `HttpError`: `status`, `url`, `apiMessage`.
- `TimeoutError`: `timeoutMs`.
- `ParseError`: `source` or `method`; avoid storing a full raw payload in
  production logs.
- `StorageError`: `operation`, for example `read`, `write`, or `open`.
- `CryptoError`: `operation`, for example `encrypt` or `decrypt`.

`message` and `userMessage` are separate on purpose:

- `message` may contain technical details and is safe for logs.
- `userMessage` is safe for the interface and preserves current user-facing
  strings where possible.

Do not include tokens, `Authorization` headers, or full private payloads in
either field.

### Logger

A new `src/js/utils/logger.js` provides:

- `logger.error(context, error)`
- `logger.warn(context, message, details)`
- `logger.debug(context, message, details)`
- `logger.setDebug(enabled)`

Requirements:

- Log the full error object, including `name`, `message`, `code`, `context`,
  `cause`, and `stack`.
- Gate verbose diagnostics with `config.debug`.
- Do not import `config` from the logger, to avoid a circular dependency.
  `logger.setDebug(config.debug)` is called after configuration is loaded.
- Redact tokens, authorization headers, and private payloads.
- Keep user-facing notifications separate from logs.

### Runtime validation and JSDoc

A new `src/js/utils/assertions.js` provides guards built on the existing
predicates from `src/js/utils/matchers.js`:

- `assertString`
- `assertNonEmptyString`
- `assertBoolean`
- `assertPlainObject`
- `assertArray`
- `assertFiniteNumber`
- `assertPositiveInteger`
- `assertIntegerInRange`

Each guard:

- Throws `ValidationError` or `RangeValidationError`.
- Accepts a field name and a context.
- Accepts an optional `userMessage`.
- Reuses the existing matchers instead of duplicating conditions.

Use assertions at public boundaries:

- Public API method arguments.
- `storage.setData`.
- Data parsers.
- Configuration normalization.

Add JSDoc types while touching a module:

- `@typedef` for domain data such as `RepositoryData`, `CommitDetails`,
  `CommitFilesData`, and `RateLimitData`.
- `@param` and `@returns` for public methods.
- `@throws` for methods that now throw.

JSDoc is documentation and editor assistance only. It must not be treated as
runtime validation.

<a id="migration-rules"></a>

## Migration Rules

1. Apply one phase at a time. A phase is complete only when its tests and the
   full local suite pass.
2. Do not change unrelated behavior, copy, or component layout.
3. Every removed `{ success: false }` branch must have two replacements:
   a typed `throw` in the domain layer and a boundary `catch` in the UI layer.
4. Do not introduce a silent `catch`. If a failure is intentionally ignored,
   comment why and log at debug or warning level.
5. Update tests in the same phase as the contract change. Do not weaken
   assertions to make a failing test pass.
6. Register every new test file in `vitest.config.js`. Keep the `local` and
   `e2e` split unchanged.
7. Keep cancellation silent. Do not show a notification for `AbortError`.
8. Do not log secrets. Redact token values, authorization headers, and private
   payloads.
9. Preserve current user-facing strings as `userMessage` defaults unless a
   separate copy change is approved.
10. Preserve `storage.setData` partial-update semantics unless a separate
    atomicity change is approved.
11. Do not create commits, tags, releases, or pushes as part of the refactor
    without an explicit request.

<a id="phase-0"></a>

## Phase 0. Record the Baseline and Inventory

### Goal

Capture the current behavior and every failure path before changing contracts.

### Status

Completed on 2026-11-02. The recorded results and inventory are in
[Baseline and Inventory](#baseline).

### Work

1. Re-check the working tree, branch, and staged changes.
2. Record the Node.js and npm versions.
3. Run and record:
   - `npm test`
   - `npm run check:all`
   - `npm run build`
4. Distinguish pre-existing failures from failures introduced later.
5. Build an inventory table for every failure site:

   | Location | Current failure path | Lost cause | Target error | Boundary | Tests |
   | --- | --- | --- | --- | --- | --- |

6. Record the current user-facing strings that should remain stable.
7. Record special cases:
   - `SettingsModal` depends on `devError.status`.
   - `config.json` failures return defaults.
   - `storage.setData` applies valid fields before throwing.
   - An invalid stored token prevents the initial graph render.
   - `cancelled` and `timedOut` flags control UI behavior.
8. Record the exact current test expectations that will change.

### Files

- `documentation/refactors/error-handling/refactor.md` only.

### Exit criteria

- Baseline results are recorded.
- Every `catch`, `{ success: false }`, `devError`, `cancelled`, and `timedOut`
  occurrence has an inventory entry.
- No source file has been changed.

<a id="phase-1"></a>

## Phase 1. Add the Error Foundation

### Goal

Add the error types, logger, guards, and tests without changing existing call
sites.

### Work

1. Add `src/js/errors/index.js`:
   - Error classes from the taxonomy.
   - Shared initialization for `name`, `code`, `userMessage`, `context`, and
     `cause`.
   - `getUserMessage(error, fallback)`.
   - `isAbortError(error)` reusing `src/js/utils/matchers.js`.
   - Optional guards such as `isHttpError(error)` and `isAppError(error)`.
2. Add `src/js/utils/logger.js`:
   - Error, warning, and debug methods.
   - Debug gating through `setDebug`.
   - Redaction helpers for headers and token-like values.
3. Add `src/js/utils/assertions.js`:
   - Guards built on `matchers`.
   - Clear field and context messages.
4. Add focused JSDoc typedefs for error options and shared result shapes.
5. Add tests:
   - `tests/errors/errors.test.js`
   - `tests/utils/assertions.test.js`
   - `tests/utils/logger.test.js`
6. Register the new tests in `vitest.config.js`.

### Test coverage

- `instanceof` relationships, including native classes.
- `cause` preservation.
- `userMessage` fallback behavior.
- `isAbortError`.
- Assertion failures and their error classes.
- Logger debug gating.
- Redaction of token-like values.

### Exit criteria

- No existing call site has changed.
- The full local suite passes.
- New modules are covered by tests.

<a id="phase-2"></a>

## Phase 2. Migrate the Data and Utility Layer

### Goal

Replace generic errors and silent fallbacks in the lowest layers with typed
errors.

### Work

1. `src/js/data/storage.js`
   - Replace `TypeError` with `ValidationError`.
   - Use `RangeValidationError` for out-of-range values if any are introduced.
   - Keep the current partial-update behavior.
2. `src/js/utils/cipher.js`
   - Use `ValidationError` for invalid arguments.
   - Wrap WebCrypto failures in `CryptoError` with the original `cause`.
3. `src/js/data/encryptionKeyStore.js`
   - Use `StorageError` for IndexedDB open, read, write, and delete failures.
   - Preserve `CryptoError` when key generation or cryptographic operations fail.
4. `src/js/api/config.js`
   - Represent fetch and parse failures as `ConfigError` internally.
   - Keep the public fail-soft behavior: log the error and return defaults.
   - Do not let a missing `config.json` stop startup.
5. `src/js/api/gitHubClient/gitHubUrlParser.js`
   - Replace `{ success: false }` with `ValidationError` or `ParseError`.
   - Return the parsed links directly on success.
6. Update existing tests:
   - `tests/data/storage.test.js`
   - `tests/utils/cipher.test.js`
   - `tests/data/encryptionKeyStore.test.js`
   - `tests/api/config/mergeConfigs.test.js`
7. Add `tests/api/gitHubClient/parseGitHubUrl.test.js` and register it.

### Exit criteria

- Data and utility modules throw typed errors.
- Configuration remains fail-soft.
- Existing storage behavior is preserved.
- Tests cover success and failure paths.

<a id="phase-3"></a>

## Phase 3. Migrate the GitHub API Layer

### Goal

Remove the result-object failure channel from the API layer and make
cancellation, timeout, HTTP, network, and parse failures distinct.

### Work

1. `src/js/api/gitHubClient/gitHubHttpApi.js`
   - `createHttpError` throws `HttpError`.
   - Preserve status, URL, and API message.
   - Keep `getHttpErrorMessage` as a pure lookup.
2. `src/js/api/gitHubClient/gitHubTransport.js`
   - `getJson` returns data or the collected pages.
   - Throw `HttpError` for non-success responses.
   - Throw `NetworkError` for fetch failures.
   - Throw `TimeoutError` when `RequestControl` reports a timeout.
   - Check the timeout condition before the abort condition, so a timeout is not
     reported as a user cancellation.
   - Throw `ParseError` for invalid JSON or invalid pagination.
   - Let `AbortError` propagate unchanged.
   - Keep the authorization-header safety check; an invalid URL omits the
     header and logs a warning instead of failing the request.
3. `src/js/api/gitHubClient/gitHubDataParser.js`
   - Return plain parsed data.
   - Throw `ParseError` for invalid payloads.
   - Do not return `{ success, devError }`.
4. `src/js/api/gitHubClient/gitHubRateLimiter.js`
   - Return rate-limit data or throw.
   - Treat malformed rate-limit headers as non-fatal and log at debug level.
   - Do not emit error notifications from the API layer.
   - `checkIsRateLimitHigh` returns the check result; the UI decides whether to
     notify.
5. `src/js/api/gitHubClient/gitHubTokenManager.js`
   - `setToken` returns `void` on success.
   - Throw `HttpError` when GitHub rejects the token.
   - Throw `AbortError` when a newer token operation supersedes the current one.
   - Do not emit success or error notifications; the settings UI owns them.
6. `src/js/api/gitHubClient/gitHubClient.js`
   - Remove `#notifyFailure` and `#createMissingParameterResult`.
   - Throw `ValidationError` for missing or invalid parameters.
   - Return plain data from `getData`, `getDataByBranch`, and `getCommitFiles`.
   - Let `setToken` and `getRateLimitData` propagate typed errors.
   - Preserve the parallel repository, branches, and commits requests.
7. Update API tests:
   - `tests/api/gitHubClient/gitHubHttpApi/*`
   - `tests/api/gitHubClient/gitHubTransport/gitHubTransport.test.js`
   - `tests/api/gitHubClient/gitHubDataParser/*`
   - `tests/api/gitHubClient/gitHubClient/local/*`
   - `tests/api/gitHubClient/gitHubClient/e2e/*`

### Test coverage

- `ValidationError` for missing parameters and invalid URLs.
- `HttpError` for 401, 403, 404, and 500 responses.
- `NetworkError` for fetch rejection.
- `TimeoutError` for timeout.
- `DOMException` or `AbortError` for cancellation.
- `ParseError` for malformed JSON and malformed pagination.
- No notifications from API modules.

### Exit criteria

- The API layer has no failure result objects.
- Cancellation and timeout are distinguishable.
- Local tests pass with mocked responses.
- E2E tests still cover the public contract when run explicitly.

<a id="phase-4"></a>

## Phase 4. Migrate Controllers and the UI Boundary

### Goal

Handle typed errors at the user boundary, remove remaining fallbacks, and keep
the interface behavior stable.

### Work

1. `src/js/controllers/localStorage.js`
   - `get`, `save`, and `load` return data or a boolean instead of failure
     objects.
   - Catch `StorageError`, `ParseError`, and `CryptoError`.
   - Log the full cause and show the existing user messages.
   - Keep best-effort plaintext-token removal.
2. `src/js/controllers/graph.js`
   - `render` and `renderByBranch` return `{ currentBranch }` or `null`.
   - Ignore `AbortError`.
   - Log and notify for other failures.
   - Always remove the loader.
   - Catch file-detail failures in the click handler.
   - Preserve request ID checks and cleanup.
3. `src/js/controllers/link.js`
   - Adapt to the new graph return value.
   - Remove `result.success` checks.
   - Keep history and storage behavior unchanged.
4. `src/js/controllers/refresh.js`
   - Ensure the refresh action cannot produce an unhandled rejection.
5. `src/js/controllers/dropDown.js`
   - Catch errors from the `onSelect` callback.
   - Log them and keep `aria-busy` cleanup in `finally`.
6. `src/js/controllers/settings.js`
   - Handle `setToken` failures as token state:
     - `HttpError` with status 401 is `invalid`.
     - Other failures are `unavailable`.
   - Handle `getRateLimitData` failures by showing the modal with unavailable
     data instead of failing to open it.
   - Log the cause; show notifications only for unexpected failures.
7. `src/js/components/SettingsModal/index.js`
   - Change `getTokenStatusState` to accept the token error and whether a token
     exists.
   - Use `HttpError.status` instead of `devError.status`.
   - Catch save-token and toggle failures.
   - Move success notification for a saved token into this UI boundary.
8. `src/js/components/FullCommitModal/index.js`
   - Consume plain `{ files, truncated }` data.
   - Remove the `success` check.
9. `src/js/controllers/theme.js`
   - A failed save must not prevent the theme from being applied.
   - Log the failure and notify the user.
10. `src/js/utils/utils.js`
    - Log the clipboard failure and keep the existing user notification.
11. `src/js/bootstrap.js` and `src/js/index.js`
    - Catch fatal initialization errors, clean up initialized controllers, log,
      and notify when possible.
    - Preserve the current invalid-stored-token behavior unless separately
      approved.
12. Update tests:
    - `tests/controllers/localStorage.test.js`
    - `tests/controllers/link.test.js`
    - `tests/controllers/theme.test.js`
    - `tests/components/settingsModal.test.js`
    - `tests/utils/notify.test.js`
    - Add `tests/controllers/graph.test.js` and `tests/controllers/settings.test.js`
      if the new boundary behavior needs direct coverage.
    - Use `@vitest-environment jsdom` only for tests that need the DOM.

### Exit criteria

- Every event handler has an error path.
- `AbortError` never produces a notification.
- User-facing messages remain stable.
- No unhandled promise rejections in the tested flows.
- Tests pass.

<a id="phase-5"></a>

## Phase 5. Clean Up, Document, and Accept

### Goal

Remove the old failure channel and finish the migration.

### Work

1. Remove `devError` from all code and tests.
2. Remove remaining `{ success: false }`, `cancelled`, and `timedOut` failure
   flags.
3. Remove dead helpers and comments that describe the old contract.
4. Search for remaining silent catches:
   - `grep` for `catch` blocks with no handling.
   - Check every intentional ignore has a comment and a log level.
5. Update JSDoc and the final state in this document.
6. Update user or developer documentation if behavior, commands, or public
   interfaces changed.
7. Run the complete verification set.
8. Exercise the manual scenarios listed in [Verification](#verification).

### Exit criteria

- No `devError` remains in `src/js`.
- No `{ success: false }` failure channel remains.
- Every catch either rethrows, wraps, or handles at the UI boundary.
- Documentation matches the implemented behavior.
- All required checks pass.

<a id="verification"></a>

## Verification

### Checks after each phase

| Check | Purpose |
| --- | --- |
| Targeted test files | Verify the phase's behavior |
| `npm test` | Run the full offline local suite |
| `npm run test:local` | Must run the same local suite as `npm test` |
| `npm run ES:check` | ESLint check without edits |
| `npx prettier --check <changed files>` | Formatting check without edits |
| `npm run style:check` | Run when SCSS files change |

`npm run check:all` uses `--continue-on-error`; inspect both ESLint and Stylelint
results instead of relying on the exit code alone.

### Checks before acceptance

| Check | Purpose |
| --- | --- |
| `npm test` | Full local suite |
| `npm run ES:check` | Lint |
| `npm run style:check` | Styles |
| `npx prettier --check <changed files>` | Formatting |
| `npm run build` | Production build |
| `npm run preview` | Inspect the built application at `/GitMap/` |
| `npm run test:e2e` | Explicit live GitHub smoke tests only |

E2E tests require network access and must be run explicitly. Report API rate
limits and network failures separately from assertion failures.

### Manual scenarios

- Invalid GitHub URL.
- Repository returning 404.
- Token rejected with 401.
- Rate limit response with 403.
- Server error with 500.
- Network offline or fetch rejection.
- Request timeout.
- Cancellation through a new link or refresh.
- Malformed GitHub JSON.
- Malformed or missing `config.json`.
- Corrupted local storage JSON.
- Local storage quota exceeded.
- IndexedDB unavailable or blocked.
- Encryption and decryption failures.
- Fatal error during bootstrap.

For documentation-only changes, verify referenced local paths and commands
against the repository and run the documentation formatting check. Application
tests and builds are not required unless executable files also change.

<a id="risks"></a>

## Risks

| Risk | Mitigation |
| --- | --- |
| Exact-shape tests expect old results | Update tests in the same phase; do not weaken assertions |
| User-facing messages change unintentionally | Preserve current strings as `userMessage` defaults |
| `AbortError` appears as a failure | Check `isAbortError` before logging or notifying |
| Request ID and abort races | Preserve current request checks; ignore aborted requests |
| Missing `config.json` stops startup | Keep configuration fail-soft and log `ConfigError` |
| Tokens or private payloads leak into logs | Redact headers and token-like values; avoid raw payload logging |
| `storage.setData` partially updates state | Preserve current semantics unless atomicity is approved separately |
| `Promise.all` reports only the first failure | Treat it as a known limitation; consider `AggregateError` later |
| Logger and config create a circular import | Logger does not import config; call `logger.setDebug` from startup |
| `Error.cause` support varies | Use the configured modern build target; attach `cause` manually if needed |
| New tests are not discovered | Register every new file in `vitest.config.js` |

<a id="acceptance-criteria"></a>

## Acceptance Criteria

- Domain modules return plain data and throw typed errors.
- Controllers and UI components catch errors at their boundaries.
- Cancellation is silent and timeout is distinguishable from cancellation.
- `devError` is removed.
- User-facing messages remain stable unless a copy change is approved.
- Invalid input is checked with runtime assertions, not only JSDoc.
- Tests cover error classes, propagation, boundary handling, cancellation, and
  timeout.
- `npm test`, `npm run ES:check`, `npm run style:check`, `npx prettier --check`,
  and `npm run build` pass.
- Manual scenarios behave as expected.
- No commit, tag, release, or push is created without an explicit request.

<a id="assumptions"></a>

## Assumptions

These decisions must remain explicit. Change them only with approval.

1. Current user-facing messages are preserved as `userMessage` defaults.
2. `config.json` failures remain fail-soft: default configuration plus a log.
3. `storage.setData` keeps its current partial-update behavior.
4. An invalid stored token logs and notifies but skips the initial graph render,
   matching current behavior.
5. This plan uses one document:
   `documentation/refactors/error-handling/refactor.md`.
6. No new runtime dependency is added.
7. `Error.cause` is the primary cause mechanism; no custom cause field is
   introduced unless the runtime target requires it.
8. Parallel request failures report the first rejected request. Aggregating all
   failures is a separate improvement.
9. API modules do not notify the user; success, warning, and error notifications
   belong to the UI boundary.
10. `getTokenStatusState` changes its signature to accept a token error.

## References

- [`Error` and `cause` on MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [`DOMException` and `AbortError` on MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMException)
- [Vitest migration plan](../complete/vitest/refactor.md)
