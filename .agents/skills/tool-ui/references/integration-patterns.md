# Tool UI Integration Patterns

Use these patterns after installation.

## Pattern A: assistant-ui backend tool rendering (recommended default)

Use when tool results are returned by the backend.

```tsx
import { type Toolkit } from "@assistant-ui/react";
import { Plan, safeParseSerializablePlan } from "@/components/tool-ui/plan";
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

Generate this shape quickly:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-backend --component plan
```

## Pattern B: assistant-ui frontend interactive tool rendering

Use when user interaction must call `addResult(...)`.

```tsx
import { type Toolkit } from "@assistant-ui/react";
import {
  OptionList,
  SerializableOptionListSchema,
  safeParseSerializableOptionList,
} from "@/components/tool-ui/option-list";
import { createArgsToolRenderer } from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {
  chooseOption: {
    description: "Ask user to choose one option",
    parameters: SerializableOptionListSchema,
    render: createArgsToolRenderer({
      safeParse: safeParseSerializableOptionList,
      render: (parsedArgs, { result, addResult }) => {
        if (result) {
          return <OptionList {...parsedArgs} value={undefined} choice={result} />;
        }

        return (
          <OptionList
            {...parsedArgs}
            value={undefined}
            onConfirm={(selection) => addResult?.(selection)}
          />
        );
      },
    }),
  },
};
```

Generate starter snippet:

```bash
python scripts/tool_ui_scaffold.py --mode assistant-frontend --component option-list
```

## Pattern C: non-assistant-ui manual rendering

Use when app already has a runtime stack.

```tsx
import { Plan, safeParseSerializablePlan } from "@/components/tool-ui/plan";

function ToolResultView({ toolName, result }: { toolName: string; result: unknown }) {
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
- Integrate one component first, then scale up.
