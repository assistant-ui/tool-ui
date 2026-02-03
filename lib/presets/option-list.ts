import type {
  SerializableOptionList,
  SerializableOptionListReceipt,
} from "@/components/tool-ui/option-list";
import type { PresetWithCodeGen } from "./types";

export type OptionListPresetName =
  | "max-selections"
  | "travel"
  | "approval"
  | "receipt"
  | "destructive";

type OptionListPresetData =
  | SerializableOptionList
  | SerializableOptionListReceipt;

function generateOptionListCode(data: OptionListPresetData): string {
  const props: string[] = [];

  props.push(
    `  options={${JSON.stringify(data.options, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.selectionMode && data.selectionMode !== "multi") {
    props.push(`  selectionMode="${data.selectionMode}"`);
  }

  if (data.minSelections && data.minSelections !== 1) {
    props.push(`  minSelections={${data.minSelections}}`);
  }

  if (data.maxSelections) {
    props.push(`  maxSelections={${data.maxSelections}}`);
  }

  if ("choice" in data) {
    props.push(`  choice="${data.choice}"`);
    return `<OptionListReceipt\n${props.join("\n")}\n/>`;
  }

  if (data.responseActions) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  props.push(
    `  onConfirm={(selection) => {\n    console.log("Selection:", selection);\n  }}`,
  );

  return `<OptionList\n${props.join("\n")}\n/>`;
}

export const optionListPresets: Record<
  OptionListPresetName,
  PresetWithCodeGen<OptionListPresetData>
> = {
  "max-selections": {
    description: "Pick two (you can't have all three)",
    data: {
      id: "option-list-preview-max-selections",
      options: [
        { id: "good", label: "Good", description: "High quality work" },
        { id: "fast", label: "Fast", description: "Quick turnaround" },
        { id: "cheap", label: "Cheap", description: "Low cost" },
      ],
      selectionMode: "multi",
      minSelections: 1,
      maxSelections: 2,
      responseActions: [
        { id: "cancel", label: "Reset" },
        { id: "confirm", label: "Confirm", variant: "default" },
      ],
    } satisfies SerializableOptionList,
    generateExampleCode: generateOptionListCode,
  },
  travel: {
    description: "Single-select with radio styling",
    data: {
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
      responseActions: [
        { id: "cancel", label: "Reset" },
        { id: "confirm", label: "Continue", variant: "default" },
      ],
    } satisfies SerializableOptionList,
    generateExampleCode: generateOptionListCode,
  },
  approval: {
    description: "Release checklist (all items required)",
    data: {
      id: "option-list-preview-approval",
      options: [
        {
          id: "code-review",
          label: "Code Review Complete",
          description: "All reviewers have approved",
        },
        {
          id: "tests-pass",
          label: "Tests Passing",
          description: "CI pipeline is green",
        },
        {
          id: "docs-updated",
          label: "Documentation Updated",
          description: "README and API docs current",
        },
        {
          id: "changelog",
          label: "Changelog Entry Added",
          description: "Version bump noted",
        },
      ],
      selectionMode: "multi",
      minSelections: 4,
      responseActions: [
        { id: "cancel", label: "Cancel" },
        {
          id: "confirm",
          label: "Approve Release",
          confirmLabel: "Confirm Release",
          variant: "default",
        },
      ],
    } satisfies SerializableOptionList,
    generateExampleCode: generateOptionListCode,
  },
  receipt: {
    description: "Confirmed selection (receipt state)",
    data: {
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
      choice: "drive",
    } satisfies SerializableOptionListReceipt,
    generateExampleCode: generateOptionListCode,
  },
  destructive: {
    description: "Delete confirmation with safeguards",
    data: {
      id: "option-list-preview-destructive",
      options: [
        {
          id: "soft-delete",
          label: "Move to Trash",
          description: "Can be restored within 30 days",
        },
        {
          id: "hard-delete",
          label: "Delete Permanently",
          description: "Cannot be undone, all data will be lost",
        },
        {
          id: "archive",
          label: "Archive Instead",
          description: "Hide from view but keep all data",
        },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "cancel", label: "Cancel" },
        {
          id: "confirm",
          label: "Delete",
          confirmLabel: "Confirm Delete",
          variant: "destructive",
        },
      ],
    } satisfies SerializableOptionList,
    generateExampleCode: generateOptionListCode,
  },
};
