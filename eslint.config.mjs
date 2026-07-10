import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // Ignore build tool configs (CommonJS) and generated/output dirs
    ignores: [
      "dist/",
      "node_modules/",
      "server/",
      "postcss.config.js",
      "tailwind.config.js",
      "*.config.cjs",
    ],
  },
];
