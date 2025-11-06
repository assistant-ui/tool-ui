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
    prompt: "Send this email to 15 participants?",
    description: "This will notify everyone immediately with the meeting details",
    actions: [
      { id: "cancel", label: "Nevermind", variant: "ghost" },
      { id: "send", label: "Yes, send", variant: "default" },
    ],
    align: "right",
  },
};

const multiChoicePreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Choose export format:",
    description: "Data will be exported with current filters applied",
    actions: [
      { id: "csv", label: "CSV", variant: "secondary" },
      { id: "json", label: "JSON", variant: "secondary" },
      { id: "excel", label: "Excel", variant: "secondary" },
      { id: "pdf", label: "PDF", variant: "secondary" },
    ],
    align: "center",
  },
};

const destructivePreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Delete 12 files from the project?",
    description: "This action cannot be undone. Files will be permanently removed.",
    actions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      {
        id: "delete",
        label: "Delete",
        confirmLabel: "Confirm delete",
        variant: "destructive",
      },
    ],
    align: "right",
    confirmTimeout: 3000,
  },
};

const asyncPreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Install 3 packages?",
    description: "npm install lodash react-icons date-fns",
    actions: [
      { id: "cancel", label: "No, cancel", variant: "ghost" },
      { id: "install", label: "Yes, install", variant: "default" },
    ],
    align: "right",
  },
};

const workflowPreset: DecisionPromptConfig = {
  prompt: {
    prompt: "Ready to deploy to production?",
    description: "All tests passed. Choose deployment strategy:",
    actions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      { id: "canary", label: "Canary release", variant: "secondary" },
      { id: "blue-green", label: "Blue-green", variant: "secondary" },
      { id: "rolling", label: "Rolling update", variant: "default" },
    ],
    align: "right",
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
  binary: "Simple yes/no confirmation",
  "multi-choice": "Choose from multiple options",
  destructive: "Two-stage confirmation for dangerous actions",
  async: "Action with loading state",
  workflow: "Multi-option deployment flow",
};
