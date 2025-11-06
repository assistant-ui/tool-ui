# DecisionPrompt Component

A flexible, inline component for presenting decisions and action choices to users. Designed specifically for tool result actions in conversation UIs, with support for binary decisions, multi-choice selection, destructive confirmations, and async operations.

## Features

- **Inline-only design** - No modals or dialogs, keeps users in the conversation flow
- **Two-stage destructive actions** - Automatic "confirm" pattern for dangerous operations
- **Receipt state** - Shows what action was taken for conversation history
- **Async support** - Loading states and disabled states during execution
- **Keyboard navigation** - Escape to cancel confirmations, full keyboard support
- **Flexible styling** - Customizable alignment, variants, icons

## Basic Usage

```tsx
import { DecisionPrompt } from "@/components/decision-prompt";

function MyComponent() {
  const [selectedAction, setSelectedAction] = useState<string>();

  return (
    <DecisionPrompt
      prompt="Do you want to send the email?"
      selectedAction={selectedAction}
      actions={[
        { id: "cancel", label: "Nevermind", variant: "ghost" },
        { id: "send", label: "Yes, send", variant: "default" },
      ]}
      onAction={(actionId) => {
        setSelectedAction(actionId);
        // Handle the action
      }}
    />
  );
}
```

## Props

### `prompt` (required)
The question or prompt to display to the user.

```tsx
<DecisionPrompt prompt="Delete 12 files?" />
```

### `actions` (required)
Array of actions the user can choose from. Each action has:

- `id` (required): Unique identifier
- `label` (required): Display text
- `confirmLabel` (optional): Label shown in two-stage confirmation
- `variant` (optional): `"default" | "destructive" | "secondary" | "ghost"`
- `icon` (optional): React element to display before label
- `loading` (optional): Shows loading spinner
- `disabled` (optional): Disables the action
- `shortcut` (optional): Keyboard shortcut hint

```tsx
actions={[
  {
    id: "delete",
    label: "Delete",
    confirmLabel: "Confirm delete",
    variant: "destructive",
    icon: <Trash2 className="h-4 w-4" />
  }
]}
```

### `selectedAction` (optional)
The ID of the action that was selected. When set, the component displays the receipt state instead of action buttons.

```tsx
<DecisionPrompt
  prompt="Send email?"
  actions={[...]}
  selectedAction="send"  // Shows receipt: ✓ Yes, send
/>
```

### `description` (optional)
Additional context or description below the prompt.

```tsx
<DecisionPrompt
  prompt="Delete 12 files?"
  description="This action cannot be undone"
  actions={[...]}
/>
```

### `onAction` (optional)
Callback fired when user selects an action. For two-stage actions, this fires only after confirmation.

```tsx
onAction={async (actionId) => {
  if (actionId === "send") {
    await sendEmail();
  }
  setSelectedAction(actionId);
}}
```

### `onBeforeAction` (optional)
Callback fired before action executes. Return `false` or `Promise<false>` to prevent the action.

```tsx
onBeforeAction={async (actionId) => {
  if (actionId === "delete") {
    const hasPermission = await checkPermission();
    if (!hasPermission) {
      alert("You don't have permission");
      return false;
    }
  }
  return true;
}}
```

### `confirmTimeout` (optional)
Timeout in milliseconds for two-stage confirmations to auto-reset. Default: `3000` (3 seconds).

```tsx
<DecisionPrompt
  confirmTimeout={5000}  // 5 second timeout
  actions={[...]}
/>
```

### `align` (optional)
Alignment of action buttons: `"left" | "center" | "right"`. Default: `"right"`.

```tsx
<DecisionPrompt align="center" actions={[...]} />
```

### `className` (optional)
Additional CSS classes for the container.

## Use Cases

### Binary Decision
Simple yes/no or confirm/cancel choices.

```tsx
<DecisionPrompt
  prompt="Do you want to send the email?"
  description="This will notify all 15 participants"
  actions={[
    { id: "cancel", label: "Nevermind", variant: "ghost" },
    { id: "send", label: "Yes, send", variant: "default" },
  ]}
  onAction={(actionId) => {
    if (actionId === "send") {
      sendEmail();
    }
  }}
/>
```

### Multi-Choice Selection
Choose from 3+ options.

```tsx
<DecisionPrompt
  prompt="Choose export format"
  actions={[
    { id: "csv", label: "CSV", variant: "secondary" },
    { id: "json", label: "JSON", variant: "secondary" },
    { id: "excel", label: "Excel", variant: "secondary" },
  ]}
  onAction={(actionId) => {
    exportData(actionId);
  }}
  align="center"
/>
```

### Destructive Action (Two-Stage)
Automatic confirmation pattern for dangerous operations.

```tsx
<DecisionPrompt
  prompt="Delete 12 files?"
  description="This action cannot be undone"
  actions={[
    { id: "cancel", label: "Cancel", variant: "ghost" },
    {
      id: "delete",
      label: "Delete",
      confirmLabel: "Confirm delete",  // Triggers two-stage pattern
      variant: "destructive",
    },
  ]}
  onAction={(actionId) => {
    if (actionId === "delete") {
      deleteFiles();
    }
  }}
  confirmTimeout={5000}  // 5 second timeout before reset
/>
```

**Two-stage flow:**
1. User clicks "Delete" → button changes to "Confirm delete" (red, pulsing)
2. User clicks "Confirm delete" → `onAction` fires
3. If user doesn't click within timeout → resets to "Delete"
4. User presses Escape → resets to "Delete"

### Async with Loading
Show loading state during async operations.

```tsx
<DecisionPrompt
  prompt="Install 3 packages?"
  description="npm, lodash, and react-icons"
  actions={[
    { id: "no", label: "No", variant: "ghost" },
    { id: "install", label: "Yes, install", variant: "default" },
  ]}
  onAction={async (actionId) => {
    if (actionId === "install") {
      await installPackages();  // Shows loading spinner automatically
    }
  }}
/>
```

### With Validation
Prevent actions based on runtime conditions.

```tsx
<DecisionPrompt
  prompt="Deploy to production?"
  actions={[
    { id: "cancel", label: "Cancel", variant: "ghost" },
    { id: "deploy", label: "Deploy", variant: "default" },
  ]}
  onBeforeAction={async (actionId) => {
    if (actionId === "deploy") {
      const canDeploy = await checkDeploymentPermission();
      if (!canDeploy) {
        alert("You don't have permission to deploy");
        return false;  // Prevents action
      }
    }
    return true;
  }}
  onAction={(actionId) => {
    deployToProduction();
  }}
/>
```

## Integration with Conversation System

The component is designed to work with conversation/message systems that persist state:

```tsx
// Message data structure
interface Message {
  id: string;
  type: "decision-prompt";
  data: {
    prompt: string;
    actions: DecisionPromptAction[];
    selectedAction?: string;  // Set when user makes choice
  };
}

// Render message
function MessageRenderer({ message }: { message: Message }) {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <DecisionPrompt
      prompt={message.data.prompt}
      actions={message.data.actions}
      selectedAction={message.data.selectedAction}
      onAction={(actionId) => {
        // Update message with selected action
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, data: { ...msg.data, selectedAction: actionId } }
              : msg
          )
        );
      }}
    />
  );
}
```

## Styling

The component uses Tailwind CSS and follows the existing design system:

- Uses `border`, `bg-card`, `text-card-foreground` for consistent theming
- Receipt state uses `bg-muted/30` for visual distinction
- Destructive confirmations show `animate-pulse` and `ring-2 ring-destructive`
- Fully responsive with mobile-first design

## Accessibility

- Keyboard navigation with Tab/Shift+Tab
- Escape key cancels two-stage confirmations
- ARIA labels include keyboard shortcuts
- Loading states announced to screen readers
- Focus management during state transitions

## TypeScript

Full TypeScript support with Zod validation:

```tsx
import type { DecisionPromptAction, DecisionPromptProps } from "@/components/decision-prompt";

// For message persistence (without functions)
import type { SerializableDecisionPrompt } from "@/components/decision-prompt";
```

## Examples

See `example.tsx` for comprehensive examples of all use cases.
