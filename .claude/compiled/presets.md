# Presets Reference
<!-- @task:write-preset @task:create-examples @task:add-preset @task:example-data @load:presets -->

## Structure

```typescript
import type { PresetWithCodeGen } from "./types";
import type { SerializableName } from "@/components/tool-ui/name";

type NamePreset = PresetWithCodeGen<SerializableName>;

export const namePresets = {
  "preset-key": {
    description: "Human-readable description",
    data: {
      id: "name-preset-key",
      // ... props matching serializable schema
    },
    generateExampleCode: (data) => `<Name
  id="${data.id}"
  // ... format props as JSX
/>`,
  },
} satisfies Record<string, NamePreset>;
```

## Quality Standards

### Quantity
4-5 presets per component, curated not exhaustive.

### Naming
| Good | Bad |
|------|-----|
| `deploy`, `receipt`, `destructive` | `travel`, `shopping` |
| Pattern-descriptive | Domain-specific |
| `with-metadata`, `max-selections` | `example1`, `basic` |

### Preset Strategy
- 3-4 realistic scenarios (different capabilities)
- 1-2 edge cases (destructive, receipt, constraints)

## Believability Test

**Ask: "Would someone actually do this?"**

### Passes
- "Find me flights to Tokyo" → flight results
- "Run the tests" → terminal output
- "Help me pick a movie" → option selection

### Fails
- "Draft a review for that ramen" → X post
- "Show me 30 console.logs" → code block
- "Display categories A, B, C" → chart

## Specificity

| Instead of | Use |
|------------|-----|
| "John Doe" | "Sarah Chen" |
| "Company A" | "Stripe" |
| "Product 1" | "Sony WH-1000XM5" |
| $99.99, $199.99 | $347.50, $89.00 |
| "5 items" | "3 items", "12 items" |

## Anti-Patterns

### Generic Placeholders ❌
- Category A/B/C
- Item 1/2/3
- user1@example.com
- Lorem ipsum

### Mismatched Stakes ❌
- Destructive button for "Remove favorite"
- Casual checkbox for "$50k transfer"
- Approval card for "Enable dark mode"

### Tech Demo Smell ❌
- 30 console.logs (shows collapsibility)
- All 4 status types in one view
- Labels like "highlighted lines example"

## Color Semantics

| Color | Meaning | Use For |
|-------|---------|---------|
| Green (`--chart-1`) | Positive | Revenue up, goals met |
| Red (`--chart-2`) | Negative | Errors, churn, losses |
| Blue (`--chart-3`) | Neutral | Comparisons, baselines |

### Inverse Metrics
- Churn rate down = good = green
- Error rate down = good = green
- Use `upIsPositive: false` on delta

## Voice Guidelines

### Preambles
- **Brief**: 1 sentence max
- **No filler**: Skip "Sure!", "Absolutely!"
- **Match tone**: Professional for business, casual for personal

| Good | Bad |
|------|-----|
| "Here's your spending breakdown." | "I'd be happy to help!" |
| "Found a few options." | "Let me look into that for you." |
| "Tests passed." | "Great news!" |

### User Messages
- Natural phrasing
- Specific enough to justify response
- Varied styles (terse to conversational)

| Good | Bad |
|------|-----|
| "How did I spend money this week?" | "Please generate a bar chart" |
| "Find me flights to Tokyo" | "Flight" |

## Checklist

- [ ] Each preset demonstrates something distinct
- [ ] Believability: Would someone do this?
- [ ] Specificity: No generic placeholders
- [ ] Stakes match UI treatment
- [ ] Color semantics correct
- [ ] Not a tech demo
- [ ] IDs unique: `{name}-{preset-key}`
- [ ] `generateExampleCode` produces valid JSX
