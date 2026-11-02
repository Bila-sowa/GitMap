# Vitest Migration Baseline

Recorded on 2026-10-07 against commit `9846f9c`, before changing the test
runner or test implementations. The working tree was clean before these checks.

## Environment and initial verification

- Node.js: `v26.7.0`.
- npm: `11.19.0`.
- `npm run check-all`: passed with exit code 0; ESLint and Stylelint reported
  no errors.
- `npm run build`: passed with exit code 0; Vite `v8.2.1` transformed 46
  modules and built in 3.38 s. It printed a plugin-timing advisory, not a
  build failure.

The current `package.json` has no `npm test` script or Vitest dependency.
The browser-based legacy runner is `tests/tests.html`; it registers 20 data
tests and one `notify` UI test.

## Legacy test page

The first run opened the original page in headless Chromium through the Vite
dev server at `http://127.0.0.1:4173/GitMap/tests/tests.html` on 2026-10-07 at
17:31 UTC.
The browser console reported `Tests done: 20 passed, 0 failed.` All 20 rows in
its `console.table` had `success: true`. The [test map](./vitest_test_map.md)
lists each registered file and its scenarios.

### Initial results by test set

- Local data tests: 16 passed, 0 failed. This includes the DOM-dependent
  loader and markdown tests; none makes a live GitHub request.
- Live GitHub tests: 4 passed, 0 failed. All six requests to `api.github.com`
  returned HTTP 200.

### Live GitHub requests

- `getRateLimitData`: `/rate_limit` returned HTTP 200.
- `getCommitFiles`: the commit endpoint for SHA
  `46f5cd270ddda0267790caf4fe48ec8895149ec6` returned HTTP 200.
- `getDataByBranch`: `/repos/Bila-sowa/GitMap/commits?sha=main` returned
  HTTP 200.
- `getData`: the repository, branches, and commits endpoints each returned
  HTTP 200.

### UI-enabled follow-up

With `uiTests` enabled, the original page was run again. The console reported
`Tests done: 20 passed, 0 failed.` for data tests and `Ui tests done` for the
UI test. A `role="alert"` element with the text `Test notification` and the
`warning` class appeared in the DOM.

The `notify` test calls `info`, `success`, `warning`, and `error` notifications
without assertions. `Ui tests done` means its function returned; the runner
does not report a pass/fail result or wait for the notification queue to
finish. Individual GitHub response statuses were not captured in this
follow-up; the HTTP 200 results above belong to the first run.
