import type { SerializableOptionList } from "@/components/tool-ui/option-list";
import type { PresetWithCodeGen } from "./types";

export type OptionListPresetName =
  | "max-selections"
  | "travel"
  | "approval"
  | "receipt"
  | "receipt-multi"
  | "destructive";

function generateOptionListCode(data: SerializableOptionList): string {
  const props: string[] = [];
  const hasChoice = data.choice !== undefined && data.choice !== null;

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

  if (hasChoice) {
    const choiceValue =
      typeof data.choice === "string"
        ? `"${data.choice}"`
        : JSON.stringify(data.choice);
    props.push(`  choice={${choiceValue}}`);
  }

  if (data.actions) {
    props.push(
      `  actions={${JSON.stringify(data.actions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (!hasChoice) {
    props.push(
      `  onAction={(actionId, selection) => {\n    if (actionId === "confirm") {\n      console.log("Selection:", selection);\n    }\n  }}`,
    );
  }

  return `<OptionList\n${props.join("\n")}\n/>`;
}

export const optionListPresets: Record<
  OptionListPresetName,
  PresetWithCodeGen<SerializableOptionList>
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
      actions: [
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
      actions: [
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
      actions: [
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
    description: "Selected travel mode (receipt state)",
    data: {
      id: "option-list-preview-receipt",
      options: [
        {
          id: "walk",
          label: "Walking",
          description: "Sidewalk-friendly route",
        },
        {
          id: "drive",
          label: "Driving",
          description: "Fastest ETA for this route",
        },
        {
          id: "transit",
          label: "Transit",
          description: "Use subway and buses",
        },
      ],
      selectionMode: "single",
      choice: "drive",
    } satisfies SerializableOptionList,
    generateExampleCode: generateOptionListCode,
  },
  "receipt-multi": {
    description: "Selected release checks (receipt state)",
    data: {
      id: "option-list-preview-receipt-multi",
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
          description: "README and API docs are current",
        },
        {
          id: "changelog",
          label: "Changelog Entry Added",
          description: "Version bump is documented",
        },
      ],
      selectionMode: "multi",
      choice: ["code-review", "tests-pass", "docs-updated"],
    } satisfies SerializableOptionList,
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
      actions: [
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
