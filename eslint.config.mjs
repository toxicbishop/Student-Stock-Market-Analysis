import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Browser globals for all source files
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    // Node.js globals for CommonJS config files
    files: ["*.config.js", "*.config.cjs", "postcss.config.js", "tailwind.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
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
    ignores: ["dist/", "node_modules/", "server/"],
  },
];
