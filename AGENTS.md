# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Tool UI is a Next.js 16 documentation/demo site and copy-paste component library for AI assistant interfaces. There is no database, no Docker, and no required background services beyond the Node.js dev server.

### Running services

- **Dev server**: `pnpm dev` (Turbopack, port 3000). The static docs, gallery, and component previews work without any API keys.
- **Chat/Playground features** require `OPENAI_API_KEY` in `.env` (see `.env.example`). Without it the chat API routes return errors, but the rest of the site functions normally.

### Commands reference

All standard commands are documented in `CLAUDE.md`. Key ones:

| Task                      | Command          |
| ------------------------- | ---------------- |
| Dev server                | `pnpm dev`       |
| Lint + typecheck + format | `pnpm check`     |
| Tests (Vitest)            | `pnpm test`      |
| Fix lint issues           | `pnpm lint:fix`  |
| Typecheck only            | `pnpm typecheck` |

### Non-obvious caveats

- **Typecheck uses `tsgo`** (`@typescript/native-preview`), not standard `tsc`. The `pnpm typecheck` command runs `tsgo --noEmit`.
- **Formatter is `oxfmt`**, not Prettier. Run `pnpm format` to format or `pnpm format:check` to verify. It handles Tailwind class sorting and import sorting.
- **Linting is split**: `oxlint` handles standard rules; `eslint` is retained only for `no-restricted-syntax`, `no-restricted-imports`, custom `tool-ui/*` rules, and React Compiler hooks. `pnpm check` runs both in parallel.
- **`pnpm install` triggers `prepare`** which sets up git hooks via `tsx scripts/install-git-hooks.ts`. The hooks directory is `.githooks/`.
- **Pre-existing lint warnings** (60 warnings, 0 errors): these are known oxlint a11y warnings in the codebase and are not regressions.
- **Build uses `--experimental-build-mode=compile`**: `pnpm build` runs `next build --experimental-build-mode=compile`.
