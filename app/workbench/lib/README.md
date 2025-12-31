# Workbench

Development environment for testing ChatGPT widget UIs. Simulates the OpenAI Apps SDK locally.

## SDK Hooks

Import from `@/lib/workbench/openai-context`:

### Globals

| Hook | Type | Description |
|------|------|-------------|
| `useTheme()` | `"light" \| "dark"` | Current theme |
| `useLocale()` | `string` | User locale |
| `useDisplayMode()` | `"inline" \| "pip" \| "fullscreen"` | Display mode |
| `useToolInput()` | `object` | Widget input props |
| `useWidgetState()` | `[state, setState]` | Persistent state |

### Methods

| Hook | Description |
|------|-------------|
| `useCallTool()` | Invoke MCP tool |
| `useRequestDisplayMode()` | Change display mode |
| `useSendFollowUpMessage()` | Send message to ChatGPT |
| `useOpenExternal()` | Open URL |
| `useUploadFile()` | Upload file |

## Example

```tsx
import {
  useCallTool,
  useWidgetState,
  useDisplayMode,
} from "@/lib/workbench/openai-context";

function MyWidget() {
  const callTool = useCallTool();
  const [state, setState] = useWidgetState({ count: 0 });
  const displayMode = useDisplayMode();

  const handleClick = async () => {
    await callTool("my_tool", { count: state.count });
    setState({ count: state.count + 1 });
  };

  return <button onClick={handleClick}>Count: {state.count}</button>;
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + D` | Toggle theme |
| `Cmd/Ctrl + Shift + F` | Toggle fullscreen |
| `Cmd/Ctrl + K` | Clear console |

## Creating Widgets

See `components/examples/poi-map/` for a complete example.

```
components/examples/my-widget/
  index.tsx         # Exports
  my-widget.tsx     # Main component
  schema.ts         # Zod schema

lib/workbench/wrappers/
  my-widget-sdk.tsx # SDK wrapper
```
