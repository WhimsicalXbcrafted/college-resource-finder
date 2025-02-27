import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base ESLint rules
  js.configs.recommended,

  // TypeScript support
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Next.js support
  ...compat.extends("next/core-web-vitals"),

  // Custom rules
  {
    rules: {
      "no-console": "warn",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Ignore specific files/folders
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".next/",
      "prisma/",
      "**/*.d.ts",
    ],
  },
];

export default eslintConfig;