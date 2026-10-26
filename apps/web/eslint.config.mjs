import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler advisory rules (eslint-plugin-react-hooks v7). The
    // existing data-loading effects and the confetti randomness trip them;
    // refactoring those changes behaviour, so they warn until a dedicated PR.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "storybook-static/**",
    "next-env.d.ts",
    "**/*.d.ts",
    ".design-sync/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
