---
name: tool-ui
description: Find, install, configure, and integrate Tool UI components in React apps using shadcn registry entries, compatibility checks, scaffolded runtime wiring, and troubleshooting workflows. Use when developers ask to add one or more Tool UI components, choose components for a use case, verify compatibility, or wire Tool UI payloads into assistant-ui or an existing chat/runtime stack.
---

# Tool UI

Use this skill to move from request to working Tool UI integration quickly.

Prefer assistant-ui when the project has no existing chat UI/runtime. Treat assistant-ui as optional when the app already has a working runtime.

## Workflow

1. Run compatibility and doctor checks.
2. Find candidate components or bundles.
3. Install selected components.
4. Generate scaffolds and integrate runtime wiring.
5. Validate behavior and troubleshoot failures.

## Step 1: Compatibility and Doctor

```bash
python scripts/tool_ui_compat.py --project <repo-root>
python scripts/tool_ui_compat.py --project <repo-root> --doctor
```

Auto-fix missing `@tool-ui` registry entry:

```bash
python scripts/tool_ui_compat.py --project <repo-root> --fix
```

Minimum requirements:

- `components.json` exists.
- `components.json.aliases.utils` exists (typically `@/lib/utils`).
- `components.json.registries["@tool-ui"]` equals `https://tool-ui.com/r/{name}.json`.

## Step 2: Discover Components

Use intent-first discovery:

```bash
python scripts/tool_ui_components.py list
python scripts/tool_ui_components.py find "<use case keywords>"
python scripts/tool_ui_components.py bundle
python scripts/tool_ui_components.py bundle planning-flow
```

References:

- `references/components-catalog.md`
- `references/recipes.md`

## Step 3: Install Components

Generate install command:

```bash
python scripts/tool_ui_components.py install <component-id> [component-id...]
```

Default install pattern:

```bash
npx shadcn@latest add https://tool-ui.com/r/<component-id>.json
```

## Step 4: Scaffold and Integrate

Generate wiring snippet:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-backend --component plan
python scripts/tool_ui_scaffold.py --mode assistant-frontend --component option-list
python scripts/tool_ui_scaffold.py --mode manual --component stats-display
```

Use integration patterns for final adaptation:

- `references/integration-patterns.md`

## Step 5: Validate and Troubleshoot

After integration:

1. Run typecheck/lint.
2. Trigger a real tool call.
3. Confirm UI renders and interactions complete expected flow.

If broken, use:

- `references/troubleshooting.md`

## Action Model

Tool UI uses two action surfaces, rendered as compound siblings outside the display component:

- `ToolUI.LocalActions`: non-consequential side effects (export, copy, open link). Handlers must not call `addResult(...)`.
- `ToolUI.DecisionActions`: consequential choices that produce a `DecisionResult` envelope via `createDecisionResult(...)`. The commit callback calls `addResult(...)`.

Compound wrapper pattern for display components with actions:

```tsx
<ToolUI id={surfaceId}>
  <ToolUI.Surface>
    <DataTable {...props} />
  </ToolUI.Surface>
  <ToolUI.Actions>
    <ToolUI.LocalActions
      actions={[{ id: "export-csv", label: "Export CSV" }]}
      onAction={(actionId) => {
        /* side effects only */
      }}
    />
  </ToolUI.Actions>
</ToolUI>
```

Three components are action-centric exceptions — they keep embedded action props instead of sibling surfaces. All three share a unified interface:

- `actions`: action buttons rendered by the component.
- `onAction(actionId, state)`: runs after the action and receives post-action state.
- `onBeforeAction(actionId, state)`: guard evaluated before an action runs.

| Component          | State type passed to handlers |
| ------------------ | ----------------------------- |
| `OptionList`       | `OptionListSelection`         |
| `ParameterSlider`  | `SliderValue[]`               |
| `PreferencesPanel` | `PreferencesValue`            |

ESLint enforces this model:

- `no-embedded-response-actions` — bans legacy `responseActions` / `onResponseAction` props.
- `no-add-result-in-local-actions` — prevents `addResult()` inside LocalActions handlers.
- `decision-actions-require-envelope` — requires `createDecisionResult(...)` in DecisionActions handlers.

## Schema Boundary

Import from colocated entrypoints, not barrel `index.tsx`:

```tsx
import { DataTable } from "@/components/tool-ui/data-table/data-table";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table/schema";
import {
  ToolUI,
  createDecisionResult,
  type Action,
} from "@/components/tool-ui/shared";
```

## Operational Rules

- Install the smallest set of components that solves the request.
- Validate one component first, then scale to multiple components.
- Keep payload schemas serializable and explicit.
- For decision flows, wire `DecisionActions` with `createDecisionResult(...)` and commit via `addResult(...)`.
- For display components that need actions, use the compound `ToolUI` wrapper with `LocalActions`.

## Maintainer Notes

Keep component metadata synchronized with Tool UI source:

```bash
python scripts/sync_components.py
```

Run script tests:

```bash
python -m unittest discover -s tests -p "test_*.py"
```
