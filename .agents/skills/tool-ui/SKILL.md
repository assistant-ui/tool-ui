---
name: tool-ui-integrator
description: Find, install, configure, and integrate Tool UI components in React apps using shadcn registry entries, compatibility checks, and runtime wiring patterns. Use when developers ask to add one or more Tool UI components, choose the right component for a use case, verify project compatibility, or wire Tool UI payloads into assistant-ui or another chat/runtime stack.
---

# Tool UI Integrator

## Overview

Use this skill to move from request to working Tool UI integration quickly: pick the right component, install it from the Tool UI registry, wire it into a runtime, and verify rendering.

Prefer assistant-ui when the project has no existing chat UI/runtime. Treat assistant-ui as optional if the project already has a working chat/runtime stack.

## Workflow

1. Run compatibility checks.
2. Discover candidate components.
3. Install selected components.
4. Integrate with the runtime.
5. Validate behavior end to end.

## Step 1: Check Compatibility

Run:

```bash
python scripts/tool_ui_compat.py --project <repo-root>
```

Require these minimum conditions before installation:

- `components.json` exists at project root.
- `components.json.aliases.utils` exists (typically `@/lib/utils`).
- `components.json.registries["@tool-ui"]` points to `https://tool-ui.com/r/{name}.json`.

If registry is missing, apply fix:

```bash
python scripts/tool_ui_compat.py --project <repo-root> --fix
```

If project is not shadcn-based and the user still wants Tool UI, either:

- Add shadcn setup first, then continue.
- Copy components manually from registry output and adapt imports.

## Step 2: Find Components

Start from user intent, not component names.

- Use `references/components-catalog.md` for category/use-case mapping.
- Use script search for shortlists:

```bash
python scripts/tool_ui_components.py find "<use case keywords>"
```

When ambiguous, propose 1-3 candidates with tradeoffs and recommend one.

## Step 3: Install Components

Generate install command:

```bash
python scripts/tool_ui_components.py install <component-id> [component-id...]
```

Run generated command from project root.

Default pattern:

```bash
npx shadcn@latest add https://tool-ui.com/r/<component-id>.json
```

Install only requested components. Avoid bulk installs unless user asks.

## Step 4: Integrate Runtime

Choose one path.

- `assistant-ui` path: use toolkit registration and Tool UI shared render helpers.
- existing runtime path: parse tool payloads manually and render Tool UI components directly.

Load `references/integration-patterns.md` for concrete patterns:

- backend tool output rendering
- interactive/frontend tool rendering
- framework-agnostic/manual rendering

## Step 5: Validate

Always verify after integration:

1. Run `typecheck` and `lint` (or project equivalents).
2. Start dev server.
3. Trigger a real tool call.
4. Confirm component renders with expected data and interaction path.

If integration fails, isolate whether the issue is:

- schema/payload mismatch
- missing registry/shared files
- runtime registration mismatch
- styling/theme conflict

## Operational Rules

- Prefer small, reversible changes.
- Keep payload schemas serializable and explicit.
- Add one component first, validate, then scale to multiple components.
- If assistant-ui is absent and user lacks a chat runtime, recommend assistant-ui as the fastest path.
