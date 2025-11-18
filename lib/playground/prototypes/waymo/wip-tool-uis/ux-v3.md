# Waymo Tool UI Library Design (v3)

## Goal
Build a **library-grade** Tool UI system for LLM assistants, using Waymo as the demo vertical.

**Key principles:**
- Tool UIs are reusable primitives with 4 states (loading/interactive/receipt/error)
- Clean separation: tools return data, UIs take presentation props
- Explicit protocol for how LLMs invoke UIs
- First-class support for correction and failure recovery

---

## The Tool UI Protocol

### How LLMs Request Tool UIs

The assistant returns structured messages that the host interprets:

```typescript
interface ToolUIMessage {
  type: "tool_ui";
  component: string;           // "RideQuote", "TripStatusTracker", etc
  props: Record<string, any>;  // Presentation-layer props
  state: ToolUIState;          // "loading" | "interactive" | "receipt" | "error"
  toolCallId?: string;         // Links to underlying tool call
}

// Assistant message format
{
  role: "assistant",
  content: [
    { type: "text", text: "I can get you home from Downtown Coffee." },
    {
      type: "tool_ui",
      component: "RideQuote",
      state: "interactive",
      props: { /* presentation props */ }
    }
  ]
}
```

### Tool → UI Mapping

Each tool has a default UI component and prop mapper:

```typescript
const toolUIRegistry = {
  "rides.get_quote": {
    component: "RideQuote",
    mapProps: (toolResult: Quote) => RideQuoteProps
  },
  "rides.book_trip": {
    component: "BookingConfirmation",
    mapProps: (toolResult: BookedTrip) => BookingConfirmationProps
  },
  "rides.get_trip_status": {
    component: "TripStatusTracker",
    mapProps: (toolResult: TripStatus) => TripStatusTrackerProps
  }
}
```

---

## Universal Tool UI States

**Every Tool UI component must handle 4 states:**

```typescript
type ToolUIState = "loading" | "interactive" | "receipt" | "error";

interface BaseToolUIProps {
  state: ToolUIState;
  errorMessage?: string;
  onRetry?: () => void;
}
```

### State Behaviors

1. **loading** - Tool call in progress
   - Show skeleton/shimmer
   - Disable interactions
   - Indicate "thinking"

2. **interactive** - Ready for user action
   - Full UI rendered
   - Buttons/inputs enabled
   - Clear CTAs

3. **receipt** - Action completed
   - Collapsed summary
   - Shows what was selected
   - May have edit affordances

4. **error** - Tool failed
   - Clear error message
   - Retry option if applicable
   - Graceful degradation

---

## v3 Tool Contracts

### Core Tools (Tier 0)

#### 1. `rides.get_rider_context`

**Output with error handling:**
```typescript
{
  home: Location | null,
  work: Location | null,
  frequent_destinations: Location[],
  recent_destinations: Location[],
  payment: {
    default_method: PaymentMethod | null,
    methods: PaymentMethod[],
    error?: "unavailable" | "not_configured"
  },
  flags: {
    has_multiple_payment_methods: boolean,
    is_new_rider: boolean
  }
}
```

---

#### 2. `rides.get_pickup_location`

**Output with source tracking:**
```typescript
{
  resolved_location: {
    address: string,
    lat: number,
    lng: number,
    name: string
  },
  confidence: "high" | "medium" | "low",
  source: "gps" | "user_search" | "user_adjusted" | "fallback",
  nearby_landmarks?: string[],
  error?: "gps_unavailable" | "location_services_off"
}
```

---

#### 3. `rides.get_quote`

**Output with expiry and metadata:**
```typescript
{
  quote_id: string,
  eta_minutes: number,
  price: {
    amount: number,
    currency: string,
    is_estimate: boolean,
    surge_multiplier?: number,
    expires_at: string  // ISO8601
  },
  pickup: Location,
  dropoff: Location,
  vehicle_info: {
    type: "Waymo One",
    capacity: number
  },
  meta: {
    reason_estimate?: "surge" | "traffic" | "distance",
    message?: string  // "Price may change due to high demand"
  }
}
```

---

#### 4. `rides.book_trip`

**Output with failure cases:**
```typescript
{
  success: boolean,
  trip_id?: string,
  status: "requested" | "failed",
  failure_reason?: "quote_expired" | "price_changed" | "payment_failed" | "no_vehicles",
  updated_quote?: Quote,  // When price changed
  trip?: {
    pickup: Location,
    dropoff: Location,
    eta_minutes: number,
    price: Price,
    payment_summary: string,
    vehicle?: Vehicle
  }
}
```

---

#### 5. `rides.get_trip_status`

**Output with progress tracking:**
```typescript
{
  trip_id: string,
  status: "searching" | "assigned" | "en_route" | "arrived" | "in_trip" | "completed" | "canceled",
  progress_percent?: number,  // 0-100 for en_route/in_trip
  eta_minutes?: number,
  timestamps: {
    requested_at: string,
    assigned_at?: string,
    pickup_arrival_at?: string,
    trip_start_at?: string,
    completed_at?: string
  },
  vehicle?: {
    make: string,
    model: string,
    color: string,
    plate: string,
    driver_name?: string,
    current_location?: { lat: number, lng: number }
  },
  next_actions: string[],
  cancel_reason?: string  // If canceled
}
```

---

## Library-Grade Tool UI Components

### Base Primitives (Generic)

#### 1. LoadingCard
```typescript
interface LoadingCardProps {
  lines?: number;  // Number of skeleton lines
  showImage?: boolean;
  message?: string;  // "Getting your quote..."
}
```

#### 2. ErrorCard
```typescript
interface ErrorCardProps {
  message: string;
  detail?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

#### 3. OptionCardSelector
```typescript
interface OptionCardSelectorProps extends BaseToolUIProps {
  options: Array<{
    id: string;
    title: string;
    subtitle?: string;
    primaryMetric?: string;
    secondaryMetric?: string;
    badge?: string;
    disabled?: boolean;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  layout?: "horizontal" | "grid";
}
```

#### 4. TimelineStatusCard
```typescript
interface TimelineStatusCardProps extends BaseToolUIProps {
  steps: Array<{
    id: string;
    label: string;
    status: "pending" | "active" | "completed" | "error";
    timestamp?: string;
    description?: string;
  }>;
  currentStepId?: string;
}
```

---

### Waymo-Specific Components (Built on Primitives)

#### 1. RideQuote (Hero Component)

**Presentation-focused props (decoupled from Quote):**
```typescript
interface RideQuoteProps extends BaseToolUIProps {
  // Display data
  routeLabel: string;          // "Downtown Coffee → 123 Main St"
  etaLabel: string;            // "Arrives in 5 minutes"
  priceLabel: string;          // "$12.50"
  priceBadge?: string;         // "Estimate" | "Surge pricing"
  vehicleLabel?: string;       // "Waymo One"
  expiresLabel?: string;       // "Price valid for 2 minutes"
  paymentSummary?: string;     // "Apple Pay (...4242)"

  // Actions
  onConfirm?: () => void;
  onEditPickup?: () => void;
  onEditDropoff?: () => void;
  onChangePayment?: () => void;
}
```

**State behaviors:**
- **loading**: Skeleton with route, shimmer for price/ETA
- **interactive**: Full card with Confirm button
- **receipt**: "✓ Ride confirmed" with summary
- **error**: "Couldn't get quote" with retry

---

#### 2. TripStatusTracker (The Wow Factor)

**Presentation-focused props:**
```typescript
interface TripStatusTrackerProps extends BaseToolUIProps {
  tripId: string;
  currentStatus: string;
  statusLabel: string;         // "Vehicle on the way"
  progressPercent?: number;    // For progress bar
  etaLabel?: string;           // "3 minutes away"

  timeline: Array<{
    step: string;
    label: string;
    status: "pending" | "active" | "completed";
    timestamp?: string;
  }>;

  vehicleInfo?: {
    description: string;      // "White Jaguar I-PACE"
    plate: string;
    imageUrl?: string;
  };

  mapUrl?: string;

  // Actions based on current state
  actions?: Array<{
    label: string;
    action: "cancel" | "find_car" | "contact" | "share";
    onClick: () => void;
  }>;
}
```

**State behaviors:**
- **loading**: Skeleton timeline
- **interactive**: Live timeline with actions
- **receipt**: Completed trip summary
- **error**: "Can't load trip status" with retry

---

#### 3. PickupConfirmCard

**Props:**
```typescript
interface PickupConfirmCardProps extends BaseToolUIProps {
  addressLabel: string;
  confidenceBadge?: "High" | "Medium" | "Low";
  nearbyContext?: string;      // "Near City Hall, Metro Station"
  mapThumbnailUrl?: string;

  onConfirm?: () => void;
  onChangeLocation?: () => void;
  onUseCurrentLocation?: () => void;
}
```

---

#### 4. BookingConfirmation

**Props:**
```typescript
interface BookingConfirmationProps extends BaseToolUIProps {
  title: string;               // "Your Waymo is on the way!"
  routeLabel: string;
  etaLabel: string;
  priceLabel: string;
  paymentLabel: string;
  tripId: string;

  onTrackRide?: () => void;
  onShareTrip?: () => void;
  onCancelRide?: () => void;
  onChangePayment?: () => void;
}
```

---

## Correction & Recovery Flows

### Post-Decision Edits

Every interactive Tool UI should support correction via callbacks:

```typescript
// RideQuote correction flow
User: "Actually, pick me up at the back entrance"
→ RideQuote.onEditPickup() triggered
→ Show PickupConfirmCard
→ User adjusts location
→ Call rides.get_quote with new pickup
→ Re-render RideQuote with updated data

// BookingConfirmation correction flow
User: "Use my business card instead"
→ BookingConfirmation.onChangePayment() triggered
→ Show PaymentMethodPicker
→ User selects different payment
→ Update payment in backend
→ Re-render confirmation
```

### Failure Recovery

Handle common failures gracefully:

```typescript
// Quote expired
rides.book_trip returns {
  success: false,
  failure_reason: "quote_expired",
  updated_quote: { /* new quote */ }
}
→ Re-render RideQuote with:
  - "Price updated" badge
  - New price highlighted
  - Auto-focused Confirm button

// Payment failed
rides.book_trip returns {
  success: false,
  failure_reason: "payment_failed"
}
→ Show ErrorCard: "Payment failed"
→ Trigger PaymentMethodPicker
→ Retry booking with new payment
```

---

## Demo Implementation Priority

### Phase 0: Foundation (Day 1-2)
**Goal:** Tool UI protocol and base components

1. **Define protocol:**
   - ToolUIMessage format
   - Tool → UI registry
   - Props mapping functions

2. **Build base components:**
   - LoadingCard
   - ErrorCard
   - BaseToolUIProps implementation

3. **Implement state machine:**
   - 4-state handling in all components
   - State transition animations

---

### Phase 1: Golden Path (Day 3-4)
**Goal:** Perfect "I need a ride home" → 1 click flow

**Tools:**
- rides.get_rider_context
- rides.get_pickup_location
- rides.get_quote
- rides.book_trip

**Tool UIs:**
- RideQuote (all 4 states)
- BookingConfirmation
- TripStatusTracker (basic)

**Demo:**
1. User: "I need a ride home"
2. Loading → RideQuote (interactive)
3. Click Confirm → Receipt → BookingConfirmation
4. Auto-transition → TripStatusTracker

---

### Phase 2: Ambiguity & Correction (Day 5-6)
**Goal:** Handle edge cases and post-decision edits

**Add Tools:**
- rides.search_places
- rides.get_trip_status (with progress)

**Add Tool UIs:**
- PickupConfirmCard
- DestinationPicker

**Flows:**
- Low confidence GPS → PickupConfirmCard
- No home saved → DestinationPicker
- "Actually, change destination" → Edit flow

---

### Phase 3: Polish (Day 7+)
**Goal:** Delight features

- PaymentMethodPicker
- MapPreviewCard integration
- Real-time status animations
- Multi-destination comparison

---

## Success Metrics

### Library Quality
✅ Components work with any backend (presentation props)
✅ All 4 states handled gracefully
✅ Clear protocol for LLM → UI invocation
✅ Correction flows are first-class

### Demo Impact
✅ Golden path feels instant (< 2s to quote)
✅ Loading states prevent UI pop-in
✅ Errors recover gracefully
✅ TripStatusTracker creates "wow" moment

### Developer Experience
✅ Components compose naturally
✅ Props are self-documenting (TypeScript)
✅ State transitions are predictable
✅ Can build new verticals without forking

---

## Key Design Decisions

### 1. Why 4 states not 2?
Loading and error states are critical for perceived quality. Users need to see the assistant "thinking" and failures need graceful recovery.

### 2. Why presentation props?
Library components shouldn't know about Waymo's Quote type. They should work for Lyft, DoorDash, or any vertical with similar UI needs.

### 3. Why explicit protocol?
Without a clear contract for how LLMs invoke UIs, every implementation becomes ad-hoc. The protocol enables tooling, testing, and cross-model portability.

### 4. Why correction callbacks?
LLM assistants should support "actually, change X" naturally. Post-decision edits are where conversational UI shines versus traditional forms.

---

## Next Steps

1. **Implement Phase 0** - Protocol and base components
2. **Build RideQuote** with all 4 states
3. **Build TripStatusTracker** with live updates
4. **Wire up golden path** in playground
5. **Add correction flows** once basics work