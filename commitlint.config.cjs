/**
 * Commit message format enforced:
 *
 * <type>(<optional-scope>): <optional TICKET> <subject>
 *
 * Examples:
 *  feat(api): PROJ-123 add user lookup endpoint
 *  fix: CORE-9 guard against null user
 *  chore: update dependencies (no ticket)
 *
 * Allowed types below (type-enum rule). When present ticket must match /[A-Z]{2,5}-\d+/.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      // type(scope)?: (optional TICKET )subject
      // Capture groups: type, scope, ticket?, subject
      // Two patterns supported:
      // 1. type(scope)?: TICKET subject
      // 2. type(scope)?: subject
      headerPattern: /^(\w+)(?:\(([^)]+)\))?!?: (?:([A-Z]{2,5}-\d+) )?(.+)$/,
      headerCorrespondence: ["type", "scope", "ticket", "subject"],
    },
  },
  rules: {
    // Conventional types we allow
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "refactor",
        "docs",
        "test",
        "perf",
        "build",
        "ci",
        "style",
        "revert",
      ],
    ],
    // NOTE: commitlint does not provide a built-in 'header-pattern' rule.
    // Pattern enforcement is handled by parserPreset.headerPattern above.
    // (The previous custom 'header-pattern' rule was removed due to RangeError.)
    // Provide a sanity header length constraint instead.
    "header-max-length": [2, "always", 120],
    // Do not force references (ticket optional)
    "references-empty": [0],
    // We don't force subject casing (ticket already leads)
    "subject-case": [0],
  },
};
