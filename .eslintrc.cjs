module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
    mocha: true,
    browser: true,
  },
  extends: ["standard", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-expressions": "off", // allow chai expect style
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      rules: {
        "prefer-const": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "interface",
            format: ["PascalCase"],
            custom: { regex: "^I[A-Z]", match: true },
          },
          { selector: "typeAlias", format: ["PascalCase"] },
          {
            selector: "variable",
            modifiers: ["const"],
            format: ["UPPER_CASE", "camelCase"],
          },
        ],
      },
    },
  ],
};
