# Waymo Prototype (v0)

A reference implementation of Tool UIs for ride booking that follows the [Collaboration Guidelines](../../../../COLLAB_GUIDELINES.md).

## Quick Start

Navigate to `/playground/waymo-demo` to test the golden path:
1. Click "Start Demo: 'I need a ride home'"
2. See ride quote card
3. Click "Confirm Ride"
4. See booking confirmation

## Architecture

This prototype strictly follows the three-layer architecture:

### 1. Tools (`tools.ts`)
4 pure functions that return typed mock data:
- `getRiderContext()` - Returns user's home, work, payment methods
- `getPickupLocation({ hint })` - Returns pickup location with confidence
- `getQuote({ pickup, dropoff })` - Returns ride quote with price/ETA
- `bookTrip({ quoteId, paymentMethodId? })` - Books ride and returns confirmation

### 2. Tool UIs (`components/`)
2 React components that only render:
- `RideQuote` - Interactive (confirm button) → Receipt (confirmed state)
- `BookingConfirmation` - Receipt only (trip details + actions)

### 3. Orchestrator (`WaymoDemo.tsx`)
Manages the entire flow:
- Calls tools in sequence
- Updates message state
- Decides when to show Tool UIs
- Handles user interactions

## File Structure

```
waymo/
├── types.ts                    # Shared domain types
├── tools.ts                    # 4 core tools (mock data)
├── components/
│   ├── RideQuote.tsx          # Interactive → Receipt UI
│   ├── BookingConfirmation.tsx # Receipt UI
│   └── index.tsx              # Exports
├── WaymoDemo.tsx              # Orchestrator
├── README.md                  # This file
└── index.tsx                  # Main export
```

## Tool UI Message Format

```typescript
interface ToolUIMessage {
  type: "tool-ui";
  component: "RideQuote" | "BookingConfirmation";
  props: RideQuoteProps | BookingConfirmationProps;
}
```

## Golden Path Flow

1. **User**: "I need a ride home"
2. **Silent tools**: `getRiderContext` → `getPickupLocation` → `getQuote`
3. **Show**: Text + RideQuote UI (interactive)
4. **User clicks**: "Confirm Ride"
5. **Call**: `bookTrip`
6. **Update**: RideQuote → receipt, add BookingConfirmation

## Guidelines Compliance

This prototype demonstrates:
- ✅ **3-layer architecture** - Tools, UI components, orchestrator
- ✅ **4 tools only** - Chunky capabilities, not conversational steps
- ✅ **2 Tool UIs** - Minimal set for golden path
- ✅ **Standard message format** - Consistent ToolUIMessage shape
- ✅ **No tool calls in components** - All async logic in orchestrator
- ✅ **Typed domain objects** - Shared types in `types.ts`

## Extending

To add a friction variant (after golden path works):
1. Keep the same 4 tools
2. Reuse existing Tool UIs
3. Add branch logic in `WaymoDemo.tsx`
4. Test that golden path still works

## Important

**Do not:**
- Add more tools (stay at 4)
- Call tools from components
- Change ToolUIMessage format
- Break the golden path

**Always refer to [COLLAB_GUIDELINES.md](../../../../COLLAB_GUIDELINES.md) before making changes.**