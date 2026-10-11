# Project Instructions

## Project Map
- `index.html`: application HTML entry point.
- `src/js/`: application logic, including API access, components, controllers, data storage, and utilities.
- `src/styles.scss`, `src/scss/`, and component `styles.module.scss` files: application styles.
- `src/assets/` and `src/fonts/`: source assets processed by the build; `public/`: files served without processing, including runtime configuration.
- `tests/` and `tests/vitest/`: test scenarios and shared Vitest setup; `vitest.config.js`: test projects and discovery.
- `vite.config.js`, `package.json`, and formatter and linter configuration: build setup, commands, dependencies, and code conventions.
- `README.md` and `documentation/`: usage documentation and engineering records. `dist/` is generated build output.
- Confirm the relevant paths before editing and update this map when an approved change makes it inaccurate.

## Scope and Approval
- If the user specifies a clear goal, keep changes within that goal. If no clear goal is specified, related improvements are allowed, subject to plan approval and the approval requirements below. Clarify missing information needed to choose a useful scope.
- Obtain explicit approval before changing architecture, interfaces (including user interfaces and APIs), data structures, adding dependencies, or renaming existing symbols or files. Identify these decisions in the proposed plan; approval of a plan explicitly describing them is sufficient.
- Prioritize maintainability first, performance second, and minimal changes and simplicity next. Explain material tradeoffs when proposing a solution.
- Preserve the existing project structure unless the user approves a structural or architectural change.
- Avoid duplicated logic and hardcoded configurable values. Reuse existing helpers, components, constants, and configuration. Keep legitimate fixed domain constants explicit; do not create unnecessary abstractions for incidental similarities.
- Before improving or replacing an established implementation approach, explain its concrete drawback, the proposed alternative, and the affected scope. Obtain approval before applying the deviation, including when it is needed to avoid duplication or complete the task.
- Approval already given for a specific decision in the current conversation remains valid within its approved scope; do not request it again.

## Interface Consistency
- Build new interface elements using the design of existing elements: components, typography, colors, spacing, states, and interaction patterns.
- When no exact equivalent exists, derive the new element from the closest established patterns and include the proposed interface change in the plan for approval.

## Code Style Consistency
- Before editing code, inspect the target file, related files, and existing formatter, linter, and editor configuration to identify the established code style.
- Explicit project formatter and linter configuration takes precedence over conflicting conventions in existing code and the general style defaults in this document. Apply it to the fragments changed for the task. Where configuration does not specify a convention, use the predominant style in comparable project files.
- If a file mixes styles, bring only the fragments changed for the task into alignment with the main project style. Leave unrelated code unchanged.
- Keep indentation, quotes, semicolons, line wrapping, blank lines, naming conventions, import ordering, and code organization consistent with that priority: explicit configuration first, established project conventions second.
- When adding a file, follow explicit formatter and linter configuration, using comparable existing files for conventions not covered by configuration.
- Match established implementation patterns as well as formatting. Before adding or changing behavior, inspect comparable implementations in the project.
- Follow project conventions for function structure: responsibilities, parameter and return shapes, decomposition into helpers, and synchronous or asynchronous control flow.
- Handle errors using the established project approach, including propagation, validation, logging, and user-facing messages where applicable. Do not silently suppress errors or introduce a competing error-handling pattern.
- Add comments when they explain important intent, constraints, or non-obvious logic. Avoid comments that merely restate the code.
- Use consistent naming and domain terminology for new variables, functions, methods, and files. Renaming existing symbols or files follows Scope and Approval.
- If neither configuration nor comparable project files establishes a main style, ask which convention to use before making style changes.

## HTML
- Use semantic HTML and native interactive elements appropriate to their purpose.
- Preserve keyboard access, accessible names, focus behavior, and form labels. Use ARIA when native HTML does not adequately express the required semantics.

## CSS
- Use the project's existing styling stack, file organization, and responsive approach. Introducing a framework or changing that approach requires approval.
- Reuse existing design tokens, variables, utilities, and component styles before adding equivalents. Avoid duplicating configurable colors, spacing, or breakpoints.
- Keep selectors simple and scope them according to existing conventions. Avoid specificity escalation that makes styles harder to maintain.
- Use Flexbox or Grid where appropriate within the established layout patterns, and group related styles consistently with surrounding code.

## JavaScript
- Use syntax and APIs supported by the project's configured runtime and build targets.
- Prefer const for bindings that are not reassigned and let when reassignment is required; do not introduce var.
- Keep state scoped to the relevant module or component. Avoid introducing global mutable state.
- Register event handlers through the established project mechanism rather than inline HTML attributes. Use event delegation where it fits the existing interaction model.

## Git
- Before starting work, inspect the working-tree status, staged changes, current branch, and relevant diffs. Start from a clean working tree whenever possible. If changes already exist, obtain agreement on how to proceed; never discard, stage, commit, or stash them automatically to make the tree clean. Explicit approval to continue editing the current files permits work on those files while preserving unrelated changes.
- Before synchronizing with the remote, run `git fetch -p` to update remote-tracking references and prune stale ones. Use the intended remote explicitly when multiple remotes exist. Pruning stale remote-tracking references does not mean deleting remotes, local branches, or release tags.
- Obtain explicit approval before operations that can discard work or rewrite history, including `git reset --hard`, `git clean`, forced checkout or switching, rebasing published commits, force pushes, and deleting branches or tags. Explain the affected state and expected consequences before asking; prefer a reversible alternative when available.
- Follow established repository conventions for commit messages, branch names, and tags. Use concise English imperative commit subjects consistent with recent history. Use descriptive branch names following the applicable project or environment prefix, and preserve the existing `vX.Y.Z` release-tag format. Do not introduce a new naming scheme without approval.
- Create commits, push changes, and create release tags only when the user explicitly requests or approves those actions. Plan approval for editing files alone does not authorize them.
- Keep commits focused on the approved task. Inspect the staged diff before committing and stage intended paths or hunks explicitly. Do not use `git add .` without first checking every included change; preserve unrelated staged and unstaged work.
- Before pushing, verify the intended remote, branch, upstream, outgoing commits, and verification results. Do not push unrelated commits; follow Verification when checks are failed or blocked.
- Resolve conflicts by understanding and preserving the intent of both changes. Do not blindly select one side; ask for a decision when the intended behavior is ambiguous.
- After authorized Git operations, inspect the resulting status and report the outcome, including any remaining changes or unresolved conflicts. Do not claim the working tree is clean without checking it.

## Vite
- Use the existing Vite configuration and project scripts: `npm run dev` for development, `npm run build` for production builds, and `npm run preview` to inspect the built application locally. Preview is for verification, not production hosting.
- Preserve the `@` alias pointing to `src` and the configured `base: "/GitMap/"`. Follow existing import conventions. Obtain approval before changing Vite configuration behavior, including aliases, the deployment base, plugins, or build options. Formatting or comment-only changes require the normal editing-plan approval, but no separate approval for a configuration change.
- Import source assets through the existing module or CSS conventions so Vite can process their URLs. Use `public` for assets that must retain their names or be served without processing; do not import public assets as source modules.
- Account for the configured deployment base when constructing runtime asset URLs. Use `import.meta.env.BASE_URL` for base-relative paths instead of hardcoding `/GitMap/` or assuming the application is hosted at the domain root.
- Read client-side environment values through `import.meta.env`. Use the built-in `DEV`, `PROD`, and `MODE` values for their intended purposes; explicitly parse and validate custom values because they are strings.
- Treat `VITE_*` values as public, build-time configuration. Never place tokens, passwords, or other secrets in client-exposed environment variables or bundle them through Vite configuration. Keep local environment files containing sensitive values out of version control.
- Prefer existing Vite capabilities and configuration over adding plugins or a parallel build pipeline. Any approved plugins and dependencies must be compatible with the project's installed Vite version and runtime targets.
- Edit source files rather than generated files in `dist`.
- For approved changes affecting bundling, imports, asset URLs, or configuration behavior, verify the production build and inspect it through preview at the configured base path. Check affected resources and behavior for missing files or differences from development; a working development server alone is insufficient.

## Vitest
- Write tests that verify observable behavior, meaningful outcomes, and edge cases. Keep each test focused on a clear scenario.
- Declare tests with `test`, never `it`. Import `describe`, `test`, `expect`, `vi`, and required hooks explicitly from `vitest`. Use `test` variants where needed; do not commit focused tests such as `test.only`.
- Keep exactly two test sets: `local` and `e2e`. `npm test` and `npm run test:local` must run the same offline local suite; live API tests run only through the explicit `npm run test:e2e` command and remain outside the default run and routine CI.
- Block unmocked network requests in local tests. Use explicit fixtures and mocks that reject unexpected requests.
- Use `node` for pure logic and `jsdom` for DOM tests. Use Chromium through Vitest Browser Mode only for a demonstrated limitation of DOM emulation, and keep those tests in the local set.
- Store the function result in a separate variable before asserting: `const result = functionUnderTest(...)` or `const result = await functionUnderTest(...)`. For throwing behavior, use a wrapper: `const result = () => functionUnderTest(); expect(result).toThrow(SyntaxError)`. Pass only the error class to `toThrow`.
- Use `expect(typeof result).toBe("string")` instead of `toBeTypeOf`, and `toBe(true)` for Boolean expressions instead of `toBeTruthy`. Prefer precise `toEqual` or `toStrictEqual` assertions for meaningful results, errors, and edge cases over existence-only checks.
- Use direct assertions that fail when the expected behavior is not met. Await asynchronous behavior and ensure assertion failures and asynchronous failures produce a nonzero test exit code. Do not weaken assertions to hide product bugs.
- Keep tests independent of execution order. Restore mocks, timers, `document.body`, storage, and other modified globals between tests; use controlled timers instead of real delays.
- Name test files with the `.test.js` suffix, never `.spec.js`; use `*.e2e.test.js` for live API tests.
- Keep fixtures small, stable, and free of personal data, including only required contract fields. Keep expected normalized results close to assertions and generate large boundary inputs programmatically.
- Keep live API tests as short smoke tests using stable invariants rather than changing SHAs, counts, rate-limit values, or full responses. Do not import `tests/gitHubToken.js`; read optional credentials only from environment variables, never log them or store them in fixtures, and support public API tests without a token.
- Identify network failures and API rate limits explicitly in verification results so they are distinguishable from assertion failures.

## Performance
- Avoid unnecessary DOM updates, repeated expensive computations, and redundant network requests in changed code.
- Use appropriate image formats and dimensions within the existing asset pipeline.
- For changes intended to improve performance, compare relevant behavior or measurements before and after the change. Do not claim an improvement without evidence or sacrifice maintainability for speculative optimization.

## Verification
- Before presenting the plan, identify the verification checks required by the rules below, using project scripts, documentation, and CI configuration. Include them in the plan.
- For changes to code, tests, dependencies, or executable configuration, run all available project verification checks, regardless of the size of the change. These include configured formatting checks, linting, type checks, test suites, and build checks where available.
- For documentation-only changes, check changed text for consistency, verify referenced local paths and updated commands against the repository, and run applicable documentation formatting and whitespace checks. Tests, application linting, and builds are not required unless the documentation change accompanies executable changes or the user requests them.
- Use check-only modes where available. Any check that automatically edits files must stay within the approved editing scope.
- Plan approval does not authorize deployment, publication, destructive operations, or changes to external data. If a verification check requires such actions, obtain explicit approval for those actions before running it.
- Inspect the results of every check. Fix failures demonstrably caused by the approved changes within the approved scope, then rerun affected checks. These fixes do not require another approval unless they change the approved scope or an established implementation approach.
- Manually verify interface changes and significant changes in the relevant runtime. For interface changes, use the browser to inspect appearance, interactions, and responsive behavior; for other significant changes, exercise the affected behavior directly.
- If a required check reveals a pre-existing error, cannot run, or needs a missing dependency, report the evidence and available options, then stop task execution until the user decides how to proceed. Also pause when a failure's relationship to the current changes cannot be established. Do not install missing dependencies or repair pre-existing errors without approval. Checks not required for the current task do not block it merely because they previously failed.
- Report which checks passed, failed, or could not run, including concrete reasons for blocked checks. Distinguish pre-existing failures from failures introduced by the changes when evidence permits; do not claim verification succeeded if checks remain failed or unrun.

## Editing Rules
- Prefer focused edits over full-file rewrites when a local change is sufficient.
- Preserve unrelated comments. Update comments affected by an approved behavior change so they remain accurate.
- Do not delete files unless explicitly requested.
- Show code excerpts only when useful for review or requested by the user; keep excerpts focused on relevant changes.

## Debugging
- Reproduce the reported problem or gather concrete evidence before proposing a fix. Distinguish confirmed causes from hypotheses.
- Explain the root cause, the proposed correction, and how it will be verified in the plan.
- Apply the smallest maintainable correction that addresses the cause, then verify the original failing scenario and relevant regression coverage in addition to the required project checks.
- If the cause cannot be established or investigation is blocked, report the evidence and missing information instead of presenting a speculative fix as confirmed.

## Documentation
- When approved changes affect behavior, setup, configuration, commands, or public interfaces, include the relevant documentation updates in the plan and implement them alongside the change.
- Keep command examples, paths, and descriptions consistent with the actual project. Do not document a proposed or unverified behavior as already implemented.
- Preserve historical context in engineering records: distinguish the original baseline from the current state rather than silently rewriting past observations.
- Keep durable conventions in these instructions and detailed procedures in the relevant documentation. Avoid copying the same rule into multiple sections; where duplication is necessary, keep all affected sources synchronized.

## Communication
- Before editing files, state the intended result and provide a short, concrete plan covering the main steps, the files expected to change, and the method of verification. For a small change, one or two sentences are enough; for a multi-step task, use a compact list. Avoid a detailed breakdown of every edit unless the user requests it.
- Always obtain the user's explicit approval of the plan before editing files, including for small changes. A request to perform a task alone does not count as approval of a plan that has not yet been presented.
- While awaiting plan approval, inspect files and perform read-only investigation as needed, but do not edit files. Once the plan is approved, carry out the approved work without requesting approval for every individual edit.
- Make the work visible through concise progress updates at meaningful milestones. Explain findings, decisions, obstacles, and the next step; do not leave the user without an update for more than roughly one minute during active work.
- Use a medium level of detail in updates: show plan-step status, brief reasons for important decisions, and verification results. Do not include routine lists of changed files in progress updates or final reports; the proposed plan should still identify the files expected to change.
- If findings materially change the approved plan or scope, present the revised plan and obtain approval before making edits that depend on that change.
- Ask focused clarification questions early only when information is missing. Give clear options and explain relevant tradeoffs where useful. Approval requests required by these instructions remain mandatory even when the requirements are clear.
- State material assumptions explicitly. Do not silently choose an interpretation when the answer is necessary to implement the requested behavior correctly.
- Continue independent, authorized work while waiting for clarification. Wait for an answer before making changes that depend on the unresolved decision or require approval under these instructions.
- Do not ask the user to decide routine implementation details that established project conventions already resolve.
- After implementation and verification, report the overall status and present the result for user review. Summarize verification and unresolved issues briefly; do not report the task as complete until the user has reviewed and accepted the result.
- After user acceptance, provide a concise final report stating the overall status.

## Language
- Communicate with the user in the language of their request.
- Write all project content, including code comments, documentation, these instructions, and commit messages, exclusively in English.
