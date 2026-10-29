---
name: check-code
description: Manually inspect changed code for architectural, semantic, and project-specific rule violations that automated linters and formatters miss, and apply focused fixes. Use when asked to review, check, verify, or fix changed code or ensure strict compliance with AGENT.md.
---

# check-code

## Purpose and Philosophy

Automated tools (`ESLint`, `Stylelint`, `Prettier`) catch surface-level syntax, code formatting, and standard lint warnings. They do not understand business logic, architectural constraints, test conventions, or project-specific principles codified in `AGENT.md`.

`check-code` performs a deep, human-like manual code review of modified code and applies targeted, hands-on refactoring. The agent actively inspects changed code and its surrounding context against project rules, detects semantic and structural deficiencies, and fixes them directly.

---

## Scope and Authorization

- Comply with all instructions in `AGENT.md`.
- Inspect the working tree (`git status --short`, `git diff`, and `git diff --staged`) to identify changed files and hunks.
- Keep fixes focused on changed code and directly affected functions or modules. Do not rewrite unrelated existing code in the file unless agreed with the user.
- If fixing a flaw requires an architectural change, modifying public interfaces, or fixing pre-existing defects outside the current task's scope, present the findings and obtain user approval before proceeding.
- When the user explicitly requests routine checking and fixing, apply verified non-architectural improvements (such as Vitest convention adjustments, error handling fixes, dead-comment removal) and report the exact diff and rationale in the final summary.

---

## Workflow

### 1. Identify Changed Scope and Context

1. Run `git status --short` and `git diff` / `git diff --staged` to identify all added, modified, or staged files.
2. For each changed file:
   - Inspect the modified lines and hunks.
   - Read the surrounding file context (enclosing function, class, or component) to understand the component structure, state management, and intent.
3. Run automated formatting/linters first (`npm run check:all`) to eliminate superficial formatting noise so manual review focuses entirely on logic, architecture, and standards.

### 2. Deep Manual Review Checklist

Manually evaluate changed code against the following criteria which automated linters cannot verify:

#### A. Error Handling and Resilience
- **No silent suppression**: Ensure there are no empty `catch` blocks or swallowed promises that silently hide errors.
- **Consistent propagation**: Ensure errors are handled or propagated using the established project pattern (e.g. domain errors, user notifications, console logging where appropriate).
- **Edge cases and inputs**: Verify parameters and edge cases are validated (empty strings, null/undefined, out-of-range values).

#### B. DRY, Config, and Magic Values
- **Base URL handling**: Ensure runtime asset URLs and deployment links use `import.meta.env.BASE_URL` rather than hardcoding `/GitMap/` or root `/`.
- **Reusability**: Check if new logic duplicates existing helpers in `src/js/utils/`, data storage in `src/js/data/`, or SCSS variables/tokens. Reuse established helpers instead of introducing redundant code.
- **Magic constants**: Avoid hardcoded numbers or strings without clear domain context. Use explicit, named constants.

#### C. State and Architecture
- **State scoping**: Ensure state is scoped strictly to its component or module. Do not introduce global mutable variables or leak state across requests/renders.
- **Event listeners**: Verify event handlers are registered via standard project methods rather than inline HTML attributes, using event delegation where appropriate.
- **Simplicity**: Ensure minimal changes and maintainability. Do not over-abstract for incidental similarities.

#### D. HTML & Accessibility
- **Semantic markup**: Use semantic elements (`<button>`, `<nav>`, `<main>`, `<dialog>`) instead of generic `<div>` with click handlers.
- **Accessibility**: Preserve keyboard focus, tab navigation, accessible names, and form labels. Use ARIA attributes only when native HTML cannot convey the semantic state.

#### E. Comments and Cleanliness
- **Meaningful comments**: Remove comments that merely rephrase what the code visibly does. Retain or add comments only when explaining non-obvious constraints, algorithms, or rationale.
- **Dead code**: Remove commented-out code, temporary debug statements (`console.log`), and unused imports left during development.

---

### 3. Plan and Coordinate Fixes

1. Group identified issues into:
   - **Direct fixes**: Code style compliance, Vitest assertion patterns, removing tautological comments, adding missing variable assignments or error propagation.
   - **Structural / Pre-existing issues**: Flaws in legacy code outside the diff, or changes requiring interface/architectural decisions.
2. For direct fixes within the approved scope: proceed to apply focused edits.
3. For structural or pre-existing issues: explain the finding to the user, outline the proposed alternative and affected files, and obtain approval before altering that code.

---

### 4. Apply Hands-On Corrections

1. Make minimal, focused edits targeting only the relevant lines or functions.
2. Do not rewrite whole files.
3. Preserve unrelated code, comments, and working-tree changes.

---

### 5. Verification and Sanity Gate

After applying manual fixes, run all required project verification checks:
1. **Linter & Style checks**:
   ```bash
   npm run check:all
   ```
2. **Local Tests**:
   ```bash
   npm test
   ```
3. **Build Check**:
   ```bash
   npm run build
   ```
4. If any check fails as a result of the changes, diagnose the root cause, fix it within the approved scope, and rerun the checks until clean.

---

### 6. Report the Outcome

Provide a structured summary to the user:
- **Files Inspected**: List of changed files reviewed.
- **Deficiencies Identified Manually**: Breakdown of semantic or rule violations found (e.g. Vitest patterns, error handling, hardcoded values).
- **Fixes Applied**: Concrete explanation of what was changed and why.
- **Verification Results**: Status of `check:all`, `npm test`, and `npm run build`.
- **Remaining / Out-of-Scope Items**: Any notes on pre-existing issues or recommendations left for future tasks.
