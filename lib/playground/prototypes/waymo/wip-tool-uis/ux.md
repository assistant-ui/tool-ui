# Waymo Booking UX Design (v2)

## Goal

Design a compelling end-to-end demo of booking a ride home via Waymo, focusing on:

- Minimal, high-impact tool set (80/20 principle)
- Clean separation: tools = operations, Tool UIs = presentation + interaction
- Post-booking tracking where Tool UIs really shine
- Handle ambiguity and correction, not just the golden path

---

## Architecture: Three Layers

### 1. Domain Tools (Backend-ish)

What the ride service actually does: resolve context, quote rides, book rides, fetch trip status.

### 2. Tool UI Primitives

Reusable UI building blocks: selectors, pickers, receipts, timelines, maps.

### 3. Conversation Patterns

Different flows (power, guided, exploratory) are just different sequences over the same tools + UIs.

---

## Core User Story

**"I need a ride home"**

Decision points:

1. **Where are you now?** (pickup location + confidence)
2. **Where is home?** (destination from context or user input)
3. **When?** (now vs scheduled)
4. **Payment** (default or selection)
5. **Confirm & book**
6. **Track ride** (the "wow" moment)

**Note:** Waymo offers a single autonomous vehicle type, which simplifies the flow.

---

## v2 Tool Set

### Tier 0 – Core Tools (4) — The True 80/20

These four are enough to: resolve context, get quotes, book, and track.

#### 1. `rides.get_rider_context`

**Purpose:** Silent context fetch

**Input:** none

**Output:**

```typescript
{
  home: Location | null,
  work: Location | null,
  frequent_destinations: Location[],
  recent_destinations: Location[],
  default_payment_method: PaymentMethod,
  payment_methods: PaymentMethod[],
  flags: {
    has_multiple_payment_methods: boolean,
    is_new_rider: boolean
  }
}
```

**Use:** Right after "I need a ride home" to avoid asking for known info.

**UI:** None (silent background call)

---

#### 2. `rides.get_pickup_location`

**Purpose:** Normalize/confirm where to pick up

**Input:**

```typescript
{
  hint: "current_location" | string | { lat: number, lng: number },
  allow_approximate?: boolean
}
```

**Output:**

```typescript
{
  resolved_location: {
    address: string,
    lat: number,
    lng: number,
    name: string
  },
  confidence: "high" | "medium" | "low",
  nearby_landmarks?: string[]
}
```

**Use:**

- If `confidence === "high"` → auto-confirm with text
- If `confidence !== "high"` → show **PickupConfirmCard** UI

**UI:** PickupConfirmCard (conditional)

---

#### 3. `rides.get_quote`

**Purpose:** Get ride quote for pickup → destination

**Input:**

```typescript
{
  pickup: Location,
  dropoff: Location,
  departure_time?: "now" | ISO8601
}
```

**Output:**

```typescript
{
  quote_id: string,
  eta_minutes: number,
  price: {
    amount: number,
    currency: string,
    is_estimate: boolean,
    surge_multiplier?: number
  },
  pickup: Location,
  dropoff: Location,
  vehicle_info: {
    type: "Waymo One",
    capacity: number
  }
}
```

**Use:** Main interactive tool - presents the ride option for confirmation

**UI:** **RideQuote** ⭐ (Hero Tool UI)

---

#### 4. `rides.book_trip`

**Purpose:** Actually book the ride

**Input:**

```typescript
{
  quote_id: string,
  payment_method_id?: string  // uses default if not specified
}
```

**Output:**

```typescript
{
  trip_id: string,
  status: "requested",
  pickup: Location,
  dropoff: Location,
  eta_minutes: number,
  price: {
    amount: number,
    currency: string
  },
  payment_summary: string,  // "$12.50 charged to Apple Pay (...4242)"
  vehicle?: {
    make: string,
    model: string,
    color: string,
    plate: string
  }
}
```

**Use:** Execute booking, then immediately show tracking

**UI:** **BookingConfirmation** → **TripStatusTracker** ⭐

---

### Tier 1 – Support Tools (3)

#### 5. `rides.search_places`

**Purpose:** Resolve arbitrary text destination

**Input:**

```typescript
{
  query: string,
  near?: { lat: number, lng: number }
}
```

**Output:**

```typescript
{
  results: Array<{
    name: string;
    address: string;
    lat: number;
    lng: number;
    type: string; // "airport", "restaurant", etc.
  }>;
}
```

**Use:** When "home"/"work"/recents don't match user's request

**UI:** DestinationPicker (search results)

---

#### 6. `payments.list_methods`

**Purpose:** Expose payment options when needed

**Input:** none

**Output:**

```typescript
{
  methods: Array<{
    id: string;
    type: "card" | "apple_pay" | "google_pay";
    brand?: string;
    last4?: string;
    is_default: boolean;
  }>;
}
```

**Use:** Only for "change payment method" flows

**UI:** PaymentMethodPicker (conditional)

---

#### 7. `rides.get_trip_status`

**Purpose:** Track ride after booking

**Input:**

```typescript
{
  trip_id: string;
}
```

**Output:**

```typescript
{
  trip_id: string,
  status: "searching" | "assigned" | "en_route" | "arrived" | "in_trip" | "completed" | "canceled",
  eta_minutes?: number,
  vehicle?: {
    make: string,
    model: string,
    color: string,
    plate: string,
    current_location?: { lat: number, lng: number }
  },
  map_snapshot_url?: string,
  next_actions: string[]  // ["cancel", "contact_support", "share_eta"]
}
```

**Use:** Animate status transitions through repeated calls

**UI:** **TripStatusTracker** ⭐ (Where Tool UIs really shine)

---

## Tool UI Primitives (Generic, Reusable)

These are library-level; Waymo is just a preset.

### 1. OptionCardSelector

- Horizontally scrollable or grid of options
- Each card: title, subtitle, primary metric, secondary metric, badges, CTA
- Modes: `select` (clickable) | `receipt` (selected highlighted)
- Used for: ride options, payment methods, destination picks

### 2. InlineChoiceChips

- Row of pill buttons ("Now", "In 15 min", "Tonight")
- Great for quick time selection in chat bubble

### 3. SummaryReceiptCard

- Compact summary: icon, title, key info lines, sibling action surface
- Used for: booking confirmation, post-selection receipts

### 4. TimelineStatusCard

- Vertical stepper with states
- Each step can be highlighted with timestamps/ETAs
- Used for: trip status tracking

### 5. MapPreviewCard (optional)

- Map thumbnail + pickup/dropoff labels
- Actions: "Open in maps", "Change pickup"

---

## Waymo-Specific Tool UIs (Built from Primitives)

### 1. RideQuote ⭐ (Hero Tool UI)

**Built on:** SummaryReceiptCard + custom styling

**Props:**

```typescript
{
  quote: Quote,  // from rides.get_quote
  payment_method: PaymentMethod,
  mode: "interactive" | "receipt"
}
```

**Interactive mode:**

- Shows: pickup → destination route
- Displays: ETA, price, Waymo vehicle visualization
- Large "Confirm Ride" button
- Payment method shown (with "Change" option)

**Receipt mode:**

- "✓ Ride confirmed"
- Collapsed summary of route, ETA, price

---

### 2. BookingConfirmation ⭐

**Built on:** SummaryReceiptCard

**Props:**

```typescript
{
  trip: BookedTrip,  // from rides.book_trip
}
```

**Shows:**

- Title: "Your Waymo is on the way"
- Lines: pickup → dropoff, ETA, price, payment
- Actions: "Track ride", "Share trip", "Cancel"

---

### 3. TripStatusTracker ⭐ (The Wow Factor)

**Built on:** TimelineStatusCard + MapPreviewCard

**Props:**

```typescript
{
  trip_status: TripStatus,  // from rides.get_trip_status
}
```

**Timeline steps:**

1. Requested
2. Vehicle assigned (shows vehicle details)
3. Vehicle en route (shows ETA countdown)
4. Vehicle arrived (pickup instructions)
5. In trip (live progress)
6. Completed (receipt/rating)

**Features:**

- Each status update re-renders with new data
- Map preview shows vehicle location
- Context-appropriate actions at each step

---

### 4. DestinationPicker

**Built on:** InlineChoiceChips + search input + list

**Props:**

```typescript
{
  home: Location | null,
  work: Location | null,
  recents: Location[],
  search_results?: Location[],
  mode: "interactive" | "receipt"
}
```

**Interactive mode:**

- Top: chips for Home, Work (if available)
- Middle: recent locations
- Bottom: search box → results from `rides.search_places`

**Receipt mode:**

- "✓ [Location Name]" with address

---

### 5. PickupConfirmCard

**Built on:** MapPreviewCard + buttons

**Props:**

```typescript
{
  location: Location,
  confidence: "high" | "medium" | "low",
  nearby_landmarks?: string[],
  mode: "interactive" | "receipt"
}
```

**Interactive mode:**

- Map preview with marker
- Address + landmark context
- Buttons: "Confirm pickup here" / "Change location"
- If `confidence !== "high"`, emphasize "Change location"

**Receipt mode:**

- "✓ Pickup at [Address]"

---

### 6. PaymentMethodPicker

**Built on:** OptionCardSelector

**Props:**

```typescript
{
  methods: PaymentMethod[],
  selected_id?: string,
  mode: "interactive" | "receipt"
}
```

**When shown:**

- User explicitly asks to change payment
- `has_multiple_payment_methods && no_default`

---

## Demo Flows

### Flow 1: Golden Path — "I need a ride home" (1 click)

**User:** "I need a ride home"

**Step 1:** Silent context + location resolution

```
Tools called:
- rides.get_rider_context → has home, has default payment
- rides.get_pickup_location({ hint: "current_location" }) → confidence: "high"
```

**Step 2:** Assistant responds + shows RideQuote

```
Assistant: "I can get you home from Downtown Coffee Shop."
```

**RideQuote UI (interactive mode):**

```
┌─────────────────────────────────────┐
│  Downtown Coffee → 123 Main St      │
│                                     │
│  [Waymo vehicle illustration]       │
│                                     │
│     Arrives in 5 minutes            │
│           $12.50                    │
│                                     │
│    ┌─────────────────────┐          │
│    │   Confirm Ride      │          │
│    └─────────────────────┘          │
│                                     │
│  Apple Pay (...4242)  [Change]      │
└─────────────────────────────────────┘
```

**Step 3:** User clicks "Confirm Ride"

- RideQuote transitions to receipt mode: "✓ Ride confirmed"
- Tool called: `rides.book_trip`

**Step 4:** BookingConfirmation + TripStatusTracker

```
┌─────────────────────────────────────┐
│  Your Waymo is on the way! ✓        │
├─────────────────────────────────────┤
│  Downtown Coffee → 123 Main St      │
│  5 min • $12.50 • Apple Pay         │
│                                     │
│  Trip ID: WMO-2024-ABC123           │
│                                     │
│  [Track Ride] [Share] [Cancel]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Trip Status                        │
├─────────────────────────────────────┤
│  ● Requested                        │
│  ○ Vehicle assigned                 │
│  ○ En route to pickup               │
│  ○ Arrived at pickup                │
│  ○ Trip in progress                 │
│  ○ Completed                        │
└─────────────────────────────────────┘
```

**Total:**

- 1 user message
- 1 click
- 3 tools called
- 3 Tool UIs (RideQuote → BookingConfirmation → TripStatusTracker)

---

### Flow 2: New User — "I need a ride home" (guided)

**User:** "I need a ride home"

**Step 1:** Context reveals no home saved

```
Tools called:
- rides.get_rider_context → home: null
```

**Step 2:** Assistant asks + shows DestinationPicker

```
Assistant: "I can help with that. Where's home for you?"
```

**DestinationPicker UI:**

```
┌─────────────────────────────────────┐
│  Where to?                          │
├─────────────────────────────────────┤
│  [Work: 456 Office Blvd]            │
│                                     │
│  Recent:                            │
│  • SFO Airport                      │
│  • Downtown Target                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Search for address...       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Step 3:** User searches "123 Main St"

- Tool called: `rides.search_places({ query: "123 Main St" })`
- Results appear, user selects

**Step 4:** Continue with Flow 1

- `rides.get_pickup_location`
- `rides.get_quote`
- RideQuote → Confirm → BookingConfirmation → TripStatusTracker

---

### Flow 3: Low Confidence Pickup — GPS Issues

**User:** "I need a ride to work"

**Step 1:** Location resolution with low confidence

```
Tools called:
- rides.get_rider_context → has work
- rides.get_pickup_location → confidence: "low"
```

**Step 2:** Show PickupConfirmCard

```
Assistant: "I'm having trouble pinpointing your exact location."
```

**PickupConfirmCard UI:**

```
┌─────────────────────────────────────┐
│  Confirm Pickup Location            │
├─────────────────────────────────────┤
│  [Map preview with marker]          │
│                                     │
│  Near: Downtown Coffee Shop         │
│  123 Main St                        │
│                                     │
│  Nearby: City Hall, Metro Station   │
│                                     │
│  [Confirm Here]  [Change Location]  │
└─────────────────────────────────────┘
```

**Step 3:** User confirms or adjusts → Continue with quote + booking

---

### Flow 4: Comparison — "Should I go home or to the office?"

**User:** "Should I go home or to the office?"

**Step 1:** Get both quotes

```
Tools called:
- rides.get_rider_context → home + work
- rides.get_pickup_location
- rides.get_quote({ dropoff: home })
- rides.get_quote({ dropoff: work })
```

**Step 2:** Show comparison

```
Assistant: "Here's how both trips compare:"
```

**Comparison UI:**

```
┌─────────────────────────────────────┐
│  To Home                            │
│  123 Main St                        │
│  5 min • $12.50                     │
│  [Select]                           │
├─────────────────────────────────────┤
│  To Work                            │
│  456 Office Blvd                    │
│  9 min • $18.00                     │
│  [Select]                           │
└─────────────────────────────────────┘
```

**Step 3:** User selects → Book → Confirm → Track

---

### Flow 5: Post-Booking Updates — The Wow Factor

After booking, the TripStatusTracker updates as status changes:

**Status: "assigned"**

```
┌─────────────────────────────────────┐
│  Trip Status                        │
├─────────────────────────────────────┤
│  ✓ Requested                        │
│  ● Vehicle assigned                 │
│    White Jaguar I-PACE              │
│    License: 8ABC123                 │
│  ○ En route (3 min away)            │
│  ...                                │
└─────────────────────────────────────┘
```

**Status: "arrived"**

```
┌─────────────────────────────────────┐
│  Your Waymo has arrived!            │
├─────────────────────────────────────┤
│  [Map with vehicle at pickup]       │
│                                     │
│  White Jaguar I-PACE                │
│  License: 8ABC123                   │
│                                     │
│  Look for your vehicle near the     │
│  main entrance on Oak Street.       │
│                                     │
│  [Get Directions] [Can't Find It]   │
└─────────────────────────────────────┘
```

**Status: "completed"**

```
┌─────────────────────────────────────┐
│  Trip Complete ✓                    │
├─────────────────────────────────────┤
│  Downtown Coffee → 123 Main St      │
│  12 min trip • $12.50               │
│                                     │
│  How was your ride?                 │
│  [😊] [😐] [😞]                     │
│                                     │
│  [Get Receipt] [Report Issue]       │
└─────────────────────────────────────┘
```

---

## Build Priority

### Phase 1: Minimal End-to-End (First Prototype)

**Tools (4):**

1. `rides.get_rider_context`
2. `rides.get_pickup_location`
3. `rides.get_quote`
4. `rides.book_trip`

**Tool UIs (3):**

1. **RideQuote** - The hero (interactive + receipt modes)
2. **BookingConfirmation** - The payoff
3. **TripStatusTracker** - The wow factor

**Flows:**

- Golden path: "I need a ride home" → 1 click

---

### Phase 2: Handle Edge Cases

**Add Tools:** 5. `rides.search_places` 6. `rides.get_trip_status`

**Add Tool UIs:** 4. **DestinationPicker** - For unknown destinations 5. **PickupConfirmCard** - For low confidence locations

**Flows:**

- New user with no home saved
- GPS issues / location correction

---

### Phase 3: Polish & Delight

**Add Tools:** 7. `payments.list_methods`

**Add Tool UIs:** 6. **PaymentMethodPicker** 7. **MapPreviewCard** integration

**Features:**

- Multi-destination comparison
- Scheduled rides
- Real-time status animations

---

## Design Principles

### 1. Confidence-Based UI Decisions

Let `confidence` scores from tools drive UI choices:

- `high` → auto-confirm with text
- `medium/low` → show interactive picker

### 2. Progressive Enhancement

- Start with text confirmations
- Add interactive UIs where they reduce friction
- Maps and animations are polish, not core

### 3. Receipt States Everywhere

Every interactive Tool UI should have a collapsed receipt state showing what was selected.

### 4. Post-Booking is the Payoff

The demo isn't complete at booking. TripStatusTracker with animated state transitions is where Tool UIs really shine.

### 5. Same Tools, Different Flows

The LLM orchestrates different conversation patterns using the same tool set. Don't add tools for every flow variant.

---

## Open Questions

### 1. Prices before or after location confirmation?

**Recommendation:** Always price after concrete pickup + dropoff.

- If `confidence === "high"` and destination known → show real prices
- Otherwise → resolve locations first, then quote

### 2. Handling surge / availability changes?

**Design for:**

- `price.is_estimate = true` during surge
- `book_trip` returns `price_confirmed` or `price_changed`
- Small change → inline toast
- Large change → re-render RideQuote with "Price changed" badge

### 3. How much detail in RideQuote?

**Implement density modes:**

- `variant="compact"` → ETA, price, confirm (default)
- `variant="detailed"` → add capacity, accessibility, carbon, etc.

### 4. Payment selection: separate step or bundled?

**Recommendation:** Bundled by default.

- Only show PaymentMethodPicker if:
  - User asks to change payment
  - Multiple methods + no default

### 5. Map preview in RideQuote?

**Trade-offs:**

- Pro: Visual confirmation of route
- Con: More complex, slower to render
- Recommendation: Add in Phase 3 as polish

### 6. Multi-destination comparison?

**For v1:** Support in Flow 4 without new tools
**Defer:** Complex multi-stop trips to future iteration

---

## Next Steps

1. **Define TypeScript schemas** for tool inputs/outputs
2. **Design RideQuote component** - The hero UI
3. **Design TripStatusTracker** - The wow factor
4. **Wire up golden path flow** in the playground
5. **Iterate on edge cases** based on testing
