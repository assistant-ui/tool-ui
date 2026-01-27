# Component Creation Reference
<!-- @task:new-component @task:implement-component @task:add-component @task:create-component @load:component-creation -->

## Workflow
```
/generate-tool-ui → designer → implementer → (examples ∥ documenter) → reviewer
```

## File Creation Order

### 1. `_adapter.tsx`
```tsx
export { Button } from "@/components/ui/button";
export { cn } from "@/lib/utils";
// ... shadcn components needed
```

### 2. `schema.ts`
```tsx
import { z } from "zod";
import { ToolUIIdSchema, ToolUIRoleSchema } from "../shared/schema";
import { parseWithSchema } from "../shared/parse";

// ⚠️ NO .default() on fields!
export const SerializableNameSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  // ... fields
});

export type SerializableName = z.infer<typeof SerializableNameSchema>;

export function parseSerializableName(input: unknown): SerializableName {
  return parseWithSchema(SerializableNameSchema, input, "Name");
}

export interface NameProps extends SerializableName {
  className?: string;
  isLoading?: boolean;
  responseActions?: Array<{
    id: string;
    label: string;
    variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
    disabled?: boolean;
  }>;
  onResponseAction?: (actionId: string) => void;
}
```

### 3. `{name}.tsx`
```tsx
"use client";
import * as React from "react";
import { cn, Button } from "./_adapter";
import type { NameProps } from "./schema";
import { ActionButtons } from "../shared";

export function Name({ id, className, ...props }: NameProps) {
  const handleAction = useCallback(
    async (actionId: string) => {
      await onResponseAction?.(actionId);
    },
    [onResponseAction]
  );

  return (
    <article
      data-slot="name"
      data-tool-ui-id={id}
      className={cn("min-w-80 max-w-md ...", className)}
    >
      {/* content */}
      <div className="@container/actions">
        <ActionButtons actions={actions} onAction={handleAction} />
      </div>
    </article>
  );
}

export function NameProgress({ className }: { className?: string }) {
  return (
    <div data-slot="name-progress" aria-busy="true" className={cn("...", className)}>
      {/* skeleton */}
    </div>
  );
}
```

### 4. `error-boundary.tsx`
```tsx
"use client";
import * as React from "react";
import { ToolUIErrorBoundary } from "../shared";

export function NameErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ToolUIErrorBoundary componentName="Name">
      {children}
    </ToolUIErrorBoundary>
  );
}
```

### 5. `index.tsx`
```tsx
export { Name, NameProgress } from "./name";
export { NameErrorBoundary } from "./error-boundary";
export {
  SerializableNameSchema,
  parseSerializableName,
  type SerializableName,
  type NameProps,
} from "./schema";
```

## Registration (All Required!)

### `lib/docs/component-registry.ts`
```typescript
{ id: "name", label: "Name", description: "...", path: "/docs/name" },
```

### `lib/docs/preview-config.tsx`
1. Add `"name"` to `ComponentId` type
2. Add import for component + presets
3. Add entry to `previewConfigs`

### `app/docs/_components/preset-selector.tsx`
```typescript
import { namePresets } from "@/lib/presets/name";
// In PRESET_REGISTRY:
"name": namePresets,
```

## Key Patterns

### Unified Receipt Rendering
```tsx
// ✅ Single component with isReceipt flag
function ItemRow({ item, isReceipt = false }) {
  return (
    <div className="py-3">
      {isReceipt ? <span>{item.label}</span> : <Label>{item.label}</Label>}
    </div>
  );
}

// ❌ NEVER separate Receipt/Confirmation components
```

### Loading States
- `isLoading` = after user action (button click)
- `NameProgress` = rarely needed (data triggers render)
- No "loading" presets (component doesn't exist without data)

## Reference Components
- Comprehensive: `option-list/`
- With actions: `approval-card/`
- With receipt: `preferences-panel/`
