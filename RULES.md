# Project Rules

## Scope and maintainability

- Keep changes focused on their stated goal and preserve unrelated work.
- Prioritize maintainability, then performance, then minimal changes and simplicity. Explain material tradeoffs when proposing a solution.
- Preserve the existing project structure and implementation patterns. Discuss architectural, interface, data structure, dependency, and naming changes with maintainers before introducing them.
- Before replacing an established approach, identify its concrete drawback, the proposed alternative, and the affected scope.
- Reuse existing helpers, components, constants, and configuration. Avoid duplicated logic and hardcoded configurable values.
- Keep fixed domain constants explicit. Do not introduce abstractions for incidental similarities.
- Prefer focused edits over full-file rewrites. Preserve unrelated comments and update comments whose meaning changes.

## Interface and accessibility

- Use existing components, typography, colors, spacing, states, and interaction patterns for new interface elements.
- When no exact equivalent exists, derive the design from the closest established patterns.
- Use semantic HTML and native interactive elements appropriate to their purpose.
- Preserve keyboard access, accessible names, focus behavior, and form labels. Use ARIA when native HTML does not express the required semantics.

## Code style and implementation

- Inspect the target file, related implementations, and formatter, linter, and editor configuration before changing code.
- Follow explicit project configuration first, then predominant conventions in comparable files. Apply this priority to indentation, quotes, semicolons, wrapping, blank lines, naming, import order, and code organization.
- In files with mixed styles, align only the changed fragments with the applicable conventions. Avoid unrelated formatting changes.
- Follow established patterns for function responsibilities, parameters, return values, helper decomposition, and synchronous or asynchronous control flow.
- Handle errors consistently with the project, including propagation, validation, logging, and user-facing messages. Do not silently suppress errors or introduce a competing error-handling pattern.
- Write comments that explain intent, constraints, or non-obvious logic rather than restating the code.
- Use consistent naming and domain terminology. Resolve unclear conventions with maintainers before introducing a new style.

## CSS

- Use the existing styling stack, file organization, and responsive approach.
- Reuse design tokens, variables, utilities, and component styles. Avoid duplicating configurable colors, spacing, or breakpoints.
- Keep selectors simple and scoped according to project conventions. Avoid specificity escalation that makes styles harder to maintain.
- Use Flexbox or Grid within established layout patterns and group related styles consistently with surrounding code.

## JavaScript

- Use syntax and APIs supported by the configured runtime and build targets.
- Use `const` for bindings that are not reassigned and `let` when reassignment is required. Do not introduce `var`.
- Keep state within the relevant module or component. Avoid global mutable state.
- Register event handlers through the established project mechanism rather than inline HTML attributes. Use event delegation where it fits the existing interaction model.

## Git

- Inspect the current branch, working-tree status, staged changes, and relevant diffs before starting work. Start from a clean working tree when possible and preserve existing changes.
- Run `git fetch -p` before synchronizing with a remote. Specify the intended remote when multiple remotes exist; pruning stale remote-tracking references does not delete local branches or release tags.
- Coordinate operations that can discard shared work or rewrite published history, including hard resets, cleaning untracked files, forced checkout, published rebases, force pushes, and branch or tag deletion. Understand the affected state and prefer reversible alternatives.
- Follow repository conventions for commit messages, branch names, and tags. Use concise English imperative commit subjects, descriptive branch names, and the existing `vX.Y.Z` release-tag format.
- Keep commits focused. Stage intended paths or hunks explicitly and inspect the complete staged diff before committing. Review every included change before using `git add .`.
- Before pushing, verify the remote, branch, upstream, outgoing commits, and verification results. Do not include unrelated commits.
- Resolve conflicts by preserving the intent of both changes. Clarify ambiguous behavior rather than blindly selecting one side.
- Inspect the resulting status after Git operations and identify any remaining changes or unresolved conflicts. Verify the working tree before describing it as clean.

## Vite and client configuration

- Use the existing configuration and project scripts: `npm run dev` for development, `npm run build` for production builds, and `npm run preview` for local inspection of the build. Preview is not production hosting.
- Preserve the `@` alias pointing to `src` and the configured `base: "/GitMap/"`. Follow existing import conventions and discuss changes to aliases, the deployment base, plugins, or build options with maintainers.
- Import source assets through existing module or CSS conventions so Vite can process their URLs. Use `public/` for assets that must retain their names or be served without processing; do not import public assets as source modules.
- Use `import.meta.env.BASE_URL` for base-relative runtime asset URLs instead of hardcoding `/GitMap/` or assuming hosting at the domain root.
- Read client-side environment values through `import.meta.env`. Use `DEV`, `PROD`, and `MODE` for their intended purposes and explicitly parse and validate custom values, which are strings.
- Treat `VITE_*` values as public build-time configuration. Keep tokens, passwords, and other secrets out of client-exposed environment variables and Vite bundles. Keep local files containing secrets out of version control.
- Prefer existing Vite capabilities over new plugins or a parallel build pipeline. Dependencies and plugins must be compatible with the installed Vite version and runtime targets.
- Edit source files rather than generated files in `dist/`.
- For changes affecting bundling, imports, asset URLs, or configuration behavior, verify the production build through preview at the configured base path. Check resources and behavior for missing files or differences from development.

## Vitest

- Test observable behavior, meaningful outcomes, and edge cases. Keep each test focused on a clear scenario.
- Declare tests with `test`, never `it`. Import `describe`, `test`, `expect`, `vi`, and required hooks explicitly from `vitest`. Do not commit focused tests such as `test.only`.
- Keep exactly two test sets: `local` and `e2e`. `npm test` and `npm run test:local` must run the same offline suite. Live API tests run only through the explicit `npm run test:e2e` command and remain outside the default run and routine CI.
- Block unmocked network requests in local tests. Use explicit fixtures and mocks that reject unexpected requests.
- Use `node` for pure logic and `jsdom` for DOM tests. Use Chromium through Vitest Browser Mode only for a demonstrated limitation of DOM emulation, keeping those tests in the local set.
- Store function results separately before asserting: `const result = functionUnderTest(...)` or `const result = await functionUnderTest(...)`.
- For throwing behavior, use a wrapper: `const result = () => functionUnderTest(); expect(result).toThrow(SyntaxError)`. Pass only the error class to `toThrow`.
- Use `expect(typeof result).toBe("string")` instead of `toBeTypeOf`, and `toBe(true)` for Boolean expressions instead of `toBeTruthy`. Prefer precise `toEqual` or `toStrictEqual` assertions over existence-only checks.
- Await asynchronous behavior and ensure assertion failures and asynchronous failures produce a nonzero test exit code. Do not weaken assertions to hide product bugs.
- Keep tests independent of execution order. Restore mocks, timers, `document.body`, storage, and other modified globals between tests. Use controlled timers instead of real delays.
- Name test files with the `.test.js` suffix, never `.spec.js`. Use `*.e2e.test.js` for live API tests.
- Keep fixtures small, stable, and free of personal data, with only required contract fields. Keep expected normalized results close to assertions and generate large boundary inputs programmatically.
- Keep live API smoke tests short and use stable invariants instead of changing SHAs, counts, rate-limit values, or full responses.
- Do not import `tests/gitHubToken.js`. Read optional credentials only from environment variables; never log them or store them in fixtures. Support public API tests without a token.
- Distinguish network failures and API rate limits from assertion failures in verification results.

## Performance

- Avoid unnecessary DOM updates, repeated expensive computations, and redundant network requests.
- Use appropriate image formats and dimensions within the existing asset pipeline.
- Measure relevant behavior before and after performance changes. Do not claim improvements without evidence or sacrifice maintainability for speculative optimization.

## Verification

- For changes to code, tests, dependencies, or executable configuration, run all available project checks: formatting, linting, type checks, test suites, and builds where configured. Keep live API tests subject to the explicit-run rule above.
- For documentation-only changes, check text consistency, referenced local paths and commands, and applicable documentation formatting and whitespace checks. Application tests, linting, and builds are unnecessary unless executable changes accompany the documentation change.
- Prefer check-only modes. Review any automatic fixes and keep them within the intended change scope.
- Inspect every check result. Fix failures caused by the changes and rerun affected checks.
- Manually verify interface appearance, interactions, and responsive behavior in a browser. Exercise other significant behavior changes directly in the relevant runtime.
- Investigate pre-existing failures, unavailable checks, missing dependencies, and failures of unclear origin before proceeding. Distinguish them from failures introduced by the change; do not silently expand the work to repair unrelated problems.
- Record passed, failed, and blocked checks with concrete reasons. Do not describe verification as successful when required checks remain failed or unrun.

## Debugging

- Reproduce the problem or gather concrete evidence before proposing a fix. Distinguish confirmed causes from hypotheses.
- Explain the root cause, correction, and verification approach.
- Apply the smallest maintainable correction that addresses the cause. Verify the original failing scenario and relevant regression coverage alongside required project checks.
- When the cause cannot be established, document the evidence and missing information rather than presenting a speculative fix as confirmed.

## Documentation and language

- Update relevant documentation alongside changes to behavior, setup, configuration, commands, or public interfaces.
- Keep command examples, paths, and descriptions consistent with the actual project. Do not document proposed or unverified behavior as already implemented.
- Preserve historical context in engineering records: distinguish the original baseline from the current state rather than rewriting past observations.
- Keep durable conventions in project rules and detailed procedures in the relevant documentation. Avoid duplicated rules; keep intentionally duplicated guidance synchronized.
- Write all project content, including code comments, documentation, and commit messages, in English.
