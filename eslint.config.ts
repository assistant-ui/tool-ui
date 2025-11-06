import { defineConfig, globalIgnores } from "eslint/config";
// @ts-expect-error - eslint-config-next doesn't have type declarations
import nextVitals from "eslint-config-next/core-web-vitals";
// @ts-expect-error - eslint-config-next doesn't have type declarations
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Global ignores first
  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/next-env.d.ts",
  ]),

  // Next.js recommended configs (native flat format in v16, includes React)
  ...nextVitals,
  ...nextTs,

  // Custom rules override
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Disable strict React Compiler rules that don't fit this codebase's patterns
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
