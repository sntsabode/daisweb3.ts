export const eslintignore = `
node_modules
dist
tests
migrations
`.trim()

export const eslintrc = `
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-extraneous-class": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-namespace": "off",
    "no-irregular-whitespace": "error",
    "no-await-in-loop": "error",
    "guard-for-in": "error"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ]
}
`.trim()