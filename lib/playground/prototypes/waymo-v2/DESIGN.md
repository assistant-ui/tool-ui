# Waymo v2 Prototype Design

## Purpose

This prototype exists to **research and demonstrate Tool UI patterns** using ride booking as a concrete domain. The goal isn't a production Waymo clone - it's to use this vertical as a lens for understanding:

1. When Tool UIs add value vs. plain text
2. What fundamental patterns exist across domains
3. How Tool UIs compose in conversations
4. What data contracts work between LLMs and UIs

## Relationship to Design Guidelines

This prototype and the [Design Guidelines](/docs/design-guidelines) evolve together:

- **Guidelines → Prototype**: We follow the principles (triadic loop, receipts, anti-patterns)
- **Prototype → Guidelines**: Friction we hit here informs new guidelines

### Learnings Fed Back to Guidelines

| Discovery | Guideline Update |
|-----------|------------------|
| Assistant said "Where to?" and UI had "Where to?" header | Expanded "Redundant narration" to be bidirectional — neither assistant nor surface should echo the other |
| Pickup location change needed dedicated UI, not inline edit | Secondary actions that require selection should spawn new Tool UIs rather than inline editing |
| Changing a term of a "contract" UI (like RideQuote) invalidates it | New pattern: **Contract with Revocation**. Some Tool UIs represent a contract (offer with specific terms). Changing any term revokes the contract and requires a fresh one. The revoked UI shows "superseded" state, a new Tool UI appears with updated terms. |

---

## The Triadic Loop

From the [Design Guidelines](/docs/design-guidelines): The assistant, the surface, and the user form a **collaborative triad**.

```
    User
   ↙    ↘
controls  observes
   ↓        ↓
 Surface ←→ Assistant
  mediates   narrates
```

**The loop in action:**

1. **Assistant introduces** the surface with context
2. **User interacts** with the surface
3. **Surface mediates** the result back
4. **Assistant narrates** what happened and continues

This is NOT just "show UI, wait for click." The assistant must:
- **Introduce** each surface ("Where would you like to go?")
- **Acknowledge** user actions ("Great, Home it is.")
- **Reference** surface data in follow-ups ("Your 5-minute ride to Home...")
- **Contextualize** what comes next ("Let me get you a quote.")

### Anti-pattern: Silent Surfaces

❌ **Wrong:**
```
User: "I need a ride"
[DestinationPicker appears silently]
User: clicks Home
[RideQuote appears silently]
```

✅ **Right:**
```
User: "I need a ride"
Assistant: "Where would you like to go?"
[DestinationPicker appears]
User: clicks Home
Assistant: "Home it is! Here's your quote for the 5-minute ride."
[RideQuote appears]
```

### Implementation: How the Loop Flows

With `makeAssistantTool` and `type: "human"`:

1. **Assistant calls tool** → Tool UI renders in interactive state
2. **User interacts** → Component calls `addResult({ ...data, selectedLocation })`
3. **Result sent to model** → Assistant sees the selection in the tool result
4. **Assistant generates response** → Can reference the selection and call next tool

The model sees the full result object, so it knows:
- What the user selected (`selectedLocation.label === "Home"`)
- Any metadata (ETA, price from quote, etc.)

This enables natural acknowledgment: "Home it is! That's a 5-minute ride for $12.50."

---

## Core User Experience

### User Mental Model

When someone says "I need a ride", they're thinking:

- **Where am I?** (usually known/assumed)
- **Where am I going?** (sometimes known, sometimes vague)
- **How much / how long?** (want to know before committing)
- **Is this confirmed?** (need clear feedback)

### UX Principles

1. **Minimize required input** - Use context (GPS, saved locations) to reduce questions
2. **Show, don't ask** - Present options visually rather than asking open-ended questions
3. **Single clear action** - Each Tool UI should have one obvious next step
4. **Recoverable** - User can always correct/change their mind
5. **Progressive disclosure** - Don't overwhelm with details upfront

---

## Conversation Flow

### Entry Points

| Entry | Example | Handling |
|-------|---------|----------|
| No destination | "I need a ride" | Show DestinationPicker |
| Known intent | "Take me home" | Resolve from profile, show RideQuote |
| Price check | "How much to SFO?" | Show RideQuote (no immediate booking) |
| Full intent | "Book a Waymo to 123 Main St" | Resolve address, show RideQuote |

### The Golden Path

```
User: "I need a ride"
    │
    ▼
┌──────────────────────────────────────┐
│  TOOL UI: DestinationPicker          │  ← Pattern: SELECTION
│  ─────────────────────────────────── │
│  "Where to?"                         │
│                                      │
│  [🏠 Home]  [💼 Work]                │
│  [📍 Recent: Ferry Building]         │
│                                      │
│  ─────────────────────────────────── │
│  User clicks "Home"                  │
│  → UI transforms to receipt:         │
│  "✓ Home - 123 Main St"              │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  TOOL UI: RideQuote                  │  ← Pattern: CONFIRMATION
│  ─────────────────────────────────── │
│  Downtown Coffee → Home              │
│  5 min • $12.50 • Waymo One          │
│  Payment: Apple Pay                  │
│                                      │
│  [ Confirm Ride ]                    │
│                                      │
│  ─────────────────────────────────── │
│  User clicks "Confirm"               │
│  → UI transforms to receipt:         │
│  "✓ Ride confirmed • 5 min away"     │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  TOOL UI: TripStatus                 │  ← Pattern: PROGRESS
│  ─────────────────────────────────── │
│  ✓ Requested                         │
│  ● Vehicle on the way (3 min)        │
│  ○ Pickup                            │
│  ○ Dropoff                           │
│                                      │
│  White Jaguar I-PACE • 8ABC123       │
│                                      │
│  [Cancel Ride]                       │
│  ─────────────────────────────────── │
│  (Updates live as status changes)    │
│  → Eventually becomes receipt:       │
│  "✓ Trip completed • $12.50"         │
└──────────────────────────────────────┘
```

---

## Tool UI Patterns

This prototype exercises three fundamental patterns that generalize across domains:

### 1. Selection Pattern (DestinationPicker)

**Purpose:** User chooses from discrete options

**Behavior:**
- Displays options visually
- User clicks to select
- Transforms to receipt showing choice

**Generalizes to:** Payment methods, ride types, menu items, time slots, any multi-choice input

**Library needs:**
- `addResult()` for capturing user choice
- Receipt state detection from result data
- Option rendering primitives

---

### 2. Confirmation / Contract Pattern (RideQuote)

**Purpose:** Present a contract (offer with specific terms) for user approval

**Behavior:**
- Shows key details in scannable format
- Primary action: Accept (Confirm)
- Secondary actions: Modify terms (e.g., "Change pickup location")
- **If terms change → contract is revoked**, UI transitions to "superseded" state
- New contract must be presented with updated terms
- Transforms to receipt on acceptance

**States:**
- `interactive` → User reviewing the contract
- `revoked` → User changed a term, contract superseded (dimmed, shows "Quote updated")
- `confirmed` → User accepted, contract fulfilled (receipt)

**Generalizes to:** Order summaries, booking confirmations, transaction approvals, pricing quotes, any offer that can be modified before acceptance

**Key insight:** A contract is a snapshot of specific terms. You can't "edit" a contract in place—you revoke and replace it. This maps naturally to conversation flow where each Tool UI is a discrete event.

**Library needs:**
- Structured card layouts
- Primary + secondary action buttons
- Revoked/superseded state styling
- Receipt state for accepted contracts

---

### 3. Progress Pattern (TripStatus)

**Purpose:** Show live-updating state over time

**Behavior:**
- Timeline/stepper visualization
- Updates as external state changes
- Actions available at certain states (e.g., Cancel before pickup)
- Eventually reaches terminal state → receipt

**Generalizes to:** Order tracking, file uploads, deployment status, any long-running task

**Library needs:**
- Polling/subscription mechanism for updates
- State machine visualization components
- Conditional action availability
- Terminal state detection

---

## Tool UI Components

| Component | Pattern | States |
|-----------|---------|--------|
| **DestinationPicker** | Selection | interactive → receipt |
| **PickupPicker** | Selection | interactive → receipt |
| **RideQuote** | Contract | interactive → revoked \| confirmed |
| **TripStatus** | Progress | live (multiple phases) → completed \| cancelled |

---

## Research Questions

### When does a Tool UI add value?

- Visual location picker vs. "type your destination"
- Showing a card vs. just saying "Your ride is $12.50"
- Hypothesis: Tool UIs win when there's **structured data** or **discrete choices**

### How do Tool UIs compose?

- One tool call → one UI, or chained?
- How do receipts work with multiple UIs in thread?
- What happens when a UI needs to update after user action?

### What's the right data contract?

- Should LLM pass presentation-ready strings or raw data?
- How much should UI "know" vs. just render props?
- Where does formatting/localization happen?

---

## Open Design Questions

1. **Zero-input vs. confirmation**
   - If we know home + GPS, can "ride home" skip DestinationPicker?
   - Or should we always show a confirmation step?

2. **LLM value-add**
   - LLM excels at ambiguous intent ("somewhere for lunch nearby")
   - Tool UIs excel at structured selection
   - Where are the handoff points?

3. **Mid-flow corrections**
   - User confirms, then says "wait, wrong address"
   - Cancel and restart? Inline edit?

---

## Next Steps

1. Define component interfaces for the three Tool UIs
2. Build minimal implementations that exercise the patterns
3. Identify library primitives needed to support these patterns
4. Document learnings for Tool UI design guidelines

---

*Last updated: 2025-01-25*