# Unified Receipt Prop: `choice`

## Problem

Receipt state props are inconsistent across components:

| Component | Current Prop | Type |
|-----------|--------------|------|
| OptionList | `confirmed` | `string \| string[] \| null` |
| ApprovalCard | `decision` | `"approved" \| "denied"` |
| OrderSummary | `decision` | `{ orderId?, confirmedAt? }` |
| PreferencesPanel | `confirmed` | `Record<string, string \| boolean>` |

This creates confusion for:
- API consumers (different prop names per component)
- LLM serialization (unpredictable schema)
- Code readability (inconsistent patterns)

## Solution

Unify under a single prop name: **`choice`**

```tsx
<ApprovalCard choice="approved" />
<OptionList choice="option-a" />
<OptionList choice={["option-a", "option-b"]} selectionMode="multiple" />
<PreferencesPanel choice={{ theme: "dark", notifications: true }} />
<OrderSummary choice={{ orderId: "ORD-123", confirmedAt: "2025-01-19T10:00:00Z" }} />
```

### Why `choice`

- Semantically clear: "the user's choice"
- Works across all component types (selections, approvals, settings)
- Won't conflict with likely values (unlike `confirmed` which could be a value)
- Neutral term that doesn't imply positive/negative outcome

## Changes

### Schema Updates

**approval-card/schema.ts**
- Rename `decision` → `choice`
- Type remains: `"approved" | "denied" | undefined`

**option-list/schema.ts**
- Rename `confirmed` → `choice`
- Type remains: `string | string[] | null | undefined`

**preferences-panel/schema.ts**
- Rename `confirmed` → `choice`
- Type remains: `Record<string, string | boolean> | undefined`

**order-summary/schema.ts**
- Rename `decision` → `choice`
- Type remains: `{ orderId?: string; confirmedAt?: string } | undefined`

### Component Updates

Each component's main file needs:
1. Prop rename in interface
2. Destructuring update
3. Internal usage update

### Documentation Updates

- `app/docs/receipts/content.mdx` - Update prop reference table
- Individual component docs - Update examples
- Preset files if they reference these props

## Migration

**Clean break** — no deprecation period. This is a young library; users can find/replace:
- `decision=` → `choice=`
- `confirmed=` → `choice=`

## Files to Change

1. `components/tool-ui/approval-card/schema.ts`
2. `components/tool-ui/approval-card/approval-card.tsx`
3. `components/tool-ui/option-list/schema.ts`
4. `components/tool-ui/option-list/option-list.tsx`
5. `components/tool-ui/preferences-panel/schema.ts`
6. `components/tool-ui/preferences-panel/preferences-panel.tsx`
7. `components/tool-ui/order-summary/schema.ts`
8. `components/tool-ui/order-summary/order-summary.tsx`
9. `app/docs/receipts/content.mdx`
10. Any preset files using these props
