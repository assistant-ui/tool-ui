# Collaboration Guidelines for Coding Assistants

You are working in a Tool UI playground whose purpose is to build fast, convincing prototypes that show how LLMs + tools + rich UIs can make chat feel better than a standalone app.

These are *prototypes*, not production systems — but the interfaces and structure should be something we won't hate later.

**Follow these rules.**

---

## 1. Architecture: Three Layers Only

Every prototype (Waymo and future ones) must follow this structure:

### 1.1 Tools (`./tools` for that prototype)
- Functions that return typed data (often mocked)
- No React, no DOM, no UI concerns
- No direct knowledge of chat messages

### 1.2 Tool UIs / Components (`./components`)
- React components that only receive props and render UI
- No tool calls here, ever
- No async logic; callbacks are passed in from the demo/orchestrator

### 1.3 Demo / Orchestrator (e.g. `WaymoDemo.tsx`)
- Coordinates tools and Tool UIs
- Maintains chat messages state
- Decides when to call each tool
- Decides when to emit a ToolUIMessage for rendering

**Rule of thumb:** If you're about to call a tool from a component, stop and move that logic into the demo/orchestrator.

---

## 2. Tool Design Rules

### 2.1 Count and Shape

For each prototype:
- Use **3–5 tools max**
- Prefer "chunky" capabilities like:
  - `getContext` / `getRiderContext`
  - `getPickupLocation` / `resolveLocation`
  - `getQuote` / `getOptions`
  - `book` / `placeOrder`
  - `getStatus` (optional)

Do not create a new tool for every conversational step ("ask_for_x", etc.).

### 2.2 Implementation
- Tools are pure (mock) functions that:
  - Return promises of typed data
  - Use hard-coded or lightly randomized data
  - Never call external APIs
- Shared domain types live in `./types` (or a shared domain file) and should be reused:
  - e.g. `Location`, `PaymentMethod`, `RideQuote`, `BookedTrip`, etc.

If you need a richer shape, extend the shared types rather than inventing ad-hoc types inside a tool.

---

## 3. Tool UIs: Components, Not Mini-apps

Some prototypes (like the Waymo FrequentLocationSelector) register Tool UIs as frontend tools using `makeAssistantTool` from `@assistant-ui/react`. In those cases, the same rules apply—tools stay pure, Tool UIs are dumb React components, and the orchestrator decides when to call tools—but `assistant-ui` handles the tool-call message wiring for you. See `lib/playground/prototypes/waymo/wip-tool-uis/TOOL-UI-PATTERNS.md` for the detailed interactive → receipt pattern.

### 3.1 Tool UI Message Format

For prototypes that render Tool UIs via a custom `ToolUIMessage` envelope (instead of `makeAssistantTool`), assistant messages that render UI must look like this:

```typescript
type ToolUIComponentName =
  | "RideQuote"
  | "BookingConfirmation"
  // add others for new prototypes

interface ToolUIMessage {
  type: "tool-ui";
  component: ToolUIComponentName;
  props: Record<string, any>; // TS interfaces define the real shape
}
```

- `type` is always `"tool-ui"`
- `component` is a stable PascalCase string
- `props` is passed directly to the React component

**Do not change this shape.** Extend via props/interfaces instead.

### 3.2 Component Responsibilities

Each Tool UI component:
- Receives typed props (imported from `./types`)
- Renders UI based on props
- Calls callbacks (`onConfirm`, `onChange`, etc.) passed from the demo/orchestrator

It must not:
- Call tools
- Manage global state
- Know about the chat message list

Example from Waymo:
```tsx
<RideQuote
  {...toolUI.props}
  onConfirm={handleConfirmRide}
/>
```

We use the component name to select the React component, then spread props and attach callbacks.

### 3.3 State Model (v0)

For now, we support a minimal state model:

```typescript
type ToolUIState = "interactive" | "receipt";
// "loading" | "error" can be added later
```

- `interactive`: user can make a choice or confirm
- `receipt`: read-only summary of a completed action

In v0, it's fine if components only use these two states. Design your props so loading/error could be added later without breaking everything.

---

## 4. Chat & Orchestration Rules

The orchestrator (e.g. `WaymoDemo`) is the single place where:
- Tools are called
- Messages are appended
- Tool UIs are chosen and inserted into the message list

Pattern to follow (Waymo-style):

```typescript
interface Message {
  role: "user" | "assistant";
  content: string | ToolUIMessage;
}
```

- **User messages:** content is a plain string
- **Assistant messages:**
  - Text: content is a string
  - Tool UI: content is a ToolUIMessage

Rendering pattern:

```typescript
if (typeof message.content === "string") {
  // render text bubble
} else {
  const toolUI = message.content as ToolUIMessage;
  switch (toolUI.component) {
    case "RideQuote":
      return <RideQuote {...toolUI.props} onConfirm={handleConfirmRide} />;
    case "BookingConfirmation":
      return <BookingConfirmation {...toolUI.props} />;
    // etc.
  }
}
```

If you add a new component, extend this switch; keep the shape consistent.

---

## 5. Flow Rules (Per Prototype)

Each prototype should have at least:

### 5.1 Golden Path

One clean, fully working "hero" flow, similar to:

1. Seed a user intent (button that simulates "I need a ride home" or similar)
2. Orchestrator calls 2–3 tools in sequence
3. Assistant sends:
   - One or more text bubbles
   - A primary Tool UI for decision (e.g. RideQuote)
4. User clicks the main CTA
5. Orchestrator calls the "action" tool (e.g. bookTrip)
6. Assistant sends:
   - Updated Tool UI in receipt mode (same component)
   - A confirmation Tool UI (e.g. BookingConfirmation)

**All changes must keep this golden path intact.** If you break it, fix it.

### 5.2 Optional "Friction" Path

Once the golden path is solid, you may add one extra path per prototype, such as:
- Missing context (no saved address, no default payment)
- A simple clarifying question

Use the same tools and Tool UIs where possible. Don't introduce new tools/components just for a tiny detour unless explicitly asked.

---

## 6. Do / Don't Summary

### Do:
- Reuse the existing structure from `WaymoDemo.tsx` when adding new prototypes
- Keep tools small in number and large in scope
- Extend TypeScript types in `./types` when you need richer data
- Keep Tool UIs dumb and declarative: props in, JSX out
- Add callbacks to Tool UIs and wire them in the orchestrator

### Don't:
- Call tools from React components
- Change the ToolUIMessage envelope (type, component, props shape)
- Add more than 3–5 tools per prototype without a very good reason
- Introduce heavy state management (Redux, MobX, etc.)
- Add real network or external dependencies; keep tools mocked

---

## If you're an LLM modifying this repo and you're unsure:

**Prefer the simplest change that preserves:**
1. The three-layer architecture
2. The Tool UI message format
3. The golden path flow