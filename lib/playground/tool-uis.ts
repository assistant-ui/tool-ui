import type { ToolCallMessagePartComponent } from "@assistant-ui/react";

import type { ToolUiId } from "./types";

const registry: Record<ToolUiId, () => Promise<ToolCallMessagePartComponent>> = {
  fallback: () =>
    import("@/app/components/assistant-ui/tool-fallback").then(
      (mod) => mod.ToolFallback,
    ),
};

export const TOOL_UI_REGISTRY = registry;

export const hasToolUi = (uiId: ToolUiId): boolean => uiId in registry;

export const getToolUiLoader = (
  uiId: ToolUiId,
): (() => Promise<ToolCallMessagePartComponent>) =>
  registry[uiId] ?? registry.fallback;
