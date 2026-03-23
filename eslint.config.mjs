import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const unwrapDefault = (config) => config?.default ?? config;
const asArray = (config) => (Array.isArray(config) ? config : [config]);

const eslintConfig = defineConfig([
  ...asArray(unwrapDefault(nextVitals)),
  ...asArray(unwrapDefault(nextTs)),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
