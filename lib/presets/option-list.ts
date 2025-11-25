import type { SerializableOptionList } from "@/components/tool-ui/option-list";

export interface OptionListConfig {
  optionList: SerializableOptionList;
}

export type OptionListPresetName = "export" | "travel" | "notifications";

const exportPreset: OptionListConfig = {
  optionList: {
    options: [
      { id: "good", label: "Good", description: "High quality work" },
      { id: "fast", label: "Fast", description: "Quick turnaround" },
      { id: "cheap", label: "Cheap", description: "Low cost" },
    ],
    selectionMode: "multi",
    minSelections: 1,
    maxSelections: 2,
    footerActions: [
      { id: "cancel", label: "Reset", variant: "ghost" },
      { id: "confirm", label: "Confirm", variant: "default" },
    ],
  },
};

const travelPreset: OptionListConfig = {
  optionList: {
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

export const optionListPresets: Record<OptionListPresetName, OptionListConfig> =
  {
    export: exportPreset,
    travel: travelPreset,
    notifications: notificationsPreset,
  };

export const optionListPresetDescriptions: Record<
  OptionListPresetName,
  string
> = {
  export: "Pick two (you can't have all three)",
  travel: "Single-select with radio styling",
  notifications: "Multi-select with reset/confirm",
};
