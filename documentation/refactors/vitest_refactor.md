# Incremental Migration Plan for Vitest

## Quick Navigation

| Section | Contents |
| --- | --- |
| [Starting point](#starting-point) | Inventory and migration scope |
| [Rules](#rules) | Style, isolation, and completion criteria for each batch |
| [Phase 0](#phase-0) | Record baseline behavior |
| [Phase 1](#phase-1) | Add Vitest and separate commands |
| [Phase 2](#phase-2) | Migrate Node-compatible tests |
| [Phase 3](#phase-3) | Migrate DOM/UI tests |
| [Phase 4](#phase-4) | Split GitHub tests into local and e2e variants |
| [Phase 5](#phase-5) | Check coverage and finish the migration |
| [Risks](#risks) | Pitfalls and mitigations |

<a id="starting-point"></a>
## Starting Point

- `AGENT.md` requires minimal changes, preservation of the project structure and existing comments, four-space indentation, and no file deletion without an explicit request.
- At the start of the migration, `tests/tests.html` launched `tests/tests.js`, which shuffled tests and ran them with `Promise.all`. `TestConfig` caught errors and returned `success: false`; this does not make a Vitest test fail.
- The initial inventory contained 21 registered tests: 20 data checks and one `notify` UI test disabled in `tests/config.json`. `tests/api/gitHubClient/createHttpError.test.js` was empty and unregistered.
- Of those tests, 14 appeared suitable for Node, three (`sanitizeMarkdown`, `loader`, `notify`) used the DOM, and four (`getData`, `getDataByBranch`, `getCommitFiles`, `getRateLimitData`) made real GitHub requests.
- At the start of the migration, the project had no Vitest dependency, DOM test environment, `npm test` script, or test CI. The Vite alias `@` and `base: "/GitMap/"` must be accounted for in the test configuration.

<a id="rules"></a>
## Migration Rules

1. Migrate one or two existing files per batch. After each batch, run its Vitest tests, the available local suite, and the style check. Keep the legacy runner for tests that have not yet migrated; run the full legacy suite at checkpoints to avoid consuming the GitHub API rate limit after every small change.
2. Edit existing files in place without renaming or deleting them. Explicitly list only migrated files in the Vitest configuration. After a successful migration, remove each file's registration from the legacy `tests/tests.js` and its corresponding `index.js`, while keeping the remaining tests available in the legacy runner.
3. Do not carry `TestConfig` over as a wrapper around Vitest. Replace each former `success` or `ANY_VALID` check with an explicit assertion. Asynchronous failures must cause a nonzero test exit code.
4. Preserve scenarios, edge cases, and the meaning of useful comments. Update outdated `TestFeedback` descriptions to match the new tests. If a product bug is found, record it separately from the mechanical migration and do not weaken assertions.
5. Use `node` first for pure logic and `jsdom` for DOM tests. Add real Chromium through Vitest Browser Mode only for behavior that DOM emulation cannot reproduce correctly, such as real events, focus, styling, or layout.
6. Store the function result in a separate variable in every test: `const result = functionUnderTest(...)`, followed by `expect(result)...`. For asynchronous calls, use `const result = await ...`. For `toThrow`, the result is a wrapper function: `const result = () => functionUnderTest(); expect(result).toThrow(SyntaxError)`. Pass only the error class to `toThrow`.
7. Instead of `toBeTypeOf`, write, for example, `expect(typeof result).toBe("string")`. Instead of `toBeTruthy`, use `toBe(true)` for a Boolean expression. Prefer precise `toEqual`/`toStrictEqual` assertions for meaningful fields over checking only that a value exists.
8. Isolate state between tests: restore `fetch` and other mocks, timers, `document.body`, storage, and other modified globals. Import `describe`, `it`, `expect`, `vi`, and hooks explicitly from `vitest`.
9. Use only the `.test.js` suffix for all new and migrated test files, never `.spec.js`. The `*.e2e.test.js` pattern is suitable for live API tests.

A small batch is complete when the new assertions cover every scenario from the corresponding legacy tests, the targeted Vitest project and full local suite pass, and the remaining legacy tests stay registered.

<a id="phase-0"></a>
## Phase 0. Record Baseline Behavior

### 0.1. Test map

- Map each file's scenarios, expected results, and DOM or network dependencies.
- Account for the original `notify` test, which only displayed messages and had no assertions. After migration, test the DOM output, message type, queue, and closing behavior.
- Determine the purpose of the empty `createHttpError.test.js`. Add a meaningful method test in a separate small batch, or explicitly exclude the file from Vitest discovery until a scenario is defined.

### 0.2. Initial verification

- Record the Node/npm versions and the results of `npm run check-all` and `npm run build` before making changes.
- Check the legacy test page once and record local and network-dependent results separately in the working report. Do not classify a network outage or GitHub API rate limit as a Vitest regression.

<a id="phase-1"></a>
## Phase 1. Set Up Vitest

### 1.1. Minimal configuration

- Add `vitest` and `jsdom` versions compatible with the current Vite version; preserve the `@` alias. Configure a `local` project with an explicit list of all migrated local files, including tests backed by GitHub fixtures.
- Use `node` by default in `local`, and select `jsdom` for individual DOM test files with the `@vitest-environment` directive. Add a separate `e2e` project for tests that make real requests. Do not automatically include legacy `.test.js` files through a broad glob.
- Make any unmocked network request fail a test in `local`; allow only responses from explicit fixtures. Leave real `fetch` enabled in `e2e`, and verify whether `node` supports every path, including error handling that displays notifications.
- Add Browser Mode with Chromium only after a specific `jsdom` limitation is demonstrated; any such test must remain part of the local run.

### 1.2. Run commands

| Command | Test set | Network |
| --- | --- | --- |
| `npm test` | All local tests, including GitHub fixtures | Blocked |
| `npm run test:local` | The same set, under an explicit local command | Blocked |
| `npm run test:e2e` | Only tests that call the live GitHub API | Allowed |

There are only two test sets: `local` and `e2e`. `npm test` runs `local`, so E2E tests cannot run accidentally. The `node` and `jsdom` environments do not create separate test sets.

### 1.3. First validation pass

- Verify that Vitest discovers only the first migrated files; legacy files without `it()` must not produce a `No test suite found` error.
- Verify that a deliberately failing assertion makes the command fail, then restore the passing test.

<a id="phase-2"></a>
## Phase 2. Node-Compatible Tests

Migrate only the listed files in each subphase and compare the legacy and new scenarios:

| Subphase | Existing files under `tests/` | Focus |
| --- | --- | --- |
| 2.1 | `tools/tests/validateTestData.test.js`, `api/config/mergeConfigs.test.js` | First small local batch |
| 2.2 | `utils/commitGraph.test.js`, `utils/formatter.test.js` | Preserve edge cases and the formatter's time zone |
| 2.3 | `utils/escapeHTML.test.js`, `data/storage.test.js` | If testing the DOM branch of `escapeHTML`, select `jsdom` for that file |
| 2.4 | `api/gitHubClient/getHttpErrorMessage.test.js`, `api/gitHubClient/createHttpError.test.js` | The second file was empty; add a meaningful scenario |
| 2.5 | `controllers/lifecycle.test.js`, `api/gitHubClient/requestControl.test.js` | Events, timers, and state cleanup |
| 2.6 | `api/gitHubClient/gitHubTransport.test.js`, `api/gitHubClient/setToken.test.js` | Mocked `fetch`, headers, and concurrent requests |
| 2.7 | `api/gitHubClient/dataParserValidation.test.js` | Precise checks of errors and their types |
| 2.8 | `api/gitHubClient/parseRepoData.test.js`, `api/gitHubClient/parseCommitFilesData.test.js` | Extract and reduce large input responses |

For 2.8, create small named fixtures under `tests/fixtures/github/`: include only fields read by `GitHubDataParser`, with separate builders for edge cases. Do not store full JSON responses, long `patch` values, commit signatures, or personal data. Keep the expected normalized result next to its assertion so the test remains readable. Build the `truncated` boundary case programmatically instead of writing 300 lines of fixture data.

<a id="phase-3"></a>
## Phase 3. DOM and UI Tests

### 3.1. `sanitizeMarkdown`

- Migrate `utils/sanitizeMarkdown.test.js` to the local set with `jsdom`; check that unsafe `href` values, event handlers, and images are removed while safe markup is preserved.

### 3.2. `loader`

- Migrate `components/loader.test.js`; use controlled timers to check replacement, manual removal, and automatic cleanup without real delays.

### 3.3. `notify`

- Migrate the disabled `utils/notify.test.js` into a behavioral test that checks rendering, queueing, the close button, and DOM cleanup. Then include it in the local run.
- If a check requires real browser behavior, move only that scenario to Chromium and document why.

<a id="phase-4"></a>
## Phase 4. Local and E2E GitHub API Tests

### 4.1. Separation rule

For each of the four methods, migrate the current test to `local` with a mocked GitHub API response and add a separate `*.e2e.test.js` file to `e2e` that makes a real request. One pair of files forms one subphase. The local `fetch` mock must accept only explicitly listed URLs and throw on any unexpected request; restore it after each test. `GitHubTransport` already accepts an injected `fetch`, but `GitHubClient` does not currently pass one through its constructor: start with an isolated `fetch` mock, and if that proves brittle, add minimal optional constructor injection.

| Subphase | Method | Verify locally | Verify against the live API |
| --- | --- | --- | --- |
| 4.2 | `getRateLimitData` | Parsing of `resources.core` and edge cases | Success and numeric invariants without asserting the exact `remaining` value |
| 4.3 | `getCommitFiles` | A shortened `files` array, statuses, and `truncated` | Response for a pinned SHA |
| 4.4 | `getDataByBranch` | Branch URL and normalized commits | An existing public branch and a nonempty result |
| 4.5 | `getData` | Repository, branches, and commits, including pagination | A public repository and the result structure |

### 4.6. Fixtures and live requests

- Keep only the minimum contract fields in fixtures: `default_branch`, `name`, `sha`, `commit.message`, `commit.author` with a valid date, the required `files` fields, and `resources.core`. Add short URLs, `parents`, and an optional author only when needed. Keep the data stable and free of personal information.
- In local tests, assert the exact normalized result, errors, and edge cases. Keep live tests as short smoke tests: do not compare changing branch SHAs, commit counts, `remaining`, or the full REST JSON.
- Do not use `tests/gitHubToken.js`: this file is local, Git ignored, and was not part of the original test run. If authenticated E2E testing is needed, read the token only from an environment variable; do not log it or put it in fixtures. The default E2E run must work with the public API without a token.
- Run E2E tests explicitly; on a network failure or GitHub rate limit, report a clear reason instead of treating the failure as success.

<a id="phase-5"></a>
## Phase 5. Completion and Acceptance Criteria

### 5.1. Scenario review

- For all 21 tests registered at the start of the migration, map old scenarios to new assertions; also decide how to handle the empty `createHttpError.test.js`.
- Confirm that `npm test` and `npm run test:local` run the same offline local suite, and that `npm run test:e2e` is excluded from the default run.
- Run `npm run check-all` and `npm run build`. Add brief run instructions to the README.

### 5.2. CI and the legacy runner

- Add CI for local tests after the suite stabilizes. Keep live E2E runs manual so the external API and its rate limits do not block routine changes.
- Stop using the old HTML page as the source of test results after migration is complete. Keep the legacy runner files until a separate explicit decision to remove them, as required by `AGENT.md`.

<a id="risks"></a>
## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Vitest automatically discovers legacy `.test.js` files that do not contain `it()` | List migrated files explicitly in each project; expand the list only after a successful migration |
| The legacy `TestConfig` returns `success: false` instead of throwing | Replace it with direct `expect` assertions; do not treat `await legacyTest()` alone as a sufficient test |
| Tests depend on shared globals, time, or execution order | Isolate state, restore mocks and timers, and avoid dependencies on test order |
| `jsdom` does not reproduce every browser feature | Use Browser Mode and Chromium for the specific incompatible scenario |
| The GitHub API returns large or changing data | Use short, sanitized fixtures for local tests and invariants for E2E tests |
| Live tests may be affected by network access and rate limits | Run them separately and explicitly; exclude E2E from `npm test` and standard CI |
| A token could accidentally end up in the repository or logs | Do not import the local token file; read optional credentials only from an environment variable |

References: [Vitest Test Projects](https://vitest.dev/guide/projects), [`node`/`jsdom` environments](https://vitest.dev/guide/environment.html), [Browser Mode](https://vitest.dev/guide/browser/), [`include` rule](https://vitest.dev/config/include).
