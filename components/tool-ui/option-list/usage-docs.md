# OptionList

An inline list for choosing one or many options with a built-in confirm/clear footer. Ships with checkbox (multi) and radio (single) styles and async-friendly confirm handling.

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
      confirmLabel="Export"
      cancelLabel="Clear"
      onConfirm={(ids) => console.log(ids)}
    />
  );
}
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
| `confirmLabel` | `string` | `"Confirm"` | Confirm button text. |
| `cancelLabel` | `string` | `"Clear"` | Cancel/clear button text. |
| `minSelections` | `number` | `1` | Disables confirm until this count is met. |
| `maxSelections` | `number` | — | Caps selections (auto-set to 1 in `single` mode). |
| `align` | `"left" \| "center" \| "right"` | `"right"` | Footer button alignment. |
| `layout` | `"inline" \| "stack"` | `"inline"` | Stack options or allow inline wrap on wide containers. |
