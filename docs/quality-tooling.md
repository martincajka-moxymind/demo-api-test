# Quality & Tooling Architecture

Comprehensive documentation of the non-business (infrastructure/quality) setup: formatting, linting, commit workflow automation, secret scanning, dependency rules, containerization, editor integration, and supporting scripts.

---

## Summary Matrix

| Capability                    | Tool / File(s)                                 | Why (Quality Goal)                 | What It Does                | How This Repo Uses It                                        | Reproduce Elsewhere (Steps)                                                  |
| ----------------------------- | ---------------------------------------------- | ---------------------------------- | --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Consistent formatting         | Prettier (`prettierrc.json`)                   | Eliminates style noise in PRs      | AST-based rewriter          | Run via `format` script + auto on staged files (lint-staged) | 1. `npm i -D prettier` 2. Add config 3. Add scripts 4. Integrate lint-staged |
| Editor baseline consistency   | `.editorconfig`                                | Prevent cross‑IDE whitespace drift | IDEs read canonical rules   | Matches Prettier (2 spaces, utf-8)                           | Copy file to root                                                            |
| Linting (JS)                  | ESLint (`.eslintrc.cjs`)                       | Catch bugs & anti‑patterns early   | Rule engine over AST        | Standard + Prettier integration                              | Install eslint + config + scripts                                            |
| TypeScript-ready linting      | ESLint overrides                               | Future-proof migration             | Per‑file override section   | Placeholder for TS adoption                                  | Add override block; extend gradually                                         |
| Formatter & linter harmony    | eslint-config-prettier                         | Avoid rule conflicts               | Disables formatting rules   | Extended in config chain                                     | Add to devDependencies + extends                                             |
| Fast staged fixes             | lint-staged (`package.json`)                   | Only touch changed files           | Runs commands on staged set | Formats + eslint --fix pre-commit                            | Add lint-staged config + Husky hook                                          |
| Commit-time orchestration     | Husky (`.husky/*`)                             | Shift-left failures                | Git hook scripts            | Pre-commit & commit-msg hooks                                | `npx husky install` + add hooks                                              |
| Commit message policy         | commitlint (`commitlint.config.cjs`)           | Conventional commits/changelog     | Parses commit headers       | `commit-msg` hook blocking invalid messages                  | Add config + hook                                                            |
| Secret scanning               | gitleaks (`.gitleaks.toml`)                    | Prevent secret leakage             | Pattern & entropy matcher   | Pre-commit staged scan (binary or Docker)                    | Add config + hook script                                                     |
| Architecture dependency rules | dependency-cruiser (`.dependency-cruiser.cjs`) | Prevent structural erosion         | Static dependency graph     | Checked in `arch:check` + hook                               | Install + init config                                                        |
| Test execution                | Mocha + Chai (`.mocharc.json`)                 | Prove behavior early               | BDD runner + assertions     | Core API tests & placeholders                                | Install mocha/chai + config                                                  |
| Schema validation             | chai-json-schema                               | Contract stability                 | JSON Schema assertion       | Helper `expectSchema`                                        | Install plugin + helper                                                      |
| HTTP test client              | Axios (`src/client/httpClient.js`)             | Centralize transport               | Configured instance         | Shared across tests                                          | Create factory module                                                        |
| Environment & config          | dotenv (`src/config/index.js`)                 | Environment portability            | Loads `.env`                | Provides config object                                       | Add dotenv + central loader                                                  |
| Coverage                      | nyc (`package.json`)                           | Measure test effectiveness         | Istanbul instrumentation    | Coverage script + thresholds                                 | Install nyc + config                                                         |
| Containerized dev/test        | Docker (`Dockerfile`)                          | Reproducible env                   | Multi-stage image           | Dev + runtime stages                                         | Author multi-stage Dockerfile                                                |
| Secret-scan via Docker        | Wrapper (`scripts/docker-gitleaks.js`)         | Uniform scan                       | Path normalization + run    | Docker fallback for gitleaks                                 | Implement wrapper                                                            |
| Node version pin              | `.nvmrc`                                       | Align local + CI runtime           | nvm reads version           | Fixed Node 20.11.1                                           | Create file + doc usage                                                      |
| Project guidance              | `README.md`                                    | Faster onboarding                  | Central instructions        | Describes commands & flow                                    | Keep updated                                                                 |
| Assertion helpers             | `tests/support/assertions.js`                  | DRY expressive tests               | Utility wrappers            | Common expect utilities                                      | Add custom helpers                                                           |
| Error visibility              | Axios interceptors                             | Faster debugging                   | Logs error meta             | Response interceptor                                         | Add interceptor                                                              |

---

## Detailed Sections

### 1. Formatting (Prettier)

Why: Eliminates subjective style debates; reduces diff noise.
What: Parses code → prints canonical form.
How used: Config `prettierrc.json`; ignore via `.prettierignore`; run manually or via lint-staged.
Reproduce:

1. `npm i -D prettier`
2. `prettierrc.json` with desired options
3. Scripts: `format`, `format:check`
4. Add lint-staged mapping: `*.{js,json,md}` → `prettier --write`

### 2. Linting (ESLint)

Why: Detect problematic patterns early.
What: Rule-based static analysis.
How used: `.eslintrc.cjs` extends Standard + Prettier; disables `no-unused-expressions` for Chai.
Reproduce: install eslint + shareable configs; add scripts `lint`, `lint:fix`.

### 3. lint-staged

Why: Fast commits by limiting scope to staged files.
What: Executes defined commands on staged globs pre-commit.
How used: Formats and auto-fixes JS before full lint/test pass.
Reproduce: `npm i -D lint-staged` and configure in `package.json`.

### 4. Husky Git Hooks

Why: Prevents low-quality commits entering history.
What: Git-managed hook scripts.
How used: `pre-commit` pipeline (secrets → format/fix → lint → test → arch) and `commit-msg` for commitlint.
Reproduce: `npx husky install` then add hook scripts under `.husky/`.

### 5. Commit Message Lint (commitlint)

Why: Standardized commit messages enable automation (changelog, semantic releases).
What: Validates message header structure.
How used: `commitlint.config.cjs` + Husky `commit-msg` hook.
Reproduce: install `@commitlint/cli @commitlint/config-conventional`, add config & hook.

### 6. Secret Scanning (gitleaks)

Why: Catch secrets prior to pushing.
What: Regex + entropy scanning engine.
How used: Pre-commit staged scan; `.gitleaks.toml` for rules & allowlist; Docker fallback script.
Reproduce: Add config; hook runs `gitleaks protect --staged` (or Docker variant).

### 7. Architecture Rules (dependency-cruiser)

Why: Maintain modular structure; prevent cyclic deps.
What: Builds dependency graph & enforces rules.
How used: `.dependency-cruiser.cjs` + `arch:check` script + pre-commit.
Reproduce: `npm i -D dependency-cruiser` then `depcruise --init` and refine.

### 8. Testing Stack (Mocha + Chai)

Why: Behavioral safety net.
What: BDD runner & assertions.
How used: `.mocharc.json` + example health test & placeholders.
Reproduce: Add tests under `tests/**/*.spec.js` and configure mocha.

### 9. Schema Validation (chai-json-schema)

Why: Ensures API response contract stability.
What: Adds `.jsonSchema` assertion to Chai.
How used: Schemas in `data/schemas/`; helper in `tests/support/assertions.js`.
Reproduce: Install plugin & register before tests.

### 10. HTTP Client Layer (Axios)

Why: Centralize base URL, headers, timeout.
What: Singleton axios instance with interceptors.
How used: `src/client/httpClient.js`; consumed in tests.
Reproduce: Create module returning configured axios instance.

### 11. Environment Management (dotenv)

Why: Externalize environment-specific values.
What: Loads variables from `.env` into process.
How used: `src/config/index.js` loads early.
Reproduce: `npm i dotenv`; call `dotenv.config()` at startup.

### 12. Coverage (nyc)

Why: Quantify test thoroughness.
What: Instruments code; reports metrics.
How used: `nyc` config block in `package.json`; `coverage` script.
Reproduce: `npm i -D nyc`; add script & configuration.

### 13. Containerization (Docker)

Why: Deterministic environment across machines.
What: Multi-stage Dockerfile (dev + runtime). `.dockerignore` for slimming context.
How used: Scripts `docker:*` to build/test/validate.
Reproduce: Author multi-stage Dockerfile with pinned Node base image.

### 14. Cross-Platform Secret Scan Wrapper

Why: Normalize path handling on Windows for Docker gitleaks.
What: Node script translates path & invokes container.
How used: `scripts/docker-gitleaks.js` invoked by `docker:gitleaks*` scripts.
Reproduce: Add wrapper script; ensure executable permission or `node script.js`.

### 15. Node Version Pinning

Why: Avoid runtime discrepancies.
What: `.nvmrc` with Node version.
How used: Contributors run `nvm use`.
Reproduce: Create `.nvmrc` and document.

### 16. Editor Consistency

Why: Align formatting across IDEs.
What: `.editorconfig` + (optional) `.vscode/settings.json`.
How used: Mirrors Prettier settings.
Reproduce: Create `.editorconfig` file.

### 17. Documentation (README & Docs)

Why: Reduce onboarding friction; central quality narrative.
What: README overview + `docs/quality-tooling.md` deep dive.
How used: Link from README to full document.
Reproduce: Maintain docs folder; cross-link.

### 18. Supporting Assertions

Why: DRY test utilities.
What: Consolidated wrappers for status & schema checks.
How used: `tests/support/assertions.js` exports helpers.
Reproduce: Create helper module imported across tests.

### 19. Error Visibility in HTTP Layer

Why: Faster root cause for failing HTTP requests.
What: Axios response interceptor logs concise error metadata.
How used: Added in `httpClient.js`.
Reproduce: Attach interceptor capturing `error.response` and logging selective fields.

---

## Commit Pipeline Flow

1. Developer stages changes.
2. `pre-commit` runs:
   - Secret scan (gitleaks)
   - lint-staged (Prettier + eslint --fix on staged files)
   - Full eslint
   - Mocha tests
   - Architecture check
3. `commit-msg` validates Conventional Commit format.
4. CI (future) can re-run `validate` + full secret scan.

---

## Minimal Bootstrap for Another Repo

Example `package.json` snippets and configs to replicate quickly:

```jsonc
{
  "scripts": {
    "test": "mocha",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "arch:check": "dependency-cruiser src --config .dependency-cruiser.cjs",
    "validate": "npm run format:check && npm run lint && npm test && npm run arch:check",
  },
  "lint-staged": {
    "*.{js,ts,json,md}": ["prettier --write"],
    "*.{js,ts}": ["eslint --fix"],
  },
}
```

ESLint config:

```cjs
module.exports = {
  env: { es2022: true, node: true, mocha: true },
  extends: ["standard", "plugin:prettier/recommended"],
  rules: { "no-unused-expressions": "off" },
};
```

Mocha config (`.mocharc.json`):

```json
{ "spec": ["tests/**/*.spec.js"], "timeout": 8000 }
```

Prettier (`prettierrc.json`):

```json
{ "semi": true, "singleQuote": true, "trailingComma": "es5" }
```

Husky `pre-commit` (conceptual):

```bash
#!/usr/bin/env bash
set -e
npx gitleaks protect --staged || { echo "Secret scan warning"; }
npx lint-staged
npm run lint
npm test
npm run arch:check
```

Commitlint hook:

```bash
#!/usr/bin/env bash
npx --no-install commitlint --edit "$1"
```

Commitlint config (`commitlint.config.cjs`):

```cjs
module.exports = { extends: ["@commitlint/config-conventional"] };
```

---

## Adoption Order Recommendation

1. Prettier + EditorConfig
2. ESLint
3. Mocha/Chai tests baseline
4. Coverage (nyc)
5. HTTP client abstraction
6. Husky + lint-staged
7. dependency-cruiser
8. gitleaks
9. commitlint
10. Dockerization (if portability needed early)

---

## Maintenance Tips

- Revisit dependency-cruiser rules to tighten over time.
- Keep gitleaks allowlist minimal; review for drift.
- Increment coverage thresholds gradually.
- Update docs when adding or modifying scripts.
- Periodically run full secret scans (not only staged).

---

## Guiding Principles

- Idempotent operations (format, build) for predictability.
- Shift-left quality gates.
- Centralized configuration for reuse.
- Reproducible environments (Docker, Node version pin).
- Progressive hardening (start permissive, tighten rules).

---

## Future Enhancements (Backlog)

- CI pipeline (lint + test + secret scan) via GitHub Actions.
- API mocking layer for deterministic tests.
- JUnit/HTML reports for test & coverage outputs.
- Semantic release automation.
- Retry & circuit breaker patterns in HTTP client.

---

_Last updated: 2025-10-03_
