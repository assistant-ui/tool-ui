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
    layout: "stack",
    confirmLabel: "Export",
    cancelLabel: "Clear",
    minSelections: 1,
    maxSelections: 3,
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
    align: "center",
    confirmLabel: "Continue",
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
    align: "left",
    confirmLabel: "Save",
    cancelLabel: "Reset",
    minSelections: 1,
    maxSelections: 2,
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
  notifications: "Multi-select aligned to the left with reset/confirm",
};
