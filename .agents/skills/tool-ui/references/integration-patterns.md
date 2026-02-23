# Tool UI Integration Patterns

Use these patterns after installation.

## Pattern A: Backend display (recommended default)

Use when tool results are returned by the backend. No actions needed.

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { Plan } from "@/components/tool-ui/plan";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";
import { createResultToolRenderer } from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {
  showPlan: {
    type: "backend",
    render: createResultToolRenderer({
      safeParse: safeParseSerializablePlan,
      render: (parsedResult) => <Plan {...parsedResult} />,
    }),
  },
};
```

Generate starter snippet:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-backend --component plan
```

## Pattern B: Backend display with local actions

Use when the display component needs action buttons (export, copy, navigate) that are side-effect-only.

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { DataTable } from "@/components/tool-ui/data-table";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table/schema";
import {
  ToolUI,
  createResultToolRenderer,
  type Action,
} from "@/components/tool-ui/shared";

const localActions: Action[] = [
  { id: "export-csv", label: "Export CSV", variant: "secondary" },
];

export const toolkit: Toolkit = {
  showExpenses: {
    type: "backend",
    render: createResultToolRenderer({
      safeParse: safeParseSerializableDataTable,
      render: (parsedResult) => (
        <ToolUI id={parsedResult.id}>
          <ToolUI.Surface>
            <DataTable {...parsedResult} />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.LocalActions
              actions={localActions}
              onAction={(actionId) => {
                if (actionId === "export-csv") downloadCsv(parsedResult);
              }}
            />
          </ToolUI.Actions>
        </ToolUI>
      ),
    }),
  },
};
```

`LocalActions` handlers must not call `addResult(...)`.

## Pattern C: Frontend decision with DecisionActions

Use when user interaction is consequential (approve, purchase, delete) and must commit a durable result via `addResult(...)`.

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import {
  SerializableOrderSummarySchema,
  safeParseSerializableOrderSummary,
} from "@/components/tool-ui/order-summary/schema";
import {
  ToolUI,
  createDecisionResult,
  createArgsToolRenderer,
} from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {
  confirmOrder: {
    description: "Present order for user confirmation.",
    parameters: SerializableOrderSummarySchema,
    render: createArgsToolRenderer({
      safeParse: safeParseSerializableOrderSummary,
      idPrefix: "order-summary",
      render: (parsedArgs, { result, addResult }) => {
        if (result) {
          return <OrderSummary {...parsedArgs} choice={result} />;
        }

        return (
          <ToolUI id={parsedArgs.id}>
            <ToolUI.Surface>
              <OrderSummary {...parsedArgs} />
            </ToolUI.Surface>
            <ToolUI.Actions>
              <ToolUI.DecisionActions
                actions={[
                  { id: "cancel", label: "Cancel", variant: "outline" },
                  { id: "confirm", label: "Purchase" },
                ]}
                onAction={(action) =>
                  createDecisionResult({
                    decisionId: parsedArgs.id,
                    action,
                  })
                }
                onCommit={(decision) => addResult?.(decision)}
              />
            </ToolUI.Actions>
          </ToolUI>
        );
      },
    }),
  },
};
```

`DecisionActions` handlers must return a `createDecisionResult(...)` envelope.

## Pattern D: Action-centric components

OptionList, ParameterSlider, and PreferencesPanel keep embedded action props (`actions`, `onAction`, `onBeforeAction`). Do not wrap them in a `ToolUI` compound — wire actions directly:

```tsx
render: createArgsToolRenderer({
  safeParse: safeParseSerializableOptionList,
  idPrefix: "option-list",
  render: (parsedArgs, { result, addResult }) => {
    if (result) {
      return <OptionList {...parsedArgs} choice={result} />;
    }

    return (
      <OptionList
        {...parsedArgs}
        onAction={(actionId, selection) => {
          if (actionId === "confirm") addResult?.(selection);
        }}
      />
    );
  },
}),
```

Generate starter snippet:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-frontend --component option-list
```

## Pattern E: Non-assistant-ui manual rendering

Use when app already has a runtime stack.

```tsx
import { Plan } from "@/components/tool-ui/plan";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";

function ToolResultView({
  toolName,
  result,
}: {
  toolName: string;
  result: unknown;
}) {
  if (toolName !== "showPlan") return null;

  const parsed = safeParseSerializablePlan(result);
  if (!parsed) return null;

  return <Plan {...parsed} />;
}
```

Generate starter snippet:

```bash
python scripts/tool_ui_scaffold.py --mode manual --component plan
```

## Notes

- Render only after safe parsing succeeds.
- Keep payloads serializable and schema-validated.
- LocalActions handlers must not call `addResult(...)`.
- DecisionActions handlers must return a `createDecisionResult(...)` envelope.
- Integrate one component first, then scale up.
