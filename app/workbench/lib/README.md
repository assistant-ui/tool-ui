# Workbench

A development environment for building and testing ChatGPT widget UIs. The workbench simulates the OpenAI Apps SDK `window.openai` API, allowing you to develop widgets locally before deploying to ChatGPT.

## Quick Start

```tsx
import { OpenAIProvider } from "@/app/workbench/lib/openai-context";
import { WorkbenchShell } from "@/app/workbench/components";

function App() {
  return (
    <OpenAIProvider>
      <WorkbenchShell />
    </OpenAIProvider>
  );
}
```

## SDK Simulation

The workbench provides a complete simulation of the OpenAI Apps SDK. All API calls are logged to the console panel for debugging.

### Globals

Access these via hooks from `@/app/workbench/lib/openai-context`:

| Global        | Hook                           | Type                                | Description                     |
| ------------- | ------------------------------ | ----------------------------------- | ------------------------------- |
| `theme`       | `useTheme()`                   | `"light" \| "dark"`                 | Current color scheme            |
| `locale`      | `useLocale()`                  | `string`                            | User's locale (e.g., "en-US")   |
| `displayMode` | `useDisplayMode()`             | `"inline" \| "pip" \| "fullscreen"` | Widget display mode             |
| `maxHeight`   | `useOpenAiGlobal("maxHeight")` | `number`                            | Max height in inline mode (px)  |
| `toolInput`   | `useToolInput()`               | `object`                            | Input props passed to widget    |
| `toolOutput`  | `useToolOutput()`              | `object \| null`                    | Current tool output             |
| `widgetState` | `useWidgetState()`             | `object`                            | Persistent widget state         |
| `safeArea`    | `useOpenAiGlobal("safeArea")`  | `SafeAreaInsets`                    | Safe area insets for fullscreen |
| `view`        | `useView()`                    | `View \| null`                      | Current view (modal/inline)     |

### Methods

| Method                            | Hook                       | Description                       |
| --------------------------------- | -------------------------- | --------------------------------- |
| `callTool(name, args)`            | `useCallTool()`            | Invoke an MCP tool                |
| `setWidgetState(state)`           | `useWidgetState()[1]`      | Update persistent state           |
| `requestDisplayMode({ mode })`    | `useRequestDisplayMode()`  | Request display mode change       |
| `sendFollowUpMessage({ prompt })` | `useSendFollowUpMessage()` | Send follow-up to ChatGPT         |
| `openExternal({ href })`          | `useOpenExternal()`        | Open URL in new tab               |
| `requestModal({ title, params })` | `useOpenAI().requestModal` | Show modal overlay                |
| `uploadFile(file)`                | `useUploadFile()`          | Upload file, returns `{ fileId }` |
| `getFileDownloadUrl({ fileId })`  | `useGetFileDownloadUrl()`  | Get download URL for file         |

### Example: Using SDK Methods

```tsx
import {
  useCallTool,
  useWidgetState,
  useRequestDisplayMode,
  useSendFollowUpMessage,
  useOpenExternal,
} from "@/app/workbench/lib/openai-context";

function MyWidget() {
  const callTool = useCallTool();
  const [state, setState] = useWidgetState({ count: 0 });
  const requestDisplayMode = useRequestDisplayMode();
  const sendFollowUpMessage = useSendFollowUpMessage();
  const openExternal = useOpenExternal();

  const handleAction = async () => {
    // Call an MCP tool
    const result = await callTool("my_tool", { param: "value" });

    // Update widget state (persists across renders)
    setState({ count: state.count + 1 });

    // Request fullscreen mode
    await requestDisplayMode({ mode: "fullscreen" });

    // Send a follow-up message to ChatGPT
    await sendFollowUpMessage({ prompt: "Tell me more about this" });

    // Open external link
    openExternal({ href: "https://example.com" });
  };

  return <button onClick={handleAction}>Do Action</button>;
}
```

## Keyboard Shortcuts

| Shortcut             | Action                  |
| -------------------- | ----------------------- |
| `⌘/Ctrl + Shift + D` | Toggle dark/light theme |
| `⌘/Ctrl + Shift + F` | Toggle fullscreen mode  |
| `⌘/Ctrl + K`         | Clear console           |

## Config Panel

The right sidebar provides controls for:

- **Device**: Desktop, Tablet, Mobile viewport simulation
- **Mode**: Inline, PiP, Fullscreen display modes
- **Max Height**: Inline mode height constraint (100-2000px)
- **Safe Area**: Fullscreen safe area insets
- **Theme**: Light/Dark mode toggle
- **Locale**: Language/region selection
- **View**: Current view state (modal/inline)

## Creating a Widget

Widgets are React components that use SDK hooks. See `components/tool-ui/poi-map/` for a complete example.

### File Structure

```
components/tool-ui/my-widget/
  index.tsx          # Barrel exports
  my-widget.tsx      # Main component (SDK-agnostic)
  schema.ts          # Zod schema for props
  _adapter.tsx       # UI primitive re-exports

app/workbench/lib/wrappers/
  my-widget-sdk.tsx  # SDK wrapper component
```

### SDK Wrapper Pattern

The SDK wrapper bridges the SDK context to your presentational component:

```tsx
// app/workbench/lib/wrappers/my-widget-sdk.tsx
import { MyWidget } from "@/components/tool-ui/my-widget";
import {
  useWidgetState,
  useDisplayMode,
  useTheme,
  useCallTool,
} from "../openai-context";

export function MyWidgetSDK(props: Record<string, unknown>) {
  const [widgetState, setWidgetState] = useWidgetState(DEFAULT_STATE);
  const displayMode = useDisplayMode();
  const theme = useTheme();
  const callTool = useCallTool();

  const handleAction = async () => {
    await callTool("my_action", { data: widgetState });
  };

  return (
    <MyWidget
      {...props}
      displayMode={displayMode}
      theme={theme}
      widgetState={widgetState}
      onStateChange={setWidgetState}
      onAction={handleAction}
    />
  );
}
```

## Architecture

```
app/workbench/lib/
  openai-context.tsx   # SDK simulation via React Context
  store.ts             # Zustand store for workbench state
  types.ts             # TypeScript types
  file-store.ts        # In-memory file storage simulation
  component-registry.tsx # Widget registry
  wrappers/            # SDK wrapper components

app/workbench/components/
  workbench-shell.tsx  # Main shell layout
  config-panel.tsx     # Settings sidebar
  unified-workspace.tsx # Widget preview area
  inspector-panel.tsx  # Console/state inspector
  event-console.tsx    # SDK call log
```

## Console Panel

The bottom panel shows:

- **All**: All SDK interactions
- **Tool Calls**: `callTool` invocations and responses
- **State**: `setWidgetState` updates
- **Display**: `requestDisplayMode` transitions
- **Other**: `openExternal`, `sendFollowUpMessage`, etc.

Each entry shows:

- Method name and arguments
- Timestamp
- Expandable JSON for complex data
- Copy button for entries
