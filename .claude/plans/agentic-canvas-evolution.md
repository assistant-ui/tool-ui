# Tool UI: Agentic Canvas Evolution

## Overview

This document explores how Tool UI can evolve from chat-centric components to support **agentic canvas** paradigms—where AI assistants fluidly manipulate UI elements in spatial workspaces, and where new components can be **generatively composed** from existing primitives.

**But that's just the mechanism.** The real goal is bigger.

---

## The North Star: The Insight Loop

We're building toward an experience that **pre-empts, predicts, and proactively acts** on behalf of the user. The canvas isn't just a dashboard—it's an intelligent surface that surfaces what matters and enables action.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        THE INSIGHT LOOP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. CORRELATE                                                       │
│      System observes patterns across data sources                    │
│      "PR cycle time increased 40% when this author reviews"          │
│                                                                      │
│   2. ILLUMINATE                                                      │
│      Generate canvas that makes the insight *visible*                │
│      Not just showing data—explaining the pattern                    │
│                                                                      │
│   3. BUILD TRUST                                                     │
│      User can interrogate: "Why do you think this?"                  │
│      Evidence is surfaced via inline citations + confidence          │
│                                                                      │
│   4. SUGGEST ACTION                                                  │
│      "Consider redistributing reviews" / "Talk to this person"       │
│      Actionable, not just informational                              │
│                                                                      │
│   5. TRACK HYPOTHESIS                                                │
│      Decision becomes an experiment with before/after markers        │
│      "We changed X, expecting Y"                                     │
│                                                                      │
│   6. MEASURE EFFECTS                                                 │
│      System monitors for outcome                                     │
│      "After change, cycle time dropped 25%"                          │
│                                                                      │
│   7. COMPOUND KNOWLEDGE                                              │
│      Learning persists: "In this codebase, X correlates with Y"      │
│      Future insights build on past learnings                         │
│                                                                      │
│   └──────────────────→ loops back to step 1 ←────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### The Aha Moment

> **User**: "Help me stay on top of my repos"
>
> **System**: *Builds a live workspace showing:*
> - What happened since you last looked
> - Anomalies (this is unusual)
> - Progress toward goals
> - Things needing your action *now*
>
> **System** (proactively): "These 3 PRs haven't had activity in 5+ days.
> [PR #142](ref:pr-142) was opened by a new contributor—might need guidance."
> *[85% confident · based on: last_activity < 5d, author.contributions < 3]*

### Intelligence Architecture

The insight engine uses a **hybrid approach**:

| Layer | What it does | Example |
|-------|--------------|---------|
| **Heuristics** | Predefined patterns to look for | "Stale = no activity > 5 days" |
| **LLM reasoning** | Correlate data, generate hypotheses | "These two events seem related" |
| **Learned patterns** | What matters to THIS user over time | "You always review security PRs first" |

### Knowledge Persistence

The system maintains a compounding knowledge graph:

- **Conversation memory**: Past discussions and decisions
- **Insight database**: Hypotheses, actions taken, measured outcomes
- **Learned preferences**: What this user cares about, how they like things shown

### Incremental Path

Each piece we build moves toward this loop. The components, data bindings, generative UI—all serve the insight loop, even if we start simple.

**First insight demo**: Stale work alert with inline citations and confidence indicator.

---

## Part 1: The Paradigm Gap

### Current State: Chat-Centric Components

Tool UI components today are optimized for **linear message streams**:

```
┌─────────────────────────────────────┐
│ [User message]                      │
├─────────────────────────────────────┤
│ [Assistant text]                    │
│ ┌─────────────────────────────────┐ │
│ │ <ApprovalCard />                │ │  ← Fixed in message flow
│ │   title, description            │ │  ← One-shot render
│ │   [Confirm] [Cancel]            │ │  ← Binary actions
│ └─────────────────────────────────┘ │
│ [More assistant text]               │
└─────────────────────────────────────┘
```

**Characteristics:**
- Position determined by message order
- Render once, maybe update via `choice` prop for receipt state
- Actions are terminal: confirm/cancel ends interaction
- No awareness of other components
- Layout via `className` (user responsibility)

### Emerging Need: Canvas-Centric Components

Agentic workspaces need components that live in **spatial, persistent contexts**:

```
┌──────────────────────────────────────────────────────────┐
│  Canvas                                                   │
│  ┌──────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ StatTile │  │ PRList           │  │ ActivityFeed   │ │
│  │ 2x2      │  │ 4x3              │  │ 3x4            │ │
│  │ ○ 23 PRs │  │ [pr1] [pr2]...   │  │ • commit       │ │
│  └──────────┘  │                  │  │ • review       │ │
│                │ [Summarize] [+]  │  │ • issue        │ │
│                └──────────────────┘  └─────────────────┘ │
│                        ↑                                  │
│            AI can: move, resize, update config,          │
│            link to other components, refresh data        │
└──────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Explicit position (col, row) and size (cols, rows)
- Data bindings with refresh intervals
- Rich action vocabulary (move, resize, summarize, drill down, link)
- Awareness of neighbors and canvas context
- Undo/redo with source attribution

---

## Part 2: Unified Component Architecture

### Proposal: Components as "Polymorphic Surfaces"

Rather than separate component libraries, **one component can render in multiple contexts**:

```typescript
// A component declares what contexts it supports
interface ComponentDefinition {
  id: string;

  // Chat context support
  chat?: {
    defaultWidth: 'compact' | 'standard' | 'wide';
    responseActions?: ActionDefinition[];
    receiptState?: (choice: string) => ReactNode;
  };

  // Canvas context support
  canvas?: {
    defaultSize: { cols: number; rows: number };
    minSize?: { cols: number; rows: number };
    maxSize?: { cols: number; rows: number };
    canvasActions?: CanvasActionDefinition[];
    dataBinding?: DataBindingSpec;
    contextSummary?: (config: unknown, data: unknown) => string;
  };

  // Shared
  configSchema: ZodSchema;
  render: (props: ComponentProps) => ReactNode;
}
```

### Context Detection

Components receive context and adapt:

```typescript
interface ComponentProps<TConfig, TData> {
  // Core
  config: TConfig;
  data?: TData;
  isLoading?: boolean;

  // Context-specific (only one set populated)
  chatContext?: {
    onAction: (actionId: string) => void;
    choice?: string;  // Receipt state
  };

  canvasContext?: {
    position: { col: number; row: number };
    size: { cols: number; rows: number };
    neighbors: NeighborInfo[];
    onCanvasAction: (action: CanvasAction) => CommandResult;
  };
}
```

### Example: OptionList as Polymorphic Component

```tsx
// components/tool-ui/option-list/option-list.tsx

export function OptionList(props: OptionListProps) {
  const { options, chatContext, canvasContext } = props;

  // Adapt layout based on context
  const layout = canvasContext
    ? deriveLayoutFromSize(canvasContext.size, options.length)
    : 'list';  // Chat always uses list

  // Adapt actions based on context
  const actions = canvasContext
    ? [...(props.actions ?? []),
       { id: 'expand', label: 'Show details', icon: Maximize2 },
       { id: 'filter', label: 'Filter options', icon: Filter }]
    : props.actions;

  return (
    <article data-context={canvasContext ? 'canvas' : 'chat'}>
      {layout === 'grid' ? (
        <OptionGrid options={options} columns={canvasContext.size.cols} />
      ) : (
        <OptionStack options={options} />
      )}
      <ActionButtons actions={actions} onAction={handleAction} />
    </article>
  );
}
```

---

## Part 3: Canvas Action Protocol

### Beyond Confirm/Cancel

Chat components have simple actions. Canvas components need a richer vocabulary:

```typescript
type CanvasAction =
  // Spatial
  | { type: 'move'; position: Position }
  | { type: 'resize'; size: Size }
  | { type: 'pin' }
  | { type: 'unpin' }

  // Content
  | { type: 'refresh' }
  | { type: 'update_config'; config: Partial<Config> }
  | { type: 'summarize' }  // AI summarizes component content
  | { type: 'expand' }     // Show detail view
  | { type: 'collapse' }   // Return to summary view

  // Relationships
  | { type: 'link'; targetId: ComponentId; relationship: string }
  | { type: 'unlink'; targetId: ComponentId }
  | { type: 'aggregate'; sourceIds: ComponentId[] }  // Combine data

  // Meta
  | { type: 'duplicate' }
  | { type: 'remove' }
  | { type: 'label'; label: string };
```

### Action Exposure for AI

Components declare which actions they support:

```typescript
// In component definition
canvas: {
  canvasActions: [
    {
      id: 'summarize',
      label: 'Summarize content',
      description: 'Generate AI summary of displayed data',
      parameters: z.object({
        style: z.enum(['brief', 'detailed', 'bullet_points']).optional()
      }),
      available: (state) => state.data != null  // Only when data loaded
    },
    {
      id: 'filter',
      label: 'Filter items',
      parameters: z.object({
        field: z.string(),
        operator: z.enum(['equals', 'contains', 'gt', 'lt']),
        value: z.unknown()
      })
    }
  ]
}
```

The AI receives this as tool definitions:

```typescript
// Generated for AI context
{
  name: "component_action",
  description: "Execute an action on a canvas component",
  parameters: {
    component_id: "string",
    action: "summarize | filter | expand | ...",
    params: { /* action-specific */ }
  }
}
```

---

## Part 4: Data Binding Architecture

### The Problem

Chat components receive data as props (caller's responsibility). Canvas components need to **own their data lifecycle**:

- Fetch on mount
- Refresh on interval
- Show loading/error states
- Cache and deduplicate requests
- React to external invalidation

### Data Binding Spec

```typescript
interface DataBindingSpec {
  // What data this component needs
  querySchema: ZodSchema<DataQuery>;

  // How to generate a default query from config
  defaultQuery: (config: unknown) => DataQuery;

  // Transform raw data to component format
  transform?: (raw: unknown) => unknown;

  // Suggested refresh interval (ms), null = manual only
  defaultRefreshInterval: number | null;
}

// Example for PRList
const prListDataBinding: DataBindingSpec = {
  querySchema: z.object({
    type: z.literal('github.pulls'),
    params: z.object({
      repo: z.string(),
      state: z.enum(['open', 'closed', 'merged', 'all']),
      limit: z.number().optional()
    })
  }),

  defaultQuery: (config: PRListConfig) => ({
    type: 'github.pulls',
    params: {
      repo: config.repo,
      state: config.state ?? 'open',
      limit: config.limit ?? 10
    }
  }),

  defaultRefreshInterval: 60_000  // 1 minute
};
```

### Data Source Abstraction

```typescript
interface DataSource {
  id: string;
  name: string;

  // Execute a query and return data
  execute(query: DataQuery): Promise<DataResult>;

  // Optional: subscribe to real-time updates
  subscribe?(query: DataQuery, callback: (data: unknown) => void): Unsubscribe;

  // Which query types this source handles
  supportedQueryTypes: string[];
}
```

---

## Part 5: Generative UI Heuristics Framework

### The Vision

Given a **data shape** and **context**, automatically determine:
1. Which component to use
2. How to configure it
3. What size/position to suggest
4. When to compose from primitives vs use a specialized component

### Heuristic Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Composition Rules                              │
│   "Array of objects with labels → OptionList or Table?" │
│   "Time-series data → Chart or Timeline?"               │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Component Matching                             │
│   "This data shape matches StatTile schema"             │
│   "95% confidence: PRList, 70% confidence: DataTable"   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Data Shape Analysis                            │
│   "Object with title, items[], status"                  │
│   "Array of 47 items, each with name, value, trend"     │
└─────────────────────────────────────────────────────────┘
```

### Shape Analysis

```typescript
interface DataShape {
  type: 'primitive' | 'object' | 'array';

  // For objects
  fields?: Record<string, FieldShape>;

  // For arrays
  itemShape?: DataShape;
  length?: number;

  // Semantic hints (detected or declared)
  semantics?: DataSemantics[];
}

type DataSemantics =
  | 'temporal'      // Timestamps, dates
  | 'numeric'       // Numbers that could be charted
  | 'categorical'   // Enum-like values
  | 'identifier'    // IDs, keys
  | 'text_short'    // Titles, names
  | 'text_long'     // Descriptions, bodies
  | 'url'           // Links
  | 'image_url'     // Image sources
  | 'status'        // State indicators
  | 'trend'         // Up/down/flat indicators
  | 'currency'      // Money values
  | 'percentage';   // Ratios, percentages

function analyzeShape(data: unknown): DataShape {
  // Recursive analysis with semantic inference
  // e.g., field named "created_at" → temporal
  // e.g., field named "status" with values ["open", "closed"] → categorical + status
}
```

### Component Matching

```typescript
interface ComponentMatcher {
  componentId: string;

  // How well does this component fit the shape?
  score(shape: DataShape, context: RenderContext): MatchScore;

  // Generate config from data
  deriveConfig(data: unknown, shape: DataShape): unknown;

  // Suggest size based on data volume
  suggestSize(data: unknown, context: RenderContext): Size;
}

interface MatchScore {
  confidence: number;  // 0-1
  reasoning: string;   // For debugging/explanation

  // What's missing for a perfect match?
  gaps?: string[];

  // Would composition with other components help?
  compositionSuggestion?: CompositionSuggestion;
}
```

### Composition Engine

When no single component fits well, compose from primitives:

```typescript
interface CompositionSuggestion {
  layout: 'stack' | 'grid' | 'split';

  segments: Array<{
    component: string;
    dataPath: string;  // JSONPath to extract data
    config: unknown;
    size?: Size;
  }>;
}

// Example: Complex dashboard data
// Input: { metrics: [...], timeline: [...], topItems: [...] }
// Output:
{
  layout: 'grid',
  segments: [
    { component: 'stats-display', dataPath: '$.metrics', size: { cols: 6, rows: 2 } },
    { component: 'chart', dataPath: '$.timeline', size: { cols: 6, rows: 3 } },
    { component: 'data-table', dataPath: '$.topItems', size: { cols: 6, rows: 3 } }
  ]
}
```

### Context-Aware Selection

The same data might render differently based on context:

```typescript
interface RenderContext {
  // Where is this being rendered?
  surface: 'chat' | 'canvas' | 'modal' | 'tooltip';

  // Available space
  availableSize?: Size;

  // What's the user intent?
  intent?: 'explore' | 'monitor' | 'decide' | 'compare';

  // What else is on screen?
  siblingComponents?: ComponentSummary[];

  // Time context
  temporal?: {
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    dayOfWeek: string;
    isWorkHours: boolean;
  };
}

// Example: 5 metrics
// In chat (intent: decide) → StatsDisplay with sparklines
// In canvas (intent: monitor, morning) → 5 separate StatTiles
// In tooltip (small space) → Compact number list
```

---

## Part 6: AI Context Generation

### The Problem

For AI to manipulate components intelligently, it needs to understand:
- What's on the canvas
- What each component shows
- What actions are available
- What relationships exist

### Component Summary Protocol

Each component provides a natural language summary:

```typescript
interface CanvasComponentDefinition {
  // ... other fields ...

  // Generate human-readable summary for AI context
  contextSummary: (
    config: unknown,
    data: unknown,
    state: ComponentState
  ) => string;
}

// Example implementation for PRList
contextSummary: (config, data, state) => {
  const prs = data?.items ?? [];
  const openCount = prs.filter(pr => pr.state === 'open').length;

  return [
    `PR List for ${config.repo}`,
    `Showing ${prs.length} pull requests (${openCount} open)`,
    state.isStale ? '⚠️ Data may be stale' : '',
    `Position: col ${state.position.col}, row ${state.position.row}`,
    `Size: ${state.size.cols}x${state.size.rows}`,
  ].filter(Boolean).join('. ');
};

// Output: "PR List for acme/widgets. Showing 12 pull requests (5 open).
//          Position: col 2, row 0. Size: 4x3."
```

### Canvas Context Budget

Token limits require smart summarization:

```typescript
interface ContextBudget {
  maxTokens: number;

  // Prioritization
  alwaysInclude: ComponentId[];  // Pinned components
  summarizationLevel: 'full' | 'standard' | 'minimal';
}

function generateCanvasContext(
  canvas: CanvasState,
  budget: ContextBudget
): string {
  // 1. Always include pinned components in full
  // 2. Include recently interacted components
  // 3. Summarize or omit distant/idle components
  // 4. Include relationship graph if relevant
  // 5. Add temporal context (time of day, etc.)
}
```

---

## Part 7: Implementation Roadmap

### Phase 1: First Canvas Components (This Branch)

**Goal:** Build 2 canvas-native components in tool-ui that demonstrate the core properties

**Components to build:**
1. **Activity Feed** — Chronological stream of events
   - Size-aware: Adapts density based on height (compact/standard/detailed)
   - Live updating: Refreshes on interval, shows stale indicator
   - Display-focused for now (intelligence hooks come later)

2. **Time-Series Chart** — Line/area visualization
   - Size-aware: Sparkline at small size, full chart with axes at large
   - Live updating: Auto-refresh with configurable interval
   - Zoom/pan at larger sizes

**Canvas-native characteristics to implement:**
- [ ] Size prop with responsive layout adaptation
- [ ] `isLive` / `refreshInterval` props for live updating
- [ ] Loading/error/stale states
- [ ] Data schema that can be bound to sources

### Phase 2: First Insight

**Goal:** Demo the simplest compelling insight

**Target insight**: Stale work alert
> "These 3 PRs haven't had activity in 5+ days"

**Trust UI requirements:**
- Inline citations (clickable references to source events)
- Confidence indicator ("85% confident" with hover explanation)

**This requires:**
- [ ] Insight card component (displays the alert + evidence)
- [ ] Citation component (inline reference that expands to evidence)
- [ ] Confidence badge component
- [ ] Simple heuristic: `lastActivity > 5 days`

### Phase 3: Data Layer

1. **Define `DataSource` interface** and mock implementations
2. **Add `DataBinding` types** to component schemas
3. **Create `useDataBinding` hook** for canvas components
4. **Wire up to GitHub mock data from agentic-canvas**

### Phase 4: Canvas Actions & Undo

1. **Define `CanvasAction` protocol**
2. **Port command/undo system from agentic-canvas**
3. **Add action declarations** to component definitions
4. **Create `ActionRegistry`** for AI tool generation

### Phase 5: Generative UI

1. **Implement `DataShape` analyzer**
2. **Create `ComponentMatcher` system**
3. **Build composition engine**
4. **Add context-aware selection**

### Phase 6: Knowledge Persistence

1. **Insight database schema** (hypotheses, actions, outcomes)
2. **Conversation memory integration**
3. **Preference learning hooks**

### Phase 7: Integration

1. **Port patterns to agentic-canvas**
2. **Publish shared primitives package**
3. **Documentation and examples**

---

## Open Questions

1. **Should canvas components be a separate package?**
   - Pro: Cleaner separation, different dependencies
   - Con: Duplication, harder to share primitives

2. **How much should components know about their neighbors?**
   - Full graph awareness enables rich interactions
   - But increases complexity and coupling

3. **Server components compatibility?**
   - Data bindings need client-side state
   - Could split into data-fetching wrapper + presentational core

4. **How to handle component versioning?**
   - Canvas state persists across sessions
   - Component updates might break saved configs

---

## Appendix A: Chat vs Canvas Components

Not all components should be on a canvas. There's a fundamental distinction:

| Aspect | Chat Components | Canvas Components |
|--------|-----------------|-------------------|
| **Purpose** | Decisions, approvals, HITL | Monitoring, exploration, proactive |
| **Interaction** | Terminal (confirm ends it) | Ongoing (live, refreshing) |
| **Examples** | `option-list`, `approval-card` | `activity-feed`, `chart`, `stats-display` |
| **Data** | Props passed in | Bound to sources, self-refreshing |
| **Position** | In message flow | Spatial, user/AI arranged |
| **Lifecycle** | Render once → receipt state | Persistent, live updating |

**Rule of thumb**: If it requires a human decision, it's chat-centric. If it displays data to monitor, it's canvas-centric.

Some components could be both (e.g., `data-table` in chat for one-shot display, or on canvas for live monitoring).

---

## Appendix B: Terminology

| Term | Definition |
|------|------------|
| **Chat context** | Component rendered in linear message stream |
| **Canvas context** | Component rendered in spatial, persistent workspace |
| **Data binding** | Declaration of what data a component needs and how to fetch it |
| **Canvas action** | Operation an AI or user can perform on a canvas component |
| **Command** | Immutable description of a mutation (for undo/redo) |
| **Component definition** | Metadata about a component's capabilities |
| **Shape analysis** | Inferring semantic meaning from data structure |
| **Generative UI** | Automatically selecting/composing components for data |
| **Insight loop** | The cycle of correlate → illuminate → trust → act → track → measure → compound |
| **HITL** | Human-in-the-loop (requires human decision to proceed) |
| **Stale** | Data that hasn't been refreshed within its expected interval |
