# Demo API Test (Flattened API Testing Framework)

Lightweight JavaScript (ESM) API testing framework using Mocha, Chai, Axios against the public demo API at https://reqres.in.

## Key Tooling & Automation

| Capability            | Tool                         | Notes                                                          |
| --------------------- | ---------------------------- | -------------------------------------------------------------- |
| Test runner           | Mocha + Chai                 | Pending tests are placeholders where API now requires auth     |
| HTTP client           | Axios                        | Centralized instance with interceptors                         |
| Schema validation     | chai-json-schema             | JSON schema checks for responses                               |
| Linting               | ESLint (Standard + Prettier) | Run via `npm run lint` / fixed by lint-staged and `lint:fix`   |
| Formatting            | Prettier                     | Auto-run on staged files; manual `npm run format`              |
| Architecture rules    | dependency-cruiser           | Enforced in `arch:check` and pre-commit                        |
| Secret scanning       | gitleaks                     | Config in `.gitleaks.toml`, invoked pre-commit (skip fallback) |
| Pre-commit automation | Husky + lint-staged          | Ordered: secrets → format/fix → lint → test → arch             |
| Coverage              | nyc                          | `npm run coverage`                                             |
| Container usage       | Docker                       | Build & run tests without local Node setup                     |
| Node version pin      | `.nvmrc`                     | Ensures contributors use `v20.11.1`                            |

> For a deep dive into the full quality & tooling stack (why each tool exists, how it works, and how to reproduce it elsewhere) see: [Quality & Tooling Architecture](docs/quality-tooling.md)

## Features

- Mocha test runner + Chai assertions
- Axios HTTP client with centralized config
- JSON schema validation (chai-json-schema)
- Environment driven base URL + timeout + optional API key
- Code coverage via nyc
- Linting & formatting enforced (ESLint + Prettier)
- Secret scanning pre-commit (gitleaks) with safe fallbacks
- Dockerized workflow for zero local setup

## Project Structure

```
src/
	client/httpClient.js      # Axios instance with interceptors
	config/index.js           # Environment & defaults
	utils/assertions.js       # Chai + helpers

data/
	payloads/createUser.json
	schemas/userSchema.json

tests/
	health.spec.js
	resources/resources.spec.js
	users/users.spec.js
```

## Setup (Local)

```bash
nvm use # ensures Node 20.11.1 (if you have nvm)
npm install
```

If you don't have Node locally, use Docker (see below).

## Running Tests

Local:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Docker (no local Node required):

```bash
npm run docker:build
npm run docker:test
```

Full validation in container:

```bash
npm run docker:validate
```

## Coverage

```bash
npm run coverage
```

## Lint & Format

Check:

```bash
npm run lint
npm run format:check
```

Auto-fix & write formatting:

```bash
npm run lint:fix
npm run format
```

Pre-commit automatically formats staged files via `lint-staged`.

## Validate Pipeline (Aggregated)

```bash
npm run validate
```

Runs (in order):

1. Prettier check
2. ESLint
3. Tests
4. dependency-cruiser architecture check

## Pre-Commit Hook Flow

The Husky `pre-commit` executes (cheap → expensive):

1. gitleaks secret scan (local binary > Docker > skip with warning if neither available)
2. lint-staged (Prettier + ESLint --fix on staged files)
3. Full ESLint (catches cross-file issues)
4. Mocha tests
5. Architecture check (dependency-cruiser)

If any step fails (except an environment-only gitleaks Docker failure) the commit is blocked.

Bypass (emergency only):

```bash
git commit -m "msg" --no-verify
```

Skip only secret scan (still runs other checks):

```bash
SKIP_GITLEAKS=1 git commit -m "msg"
```

## Secret Scanning (gitleaks)

- Config: `.gitleaks.toml` (redacts secrets in output, allowlist for test fixtures)
- Manual full repo scan:
  ```bash
  npm run gitleaks:scan
  ```
- Staged scan (same as pre-commit):
  ```bash
  npm run gitleaks:protect
  ```

If Docker is required (no local binary) but the daemon is down, the hook warns and continues (to avoid blocking unrelated work). For CI you should enable failing hard.

## Docker Workflow

The default `docker:build` now produces a full dev/test image (includes tests, configs, dev deps). A slim production-style image is available via the `runtime` stage.

Build dev image (full source + tests):

```bash
npm run docker:build
```

Run tests in dev image:

```bash
npm run docker:test
```

Run full validation (format check, lint, tests, architecture):

```bash
npm run docker:validate
```

Open a shell inside the dev image:

```bash
npm run docker:shell
```

Build slim runtime image (no tests, minimal files):

```bash
npm run docker:build:runtime
```

If you prefer mounting local code instead of baking it in:

```bash
docker run --rm -it -v "${PWD}:/workspace" -w /workspace node:20.11.1-alpine sh
npm ci
npm test
```

## Architecture Rules

`dependency-cruiser` rules live in `.dependency-cruiser.cjs`. Run manually:

```bash
npm run arch:check
```

## Formatting on Save

The repo expects your editor to run Prettier on save. VS Code users: ensure the workspace `settings.json` enables `editor.defaultFormatter` and format-on-save.

## Environment Variables

Create a `.env` (optional):

```
API_BASE_URL=https://reqres.in/api
API_TIMEOUT=7000
API_KEY=your_key_if_required
```

## Notes on 401 Responses

At time of setup some resource/user detail endpoints responded with `401 Missing API key`. If the public API now requires an API key, set `API_KEY` env variable; otherwise you may temporarily skip those tests or change endpoints that still return 200 (e.g. list endpoints).

## Future Improvements

- Add retry logic (axios-retry)
- Dynamic test data generation
- HTML / JUnit reporters for CI
- GitHub Action workflow (lint + test + secret scan) (deferred)
- Negative test cases (404, 400 scenarios)
- Commit message lint (commitlint)

## Naming Conventions (Branches, Commits, PRs)

Ticket-first naming ensures automatic linking in trackers and consistent history.

Branch names:

```
<category>/<TICKET>-<kebab-brief-description>
```

Where:

- category: one of `feature|fix|chore|refactor|docs|hotfix`
- TICKET: `[A-Z]{2,5}-[0-9]+` (e.g. `PROJ-123`)
- description: lowercase kebab case words

Examples:

```
feature/PROJ-123-add-user-endpoint
fix/CORE-9-null-ref-guard
```

Commit messages (enforced by commitlint, ticket optional):

```
<type>(<optional-scope>): <TICKET> <subject>
<type>(<optional-scope>): <subject>
```

Example commits (with & without ticket):

```
feat(api): PROJ-123 add user lookup endpoint
fix: CORE-9 guard against null pointer in user parser
chore: update dependencies
```

PR Titles:

```
<TICKET> Capitalized summary
```

Examples:

```
PROJ-123 Add user lookup endpoint
CORE-9 Guard against null pointer in user parser
```

Automation:

- Local commit messages validated via Husky `commit-msg` + `commitlint`
- Branch naming verified locally via Husky `pre-push`
- GitHub Action `.github/workflows/naming.yml` fails PRs if branch or title invalid

Regex references:

- Branch: `^(feature|fix|chore|refactor|docs|hotfix)/[A-Z]{2,5}-[0-9]+(-[a-z0-9-]+)*$`
- Ticket: `[A-Z]{2,5}-[0-9]+`
- Commit header (ticket optional): `^(?:feat|fix|chore|refactor|docs|test|perf|build|ci|style|revert)(?:\([^)]+\))?!?: (?:[A-Z]{2,5}-\d+ )?.+`

Rationale:

1. Fast visual scanning of git log & PR list
2. Auto-linking to issue tracker
3. Easier temporary branch filtering (`git branch --list 'feature/PROJ-*'`)
4. Encourages ticket linking when available while allowing small housekeeping commits

## Documentation

- High-level overview: this `README.md` (commands & quickstart)
- Detailed rationale & reproduction steps: `docs/quality-tooling.md`

## Troubleshooting

| Issue                                 | Cause                          | Fix                                                      |
| ------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| Pre-commit skips gitleaks             | No binary & Docker daemon down | Start Docker or install gitleaks locally                 |
| ESLint passes locally but fails in CI | Different Node version         | Run `nvm use` or align CI Node version                   |
| Tests hang                            | External API slow/unreachable  | Adjust `API_TIMEOUT` or mock responses                   |
| Architecture check fails              | New dependency rule violation  | Inspect `.dependency-cruiser.cjs` and adjust code/design |

## Contributing

1. Create a feature branch
2. Make changes (tests + code)
3. Run `npm run validate`
4. Commit (pre-commit will enforce quality) & open PR

## License

MIT (adjust as needed)
