---
name: push-app
description: Prepare GitMap commits, conditionally update the application version, and push authorized commits and release tags to GitHub. Use for requests to commit changes, push the application, or update its version; building or deploying alone does not invoke this workflow.
---

# push-app

## Scope and authorization

- Read `AGENT.md` and follow its approval, Git, and verification rules. Present the intended files, version decision, checks, and Git actions before editing; obtain plan approval if it has not already been given.
- A commit-only request authorizes a local commit, not a push or release tag. A version-only request authorizes version edits, not a commit, tag, or push. A request to push application changes authorizes preparing and pushing the relevant commit and, when the version rule below qualifies, its release tag.
- Do not run `npm run deploy` or publish a GitHub Release as part of this skill. A successful Git push alone does not confirm deployment.
- Work on the current branch. Do not create or switch branches, discard work, rewrite history, or force-push as part of this workflow.

## Workflow

### 1. Inspect and select changes

- Inspect the current branch, `git status --short`, staged and unstaged diffs, and untracked files relevant to the request. Review file contents, not just names. Confirm which existing changes belong to the requested operation; preserve unrelated work and staging.
- Define the exact files or hunks intended for the commit. Do not use all working-tree changes to decide the version or describe the commit.
- If there is nothing to commit, do not create an empty commit or increase the version. If a push was requested, inspect existing outgoing commits instead.
- Before remote synchronization, run `git fetch -p` against the intended remote. Inspect its URL, the branch/upstream, divergence, and every outgoing commit. If the remote or destination is ambiguous, the branch is detached, or unrelated outgoing commits would be included, resolve the scope with the user before pushing. Do not automatically pull or rebase a diverged branch.
- An absent upstream alone is not an error: use an explicit remote and branch when the destination is established. Do not infer an unfamiliar destination or change upstream configuration without authorization.

### 2. Decide and update the version

- Increase the version only when the selected changes include an added, modified, deleted, or renamed file under the repository-root `src/` directory. For renames, check both old and new paths. Mixed documentation and source changes qualify; changes solely outside `src/` do not.
- Without selected `src/` changes, leave version fields unchanged and create no release tag. This includes documentation, skills, tests, dependencies, build configuration, `index.html`, and `public/` changes on their own. An unrelated `src/` edit must not trigger a version bump. Do not run autofix merely to generate qualifying changes.
- Apply this gate even to a version-only request. If no qualifying source changes exist, explain why no bump is made; ask only if the user explicitly requests an exception to this rule.
- Choose `major` for incompatible changes to established behavior or contracts, `minor` for backward-compatible features, and `patch` for fixes, refactors, styles, assets, or other source maintenance without an incompatible contract change. Reset lower components: `2.11.22` becomes `3.0.0`, `2.12.0`, or `2.11.23`. Respect an explicitly requested version when it satisfies the source gate; clarify a conflicting or ambiguous version.
- Keep the same `X.Y.Z` value in `package.json.version`, `package-lock.json.version`, `package-lock.json.packages[""].version`, and `public/config.json.versionDetails.version`. Preserve unrelated JSON fields and dependency versions. Avoid version commands that implicitly commit or tag.
- Inspect existing version edits before changing them. Reuse a consistent bump already prepared for the same source changes; do not bump again on retries. If versions disagree or ownership of an existing bump is unclear, resolve that before modifying or releasing them.
- When only pushing existing commits, do not create another version commit. A release tag is eligible only for an outgoing commit that already contains both the qualifying source changes and their consistent version bump.

### 3. Verify the selected result

- For documentation-only changes, check text consistency, referenced local paths and commands, applicable documentation formatting, and `git diff --check`. Do not run application checks or autofix solely for documentation. Markdown is currently excluded by `.prettierignore`; do not claim it was formatted by the source formatter.
- For code, tests, dependencies, or executable configuration changes, run the project's available required checks: `npm run check:all`, `npm test` (the same local suite as `npm run test:local`), `npm run build`, and applicable formatting/type checks if configured. Do not run duplicate local suites. Run live `npm run test:e2e` only when explicitly requested; follow `AGENT.md` for runtime and preview verification when applicable.
- Prefer check-only commands. `npm run fix:all` is not mandatory: it edits source files and may touch unrelated work. Use fixes restricted to approved files; use the full command only when its entire affected scope is approved. Inspect every resulting diff and rerun affected checks after fixes or version edits.
- Failed required checks block commit and push until resolved or the user explicitly approves a specific exception. Report the failing command, evidence, whether the failure predates this work, and the risk of proceeding. Missing dependencies, network errors, and errors involving `marked` are not automatic exceptions. Do not install dependencies or repair unrelated failures without approval.
- Check the final selected diff for unintended changes, consistent versions, and whitespace errors before staging and committing. Verification commands must not silently expand the commit scope.

### 4. Prepare the commit

- Skip this step for a version-only request or when only pushing existing commits.
- Stage intended paths or hunks explicitly and inspect the complete staged diff. If unrelated staged work would enter the commit, resolve staging scope with the user instead of automatically unstaging it or committing everything. Never use `git add .` without reviewing every included change.
- Write the message in English from the actual staged diff. Use a concise imperative subject, a 60–120-word description of the problem and resulting change, and only applicable file-action bullets. Use repository-relative paths; distinguish a move from a rename and omit categories with no changes. Preserve this format:

    ```text
    Update GitHubClient

    <60–120-word description of the actual change>
    - added: src/js/api/checkRateLimit.js
    - changed: src/js/api/gitHubClient.js
    - deleted: tests/obsolete.test.js
    - moved: tests/helper.js to tests/fixtures/helper.js
    - renamed: tests/old.test.js to tests/new.test.js
    ```

- Commit only when authorized, using the prepared message. Pass multiline messages through a file (for example, `git commit --file <message-file>`) to preserve newlines and avoid shell interpolation. Check the resulting commit and working-tree status.

### 5. Push and tag when authorized

- Skip this step for commit-only and version-only requests. Immediately before pushing, confirm the intended remote, branch, outgoing commits, and verification results.
- For an eligible release commit, use the exact tag `vX.Y.Z` derived from its consistent version fields. Tag that commit explicitly; do not tag an unrelated HEAD or a later documentation-only commit.
- Check local and remote tags before creating one. If the exact tag already points to the intended commit, reuse it. If it points elsewhere, stop and report the conflict; never overwrite, delete, or move it automatically.
- Push only the intended branch and eligible release tag using explicit refs. Do not use `--tags` or force options. Prefer an atomic branch-and-tag push when supported; if unavailable, push the branch first and then its tag, reporting each result.
- If branch push succeeds but tag push fails, report partial success and retry only the failed operation when safe and still authorized. Do not create another commit, bump the version again, or undo the successful push. For rejected or uncertain pushes, inspect remote refs before deciding what remains to do.
- With no eligible release commit, push the authorized branch changes without a new release tag. If all intended refs are already synchronized, report that nothing needed pushing.

### 6. Report the outcome

- State what was completed: version edited, local commit created, branch pushed, and tag pushed, as applicable. Include the commit SHA, branch/remote, and tag when available.
- Explain the version decision, including why it remained unchanged when there were no qualifying `src/` changes.
- Summarize passed, failed, skipped, or blocked checks with reasons; disclose any user-approved exception and partial remote success.
- Inspect and report remaining local changes or unresolved issues. Do not claim a clean working tree or completed deployment without evidence. For edits awaiting user review, present the result for acceptance as required by `AGENT.md`.
