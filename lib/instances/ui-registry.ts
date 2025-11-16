import type { ToolCallMessagePartComponent } from "@assistant-ui/react";

import type { InstanceManifest, ToolManifest } from "./schema";

export interface ToolUIRegistration {
  id: string;
  label: string;
  toolName?: string;
  load: () => Promise<ToolCallMessagePartComponent>;
}

export class ToolUIValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(issues.join("; "));
    this.name = "ToolUIValidationError";
  }
}

const createLoader = (loader: () => Promise<ToolCallMessagePartComponent>) => loader;

const registry: Record<string, ToolUIRegistration> = {
  "tool-fallback": {
    id: "tool-fallback",
    label: "Generic Tool Fallback",
    load: createLoader(async () => {
      const mod = await import("@/app/components/assistant-ui/tool-fallback");
      return mod.ToolFallback;
    }),
  },
};

export const listRegisteredToolUIs = (): ToolUIRegistration[] =>
  Object.values(registry);

export const hasToolUI = (uiId: string): boolean => uiId in registry;

export const resolveToolUI = async (uiId: string) => {
  const registration = registry[uiId];
  if (!registration) {
    throw new Error(`Unknown Tool UI "${uiId}"`);
  }
  return registration.load();
};

const validateToolUIReference = (
  source: string,
  uiId: string | undefined,
  issues: string[],
) => {
  if (!uiId) {
    return;
  }
  if (!hasToolUI(uiId)) {
    issues.push(`${source} references unknown UI "${uiId}"`);
  }
};

const validateToolUIArray = (
  source: string,
  uiIds: string[] | undefined,
  issues: string[],
) => {
  if (!uiIds) {
    return;
  }
  uiIds.forEach((uiId) => validateToolUIReference(source, uiId, issues));
};

const validateToolManifest = (tool: ToolManifest, issues: string[]) => {
  validateToolUIReference(`Tool "${tool.name}" defaultUI`, tool.defaultUI, issues);
  validateToolUIArray(`Tool "${tool.name}" uiCandidates`, tool.uiCandidates, issues);
};

export const assertValidToolUIAssignments = (manifest: InstanceManifest) => {
  const issues: string[] = [];

  manifest.tools.forEach((tool) => validateToolManifest(tool, issues));

  Object.entries(manifest.uiMap).forEach(([toolName, uiId]) => {
    if (!hasToolUI(uiId)) {
      issues.push(`uiMap for tool "${toolName}" references unknown UI "${uiId}"`);
      return;
    }

    const tool = manifest.tools.find((candidate) => candidate.name === toolName);
    const expectedToolName = registry[uiId]?.toolName;
    if (expectedToolName && tool && tool.name !== expectedToolName) {
      issues.push(
        `uiMap for tool "${toolName}" uses UI "${uiId}" which is registered for tool "${expectedToolName}"`,
      );
    }
  });

  if (issues.length > 0) {
    throw new ToolUIValidationError(issues);
  }
};


