# Tool UI Integration Patterns

Use these patterns after component installation.

## Pattern A: assistant-ui backend tool rendering (recommended default)

Use this when tool results are returned by the backend.

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

## Pattern B: assistant-ui frontend interactive tool rendering

Use this when user interaction in the component should produce a tool result.

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

## Pattern C: non-assistant-ui manual rendering

Use this when app already has a chat/runtime stack.

```tsx
import { Plan, safeParseSerializablePlan } from "@/components/tool-ui/plan";

function ToolResultView({ toolName, result }: { toolName: string; result: unknown }) {
  if (toolName !== "showPlan") return null;

  const parsed = safeParseSerializablePlan(result);
  if (!parsed) return null;

  return <Plan {...parsed} />;
}
```

## Notes

- Keep tool payloads serializable and schema-validated.
- Render only after safe parsing succeeds.
- Add one component first, then expand to multiple components.
