import type { SerializableOptionList } from "@/components/tool-ui/option-list";

export interface OptionListConfig {
  optionList: SerializableOptionList;
}

export type OptionListPresetName =
  | "export"
  | "travel"
  | "notifications"
  | "receipt"
  | "actions";

const exportPreset: OptionListConfig = {
  optionList: {
    id: "option-list-preview-export",
    options: [
      { id: "good", label: "Good", description: "High quality work" },
      { id: "fast", label: "Fast", description: "Quick turnaround" },
      { id: "cheap", label: "Cheap", description: "Low cost" },
    ],
    selectionMode: "multi",
    minSelections: 1,
    maxSelections: 2,
    footerActions: [
      { id: "cancel", label: "Reset", variant: "secondary" },
      { id: "confirm", label: "Confirm", variant: "default" },
    ],
  },
};

const travelPreset: OptionListConfig = {
  optionList: {
    id: "option-list-preview-travel",
    options: [
      {
        id: "walk",
        label: "Walking",
        description: "Sidewalk-friendly route",
      },
      { id: "drive", label: "Driving", description: "Fastest ETA" },
      {
        id: "transit",
        label: "Transit",
        description: "Use subway and buses",
      },
    ],
    selectionMode: "single",
    footerActions: [
      { id: "cancel", label: "Reset", variant: "ghost" },
      { id: "confirm", label: "Continue", variant: "default" },
    ],
  },
};

const notificationsPreset: OptionListConfig = {
  optionList: {
    id: "option-list-preview-notifications",
    options: [
      { id: "email", label: "Email" },
      { id: "sms", label: "SMS" },
      { id: "push", label: "Push" },
      { id: "slack", label: "Slack" },
    ],
    selectionMode: "multi",
    minSelections: 1,
    maxSelections: 2,
    footerActions: [
      { id: "cancel", label: "Reset", variant: "ghost" },
      { id: "confirm", label: "Save", variant: "default" },
    ],
  },
};

const receiptPreset: OptionListConfig = {
  optionList: {
    id: "option-list-preview-receipt",
    options: [
      {
        id: "walk",
        label: "Walking",
        description: "Sidewalk-friendly route",
      },
      { id: "drive", label: "Driving", description: "Fastest ETA" },
      {
        id: "transit",
        label: "Transit",
        description: "Use subway and buses",
      },
    ],
    selectionMode: "single",
    confirmed: "drive",
  },
};

const actionsPreset: OptionListConfig = {
  optionList: {
    id: "option-list-preview-actions",
    options: [
      {
        id: "immediate",
        label: "Deploy now",
        description: "Push to production immediately",
      },
      {
        id: "scheduled",
        label: "Schedule",
        description: "Set a specific deployment time",
      },
      {
        id: "canary",
        label: "Canary release",
        description: "Roll out to 10% of users first",
      },
    ],
    selectionMode: "single",
    footerActions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      { id: "preview", label: "Preview", variant: "secondary" },
      {
        id: "deploy",
        label: "Deploy",
        confirmLabel: "Confirm deploy",
        variant: "default",
      },
    ],
  },
};

export const optionListPresets: Record<OptionListPresetName, OptionListConfig> =
  {
    export: exportPreset,
    travel: travelPreset,
    notifications: notificationsPreset,
    receipt: receiptPreset,
    actions: actionsPreset,
  };

export const optionListPresetDescriptions: Record<
  OptionListPresetName,
  string
> = {
  export: "Pick two (you can't have all three)",
  travel: "Single-select with radio styling",
  notifications: "Multi-select with reset/confirm",
  receipt: "Confirmed selection (receipt state)",
  actions: "Footer actions with confirmation pattern",
};
