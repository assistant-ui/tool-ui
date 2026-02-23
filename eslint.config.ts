import { defineConfig, globalIgnores } from "eslint/config";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import oxlint from "eslint-plugin-oxlint";
import reactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";
import { toolUiActionModelPlugin } from "./lib/eslint/tool-ui-action-model-plugin";

// ESLint is retained only for rules Oxlint cannot handle:
//   1. no-restricted-syntax (custom AST selectors)
//   2. no-restricted-imports (complex overrides with ignores)
//   3. Custom tool-ui/* plugin rules (JS AST rules)
//   4. React Compiler hook rules (eslint-plugin-react-hooks)
// All standard lint rules are handled by Oxlint (see .oxlintrc.json).

const eslintConfig = defineConfig([
  // Inline disable comments for rules now handled by Oxlint
  // appear unused to ESLint — suppress those warnings.
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },

  globalIgnores([
    "**/dist/**",
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/next-env.d.ts",
    "components/tool-ui/weather-widget/generated/**",
  ]),

  // TypeScript parser + plugin (plugin registered for disable comment
  // recognition — all TS rules are enforced by Oxlint, not ESLint)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- plugin type mismatch
      "@typescript-eslint": tsPlugin as any,
    },
  },

  // React hooks / React Compiler rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- configs shape mismatch
      "react-hooks": reactHooks as any,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      // Disable strict React Compiler rules that don't fit this codebase
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },

  // Oxlint can't handle custom AST selectors
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: ["components/tool-ui/shared/media/safe-navigation.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='window'][callee.property.name='open']",
          message:
            "Use openSafeNavigationHref from components/tool-ui/shared/media/safe-navigation instead of window.open.",
        },
      ],
    },
  },

  // Oxlint can't handle no-restricted-imports with complex overrides
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: [
      "components/tool-ui/shared/**/*.ts",
      "components/tool-ui/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "../shared",
              message:
                "Import from direct shared modules (for example '../shared/schema' or '../shared/contract') instead of the shared barrel.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/tool-ui/**/*.ts", "components/tool-ui/**/*.tsx"],
    ignores: [
      "components/tool-ui/**/_adapter.tsx",
      "components/tool-ui/shared/**/*.ts",
      "components/tool-ui/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/ui/*", "@/lib/ui/cn"],
              message:
                "Import UI primitives and cn from './_adapter' to keep tool-ui components portable.",
            },
          ],
        },
      ],
    },
  },

  // Custom tool-ui plugin rules (JS AST rules, can't run in Oxlint)
  {
    files: [
      "components/tool-ui/audio/**/*.{ts,tsx}",
      "components/tool-ui/citation/**/*.{ts,tsx}",
      "components/tool-ui/code-block/**/*.{ts,tsx}",
      "components/tool-ui/data-table/**/*.{ts,tsx}",
      "components/tool-ui/image/**/*.{ts,tsx}",
      "components/tool-ui/instagram-post/**/*.{ts,tsx}",
      "components/tool-ui/link-preview/**/*.{ts,tsx}",
      "components/tool-ui/linkedin-post/**/*.{ts,tsx}",
      "components/tool-ui/order-summary/**/*.{ts,tsx}",
      "components/tool-ui/plan/**/*.{ts,tsx}",
      "components/tool-ui/terminal/**/*.{ts,tsx}",
      "components/tool-ui/video/**/*.{ts,tsx}",
      "components/tool-ui/x-post/**/*.{ts,tsx}",
    ],
    plugins: {
      "tool-ui": toolUiActionModelPlugin,
    },
    rules: {
      "tool-ui/no-embedded-response-actions": "error",
    },
  },
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/**/*.{ts,tsx}",
    ],
    plugins: {
      "tool-ui": toolUiActionModelPlugin,
    },
    rules: {
      "tool-ui/no-add-result-in-local-actions": "error",
      "tool-ui/decision-actions-require-envelope": "error",
    },
  },

  // Disable core ESLint rules that Oxlint already handles.
  // Only include configs for plugins still installed in ESLint.
  ...oxlint.configs["flat/eslint"],
  ...oxlint.configs["flat/react-hooks"],
]);

export default eslintConfig;
