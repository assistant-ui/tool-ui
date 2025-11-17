# Tool UI Patterns & Receipts Guide

This document outlines the patterns for creating interactive Tool UIs with receipt transformations in the Tool UI Playground.

## Overview

**Goal**: Create Tool UIs that transition from interactive mode → receipt mode, showing what the user selected without injecting fake messages.

**Key Principle**: Tool UIs are **stateless** - their mode (interactive vs receipt) is derived from the `result` prop, not component state.

---

## Architecture

### Frontend Tool Registration

Tools are defined using `makeAssistantTool` from `@assistant-ui/react` and mounted in the component tree. This differs from backend-only tools.

**File Structure:**
```
lib/playground/prototypes/waymo/
├── wip-tool-uis/
│   ├── FrequentLocationSelector.tsx  # UI Component
│   └── README.md
├── select-frequent-location-tool.tsx  # Tool + UI Definition
└── index.ts                           # Backend tool registry (legacy)
```

### Backend Integration

Frontend tools are automatically forwarded to the backend via `AssistantChatTransport` and merged with backend tools using the `frontendTools()` helper.

**Backend Flow:**
1. Client sends tool definitions in request body (`tools` field)
2. API route extracts `clientTools` from body
3. `frontendTools(clientTools)` converts to AI SDK format
4. Merged with prototype tools: `{ ...frontendTools(clientTools), ...prototypeTools }`
5. Model sees all tools and can call frontend tools

**Key Files:**
- `app/api/playground/chat/route.ts` - Extracts client tools
- `lib/playground/runtime.ts` - Merges frontend + backend tools

---

## Pattern: Interactive → Receipt Tool UI

### 1. Define the Tool with `makeAssistantTool`

**File**: `lib/playground/prototypes/waymo/select-frequent-location-tool.tsx`

```tsx
"use client";

import { makeAssistantTool } from "@assistant-ui/react";
import { z } from "zod";
import { FrequentLocationSelector } from "./wip-tool-uis/FrequentLocationSelector";

type FrequentLocation = {
  id: string;
  label: string;
  address: string;
  category: "favorite" | "recent";
};

type SelectFrequentLocationResult = {
  locations: FrequentLocation[];
  prompt: string;
  selectedLocation?: FrequentLocation;  // ← Key: optional field for receipt mode
};

export const SelectFrequentLocationTool = makeAssistantTool<
  Record<string, never>,  // Input args (empty for this tool)
  SelectFrequentLocationResult  // Result type
>({
  toolName: "select_frequent_location",
  description: "Present user's frequent locations when they request a ride without specifying a destination.",
  parameters: z.object({}),  // Empty params

  execute: async () => {
    // Return initial data (interactive mode)
    return {
      locations: [...favorites, ...recents],
      prompt: "Where would you like to go?",
      // selectedLocation is undefined here
    };
  },

  render: (props) => <FrequentLocationSelector {...props} />,
});
```

**Key Points:**
- Result type includes **optional** `selectedLocation` field
- `execute` returns data for interactive mode (no selection yet)
- `render` receives full props including `result` and `addResult`

---

### 2. Create the UI Component

**File**: `lib/playground/prototypes/waymo/wip-tool-uis/FrequentLocationSelector.tsx`

```tsx
"use client";

import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type SelectFrequentLocationResult = {
  locations: FrequentLocation[];
  prompt: string;
  selectedLocation?: FrequentLocation;
};

export const FrequentLocationSelector = ({
  result,
  addResult
}: ToolCallMessagePartProps<Record<string, never>, SelectFrequentLocationResult>) => {
  if (!result) return null;

  // RECEIPT MODE - Show what was selected
  if (result.selectedLocation) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <div className="font-semibold">{result.selectedLocation.label}</div>
            <div className="text-sm text-muted-foreground">
              {result.selectedLocation.address}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // INTERACTIVE MODE - Show clickable options
  const { locations, prompt } = result;

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">{prompt}</h3>

      {locations.map((location) => (
        <Button
          key={location.id}
          variant="outline"
          className="w-full"
          onClick={() => addResult({
            ...result,
            selectedLocation: location  // ← Add selection to result
          })}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">{location.label}</span>
            <span className="text-sm text-muted-foreground">
              {location.address}
            </span>
          </div>
        </Button>
      ))}
    </Card>
  );
};
```

**Key Points:**
- **Props**: Use `ToolCallMessagePartProps<TArgs, TResult>` type
- **Receipt Detection**: Check `if (result.selectedLocation)`
- **Transition**: `addResult({ ...result, selectedLocation: location })`
- **Stateless**: Mode derived from `result` prop, not `useState`

---

### 3. Mount the Tool Component

**File**: `app/playground/chat-pane.tsx`

```tsx
import { SelectFrequentLocationTool } from "@/lib/playground/prototypes/waymo/select-frequent-location-tool";

export const ChatPane = forwardRef<ChatPaneRef, ChatPaneProps>(({ prototype }, ref) => {
  const { slug } = prototype;
  // ... runtime setup ...

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {/* Mount Waymo-specific tools */}
      {slug === "waymo-booking" && <SelectFrequentLocationTool />}

      <ThreadPrimitive.Root>
        {/* ... chat UI ... */}
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
});
```

**Key Points:**
- Tool component must be inside `AssistantRuntimeProvider`
- Component returns `null` (doesn't render, just registers tool)
- Conditionally mount based on prototype slug

---

## Flow Diagram

```
User: "I need a ride"
       ↓
Model calls: select_frequent_location()
       ↓
execute() runs → Returns { locations: [...], prompt: "..." }
       ↓
UI renders (Interactive Mode)
  - result.selectedLocation is undefined
  - Shows clickable location buttons
       ↓
User clicks "Home"
       ↓
addResult({ ...result, selectedLocation: homeLocation })
       ↓
UI re-renders (Receipt Mode)
  - result.selectedLocation exists
  - Shows ✓ Home with checkmark
       ↓
Model automatically continues with selection data
```

---

## Key APIs

### `makeAssistantTool`

```tsx
makeAssistantTool<TArgs, TResult>({
  toolName: string,           // Must match tool name model uses
  description: string,        // Shown to model
  parameters: ZodSchema,      // Input validation
  execute: (args, context) => TResult | Promise<TResult>,
  render: (props: ToolCallMessagePartProps) => ReactNode
})
```

### `ToolCallMessagePartProps<TArgs, TResult>`

Available props in `render` function:

```tsx
{
  toolName: string,
  toolCallId: string,
  args: TArgs,                // Tool input arguments
  argsText: string,           // JSON string of args
  result: TResult | undefined, // Tool result (initial + updates)
  status: {
    type: "running" | "complete" | "incomplete" | "requires_action"
  },
  addResult: (result: TResult) => void,  // ← Key for receipts!
  artifact: unknown,
  isError: boolean | undefined
}
```

### `addResult()`

**Purpose**: Complete tool execution with a result and automatically continue the conversation.

**Usage**:
```tsx
onClick={() => addResult({
  ...result,        // Preserve initial data
  selectedField: value  // Add user's selection
})}
```

**Effects**:
- Tool status changes to "complete"
- `result` prop updates with new data
- Component re-renders (receipt mode)
- Model automatically continues with result data

---

## Backend Integration Details

### API Route Pattern

**File**: `app/api/playground/chat/route.ts`

```tsx
import { frontendTools } from "@assistant-ui/react-ai-sdk";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages = body.messages;
  const clientTools = body.tools;  // ← Frontend tools sent here

  const result = streamPrototypeResponse(prototype, messages, clientTools);
  return result.toUIMessageStreamResponse();
}
```

### Runtime Pattern

**File**: `lib/playground/runtime.ts`

```tsx
import { frontendTools } from "@assistant-ui/react-ai-sdk";

export const streamPrototypeResponse = (
  prototype: Prototype,
  messages: UIMessage[],
  clientTools?: unknown,
) => {
  const prototypeTools = buildToolSet(prototype);

  // Merge frontend + backend tools
  const tools = clientTools
    ? {
        ...(frontendTools(clientTools as any) as any),
        ...prototypeTools,
      }
    : prototypeTools;

  return streamText({
    model,
    system: prototype.systemPrompt,
    messages: convertToModelMessages(messages),
    tools,  // ← Combined toolset
    stopWhen: stepCountIs(100),
  });
};
```

---

## Alternative: Human-in-the-Loop Pattern

For multi-step wizards or when `execute` needs user input:

```tsx
export const MultiStepTool = makeAssistantTool({
  execute: async (args, { human }) => {
    // Step 1: Get user selection
    const selection = await human({
      type: "location_picker",
      locations: [...],
    });

    // Step 2: Use selection in further logic
    const validated = await validateLocation(selection);

    return { selection, validated };
  },

  render: ({ interrupt, resume }) => {
    if (interrupt) {
      // Interactive mode - user is making selection
      return <Picker
        data={interrupt.payload}
        onSelect={(loc) => resume(loc)}
      />;
    }
    // Receipt mode
    return <Receipt />;
  }
});
```

**When to use `context.human()` instead of `addResult`:**
- Multi-step flows (call `human()` multiple times)
- Execute function needs the user's selection
- Approval workflows
- Complex validation before proceeding

---

## System Prompt Guidelines

Update the system prompt to guide when the model should call the tool:

```typescript
export const WAYMO_SYSTEM_MESSAGE_V2 = `...

Tool Usage:
- When the user requests a ride WITHOUT specifying a destination
  (e.g., "I need a ride", "Book me a Waymo"), first call
  select_frequent_location to present their saved locations in a visual UI.
- If the user mentions a specific destination (e.g., "Take me home"),
  use get_user_destination instead.
` as const;
```

---

## Testing Checklist

- [ ] Tool appears in model's available tools
- [ ] Interactive UI renders when tool is called
- [ ] Clicking triggers `addResult`
- [ ] Receipt UI renders with selection
- [ ] Model continues conversation with selection data
- [ ] No duplicate/fake user messages injected
- [ ] Works after thread reset
- [ ] TypeScript compiles without errors

---

## Common Issues

### Tool not being called by model
- **Cause**: Frontend tools not forwarded to backend
- **Fix**: Verify `frontendTools()` is used in `runtime.ts` and `clientTools` extracted in API route

### UI shows fallback instead of custom component
- **Cause**: Tool component not mounted
- **Fix**: Ensure tool component is inside `AssistantRuntimeProvider`

### Receipt mode not showing
- **Cause**: `addResult` not updating the field checked for receipt mode
- **Fix**: Ensure you spread `...result` and add selection field

### Receipt state not persisting across page reloads ⚠️ IMPORTANT
- **Cause**: The default history adapter only persists on message append, not on tool result updates from `addResult()`
- **Symptoms**: Tool UI shows receipt after clicking, but reverts to interactive mode after page refresh
- **Fix**: Add a `ToolResultPersistence` component that surgically updates only tool call results in localStorage (without touching user messages):

```tsx
// Component to sync tool call results to localStorage
const ToolResultPersistence = ({ slug }: { slug: string }) => {
  const messages = useAssistantState(({ thread }) => thread.messages);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Only update assistant messages with tool calls in storage
    const repo = readThreadRepo(slug);
    let hasChanges = false;

    for (const runtimeMsg of messages) {
      if (runtimeMsg.role !== "assistant") continue;

      // Find this message in storage
      const storedMsgIndex = repo.messages.findIndex(
        (entry) => entry.message.id === runtimeMsg.id
      );

      if (storedMsgIndex === -1) continue;

      const storedMsg = repo.messages[storedMsgIndex].message;

      // Check if this is an assistant message with content parts
      if (
        storedMsg.role === "assistant" &&
        Array.isArray(storedMsg.content) &&
        Array.isArray(runtimeMsg.content)
      ) {
        // Update tool call results in the stored message
        for (let i = 0; i < runtimeMsg.content.length; i++) {
          const runtimePart = runtimeMsg.content[i];

          if (
            runtimePart &&
            typeof runtimePart === "object" &&
            "type" in runtimePart &&
            runtimePart.type === "tool-call" &&
            "result" in runtimePart
          ) {
            // Find corresponding part in stored message
            const storedPart = storedMsg.content[i];

            if (
              storedPart &&
              typeof storedPart === "object" &&
              "type" in storedPart &&
              storedPart.type === "tool-call" &&
              "result" in storedPart
            ) {
              // Update the result if it's changed
              if (JSON.stringify(storedPart.result) !== JSON.stringify(runtimePart.result)) {
                (storedPart as any).result = runtimePart.result;
                hasChanges = true;
              }
            }
          }
        }
      }
    }

    if (hasChanges) {
      writeThreadRepo(slug, repo);
    }
  }, [messages, slug]);

  return null;
};

// Mount inside AssistantRuntimeProvider:
<AssistantRuntimeProvider runtime={runtime}>
  <ToolResultPersistence slug={slug} />
  {/* rest of your UI */}
</AssistantRuntimeProvider>
```

### Type errors with `frontendTools`
- **Cause**: Type mismatch between frontend tool format and AI SDK ToolSet
- **Fix**: Use type assertions: `frontendTools(clientTools as any) as any`

---

## Future Considerations

- **Tool UI Library Promotion**: When a WIP Tool UI is stable, move it to main library
- **Reusable Patterns**: Extract common receipt patterns (selection, confirmation, multi-step)
- **Accessibility**: Add keyboard navigation, ARIA labels, focus management
- **Animation**: Smooth transitions between interactive → receipt modes
- **Mobile**: Test touch interactions, responsive sizing

---

## References

- [assistant-ui Tool Guide](https://www.assistant-ui.com/docs/guides/Tools)
- [makeAssistantTool API](https://www.assistant-ui.com/docs/copilots/make-assistant-tool)
- [AI SDK Integration](https://www.assistant-ui.com/docs/runtimes/ai-sdk/use-chat)
- [Human-in-the-Loop](https://www.assistant-ui.com/docs/runtimes/langgraph/tutorial/part-2)

---

**Last Updated**: 2025-01-17
**Pattern Status**: ✅ Tested & Working (Waymo FrequentLocationSelector)
