# Vitest Phase 1.3 Validation

Checked on 2026-10-10 against `72d3859`. No existing test file was migrated in
this subphase.

## Discovery and failure behavior

- Temporarily added `tests/vitest/phase13Probe.test.js` to the `local` project's
  explicit `include` list. Both `npm test` and `npm run test:local` ran exactly
  that file: one test passed, with no `No test suite found` error from legacy
  `.test.js` files. `npm run test:e2e` found no files.
- Changed the probe assertion from `expect(result).toBe(2)` to
  `expect(result).toBe(3)`. `npm test` reported one failed test and exited with
  code 1. Restoring the assertion made the command pass again.
- Removed the probe and restored the empty explicit `include` list. The first
  actual migrated files are scheduled for subphase 2.1; their discovery still
  needs verification when they are added.

## Remaining local tests and final checks

- Ran the 16 registered local legacy data tests in the browser without the four
  live GitHub API tests: 16 passed, 0 failed. The temporary browser harness was
  removed after the run.
- `npm test`, `npm run test:local`, and `npm run test:e2e` exited with code 0
  after cleanup, each reporting zero files in its selected project. These
  commands use `--passWithNoTests`, so this is a configuration check, not a
  passing migrated test suite.
- `npm run build`, `npm run check-all`, and `npm run fix-all` passed. For the two
  style commands, the Git-ignored local `tests/gitHubToken.js` was temporarily
  moved out of ESLint's scan and restored unchanged afterward.
