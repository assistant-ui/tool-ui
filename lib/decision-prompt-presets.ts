import type { SerializableDecisionPrompt } from "@/components/decision-prompt";

export interface DecisionPromptConfig {
  prompt: SerializableDecisionPrompt;
  // Initial selected action to show receipt state (optional)
  initialSelection?: string;
}

export type DecisionPromptPresetName =
  | "binary"
  | "multi-choice"
  | "destructive"
  | "async"
  | "workflow";

const binaryPreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Mount the 9‑track tape reel?",
    description:
      "Loads the next program into core memory. Mind the write‑protect tab.",
    actions: [
      { id: "cancel", label: "Nevermind", variant: "ghost" },
      { id: "mount", label: "Mount tape", variant: "default" },
    ],
    align: "right",
  },
};

const multiChoicePreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Choose your storage medium:",
    description: "From cards to cloud — pick your era.",
    actions: [
      { id: "cards", label: "Punch cards", variant: "secondary" },
      { id: "floppy", label: "3.5\" floppy", variant: "secondary" },
      { id: "zip", label: "Zip disk", variant: "secondary" },
      { id: "cloud", label: "Cloud", variant: "secondary" },
    ],
    align: "center",
    layout: "stack",
  },
};

const destructivePreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Format the floppy disk?",
    description:
      "This action cannot be undone. All sectors will be erased.",
    actions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      {
        id: "format",
        label: "Format",
        confirmLabel: "Confirm format",
        variant: "destructive",
      },
    ],
    align: "right",
    confirmTimeout: 3000,
  },
};

const asyncPreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Install GNU coreutils?",
    description:
      "Bringing small, sharp tools from terminals past into today’s shell.",
    actions: [
      { id: "cancel", label: "No, cancel", variant: "ghost" },
      { id: "install", label: "Yes, install", variant: "default" },
    ],
    align: "right",
  },
};

const workflowPreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Choose your deployment era:",
    description: "A tour from batch windows to blue/green.",
    actions: [
      { id: "batch", label: "Batch window", variant: "ghost" },
      { id: "ftp", label: "FTP to prod", variant: "secondary" },
      { id: "blue-green", label: "Blue-green", variant: "secondary" },
      { id: "rolling", label: "Rolling update", variant: "default" },
    ],
    align: "right",
    layout: "stack",
  },
};

export const decisionPromptPresets: Record<
  DecisionPromptPresetName,
  DecisionPromptConfig
> = {
  binary: binaryPreset,
  "multi-choice": multiChoicePreset,
  destructive: destructivePreset,
  async: asyncPreset,
  workflow: workflowPreset,
};

export const decisionPromptPresetDescriptions: Record<
  DecisionPromptPresetName,
  string
> = {
  binary: "Simple yes/no with tape-mount nostalgia",
  "multi-choice": "Storage media, from cards to cloud",
  destructive: "Two-stage confirmation for destructive formats",
  async: "Action with loading state (install)",
  workflow: "Deployment eras from batch to blue/green",
};

