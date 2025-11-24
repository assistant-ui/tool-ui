import type { SerializableOptionList } from "@/components/tool-ui/option-list";

export interface OptionListConfig {
  optionList: SerializableOptionList;
}

export type OptionListPresetName = "export" | "travel" | "notifications";

const exportPreset: OptionListConfig = {
  optionList: {
    options: [
      { id: "csv", label: "CSV" },
      { id: "json", label: "JSON" },
      { id: "xlsx", label: "Excel (XLSX)" },
      { id: "pdf", label: "PDF" },
    ],
    selectionMode: "multi",
    minSelections: 1,
    maxSelections: 3,
    footerActions: [
      { id: "cancel", label: "Clear", variant: "ghost" },
      { id: "confirm", label: "Export", variant: "default" },
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
      { id: "cancel", label: "Back", variant: "ghost" },
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
  export: "Multi-select with max choices enforced",
  travel: "Single-select with radio styling",
  notifications: "Multi-select with reset/confirm",
};
