# Copilot instructions for this repository

This repo is a lightweight JavaScript (ESM) API testing project for https://reqres.in built on Mocha + Chai + Axios with strong quality gates. Use these rules to be productive and respect local conventions.

## Architecture at a glance

- Tests call a shared Axios instance exported from `src/client/httpClient.js`, which reads config from `src/config/index.js`.
- Config comes from environment variables (via dotenv). Defaults: `API_BASE_URL=https://reqres.in/api`, `API_TIMEOUT=5000`. If `API_KEY` is set, it is injected as header `x-api-key`.
- JSON Schemas live under `data/schemas/` and are asserted with `chai-json-schema` via helpers in `tests/support/assertions.js`.
- Test-only HTTP logging is opt-in through `LOG_HTTP=1` and is wired in `tests/setup/http-logging.js` via axios-logger.

## Key workflows

- Run tests locally: `npm test` (Mocha config: `.mocharc.json`, spec glob `tests/**/*.spec.js`, timeout 8000ms).
- Coverage: `npm run coverage` (nyc; reports to `coverage/`, thresholds in `package.json`).
- Lint & format: `npm run lint`, `npm run format`, check with `npm run format:check`.
- Architecture rules: `npm run arch:check` (dependency-cruiser, config `.dependency-cruiser.cjs`).
- Full validation locally: `npm run validate`.
- Dockerized runs (no local Node):
  - Build: `npm run docker:build`
  - Test: `npm run docker:test` (wrapper passes `.env` automatically)
  - Validate: `npm run docker:validate`
- Secret scanning (gitleaks): staged scan `npm run gitleaks:protect`; full scan `npm run gitleaks:scan`. Docker fallback wrappers: `npm run docker:gitleaks` and `npm run docker:gitleaks:full`.

## Conventions and patterns

- ESM throughout (`type: module`). Import paths include explicit `.js`.
- Tests live under `tests/**` and use Chai `expect`. Prefer helpers from `tests/support/assertions.js`:
  - `expectStatus(res, code)`
  - `expectSchema(obj, schema)`
- Load JSON fixtures/schemas using `fs.readFileSync` + `JSON.parse` (avoid import assertions for Node compatibility), e.g. see `tests/users/users.spec.js`.
- HTTP client: import `http` from `src/client/httpClient.js` and pass only per-call overrides; base URL/timeout/headers come from `getConfig()`.
- Error logging: response interceptor logs concise metadata on failures; tests should assert status/data rather than rely on logs.
- Environment: use `.env` locally; CI variables/secrets are wired in `.github/workflows/quality.yml`.

## What to change vs. where

- Add a new API test: create `tests/<area>/<name>.spec.js`, import `http` and any schemas from `data/schemas/`. Keep per-test timeouts under 8s or adjust `.mocharc.json`.
- Add a new schema: place under `data/schemas/` and reference it from tests via absolute path resolution similar to `tests/users/users.spec.js`.
- Extend HTTP behavior: modify `src/client/httpClient.js` (e.g., add retry) and prefer configuration from `src/config/index.js`.
- New env settings: add to `src/config/index.js` and document them in `README.md`.

## Guardrails the agent must respect

- Keep imports ESM and use file extensions.
- Do not hardcode secrets; rely on env and `.gitleaks.toml` allowlist only for dummy placeholders.
- Conform to lint + format + dep-cruiser rules; run `npm run validate` before proposing a PR.
- Branch/PR naming conventions are enforced by `.github/workflows/naming.yml` and `commitlint.config.cjs`.

## Examples

- Making a request in a test:
  ```js
  import { http } from "../../src/client/httpClient.js";
  const res = await http.get("/users/2");
  expect(res.status).to.equal(200);
  ```
- Validating against a schema:
  ```js
  import { expectSchema } from "../support/assertions.js";
  const schema = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../../data/schemas/userSchema.json"),
      "utf-8",
    ),
  );
  expectSchema(res.data.data, schema);
  ```

When in doubt, mirror patterns from `tests/users/users.spec.js` and use the shared HTTP client and assertion helpers.
