# OptionList

An inline list for choosing one or many options with a built-in confirm/clear footer. Ships with checkbox (multi) and radio (single) styles and async-friendly confirm handling.

> For quick CTA rows under a component, prefer [Contextual Actions](/docs/contextual-actions). Use OptionList when you need the user to select values before confirming.

## Quick start

```tsx
import { OptionList } from "@/components/tool-ui/option-list";

const options = [
  { id: "csv", label: "CSV" },
  { id: "json", label: "JSON" },
  { id: "xlsx", label: "Excel (XLSX)" },
];

export function ExportSelector() {
  return (
    <OptionList
      options={options}
      selectionMode="multi"
      onConfirm={(ids) => console.log(ids)}
      footerActions={[
        { id: "cancel", label: "Clear", variant: "ghost" },
        { id: "confirm", label: "Export", variant: "default" },
      ]}
    />
  );
}
```

### Custom footer actions

Uses the shared Contextual Actions semantics. Gating (minSelections) still applies to the `confirm` action.

```tsx
<OptionList
  options={options}
  footerActions={[
    { id: "cancel", label: "Reset", variant: "ghost" },
    { id: "confirm", label: "Apply", variant: "default", confirmLabel: "Confirm" },
  ]}
  minSelections={1}
  onConfirm={(ids) => applyFilters(ids)}
  onCancel={() => clearFilters()}
/>
```


### Single-select variant

```tsx
<OptionList
  options={[
    { id: "walk", label: "Walking", description: "Sidewalks preferred" },
    { id: "drive", label: "Driving" },
    { id: "transit", label: "Transit" },
  ]}
  selectionMode="single"
  confirmLabel="Continue"
  onConfirm={(id) => console.log(id)}
/>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ id; label; description?; icon?; disabled? }[]` | — | Items to render. |
| `selectionMode` | `"multi" \| "single"` | `"multi"` | Controls checkbox vs radio behavior. |
| `value` | `string[] \| string \| null` | — | Controlled selection. Arrays for multi; string/null for single. |
| `defaultValue` | `string[] \| string \| null` | — | Uncontrolled initial selection. |
| `onChange` | `(value) => void` | — | Fired on every toggle. |
| `onConfirm` | `(value) => void \| Promise<void>` | — | Fired on confirm. |
| `onCancel` | `() => void` | — | Fired on clear. |
| `footerActions` | `Action[] \| ActionsConfig` | — | Optional custom CTA row; defaults to Cancel/Confirm. Uses shared Contextual Actions semantics (align/layout/confirmTimeout supported). |
| `minSelections` | `number` | `1` | Disables confirm until this count is met. |
| `maxSelections` | `number` | — | Caps selections (auto-set to 1 in `single` mode). |
| `align` | — | — | Removed (footer buttons are right-aligned by default). |
| `layout` | — | — | Removed (options are stacked vertically). |
