import type { SerializableOptionList } from "@/components/tool-ui/option-list";
import type { Preset } from "./types";

export type OptionListPresetName =
  | "export"
  | "travel"
  | "notifications"
  | "receipt"
  | "actions"
  | "approval"
  | "priority"
  | "wizard"
  | "destructive"
  | "settings"
  | "ranking"
  | "edgeCases";

export const optionListPresets: Record<OptionListPresetName, Preset<SerializableOptionList>> = {
  export: {
    description: "Pick two (you can't have all three)",
    data: {
      id: "option-list-preview-export",
      options: [
        { id: "good", label: "Good", description: "High quality work" },
        { id: "fast", label: "Fast", description: "Quick turnaround" },
        { id: "cheap", label: "Cheap", description: "Low cost" },
      ],
      selectionMode: "multi",
      minSelections: 1,
      maxSelections: 2,
      responseActions: [
        { id: "cancel", label: "Reset", variant: "secondary" },
        { id: "confirm", label: "Confirm", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  travel: {
    description: "Single-select with radio styling",
    data: {
      id: "option-list-preview-travel",
      options: [
        { id: "walk", label: "Walking", description: "Sidewalk-friendly route" },
        { id: "drive", label: "Driving", description: "Fastest ETA" },
        { id: "transit", label: "Transit", description: "Use subway and buses" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "cancel", label: "Reset", variant: "ghost" },
        { id: "confirm", label: "Continue", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  notifications: {
    description: "Multi-select with reset/confirm",
    data: {
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
      responseActions: [
        { id: "cancel", label: "Reset", variant: "ghost" },
        { id: "confirm", label: "Save", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  receipt: {
    description: "Confirmed selection (receipt state)",
    data: {
      id: "option-list-preview-receipt",
      options: [
        { id: "walk", label: "Walking", description: "Sidewalk-friendly route" },
        { id: "drive", label: "Driving", description: "Fastest ETA" },
        { id: "transit", label: "Transit", description: "Use subway and buses" },
      ],
      selectionMode: "single",
      confirmed: "drive",
    } satisfies SerializableOptionList,
  },
  actions: {
    description: "Response actions with confirmation pattern",
    data: {
      id: "option-list-preview-actions",
      options: [
        { id: "immediate", label: "Deploy now", description: "Push to production immediately" },
        { id: "scheduled", label: "Schedule", description: "Set a specific deployment time" },
        { id: "canary", label: "Canary release", description: "Roll out to 10% of users first" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "preview", label: "Preview", variant: "secondary" },
        { id: "deploy", label: "Deploy", confirmLabel: "Confirm deploy", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  approval: {
    description: "Release checklist (all items required)",
    data: {
      id: "option-list-preview-approval",
      options: [
        { id: "code-review", label: "Code Review Complete", description: "All reviewers have approved" },
        { id: "tests-pass", label: "Tests Passing", description: "CI pipeline is green" },
        { id: "docs-updated", label: "Documentation Updated", description: "README and API docs current" },
        { id: "changelog", label: "Changelog Entry Added", description: "Version bump noted" },
      ],
      selectionMode: "multi",
      minSelections: 4,
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "approve", label: "Approve Release", confirmLabel: "Confirm Release", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  priority: {
    description: "Bug priority levels with impact descriptions",
    data: {
      id: "option-list-preview-priority",
      options: [
        { id: "p0", label: "P0 - Critical", description: "Production is down, immediate action required" },
        { id: "p1", label: "P1 - High", description: "Major functionality impacted, fix within 24h" },
        { id: "p2", label: "P2 - Medium", description: "Workaround available, fix within 1 week" },
        { id: "p3", label: "P3 - Low", description: "Minor issue, fix when convenient" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "set", label: "Set Priority", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  wizard: {
    description: "Step navigation with back/next",
    data: {
      id: "option-list-preview-wizard",
      options: [
        { id: "new", label: "Create New Project", description: "Start from scratch with our templates" },
        { id: "import", label: "Import Existing", description: "Bring in code from GitHub, GitLab, or Bitbucket" },
        { id: "clone", label: "Clone Template", description: "Fork one of our starter templates" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "back", label: "Back", variant: "ghost" },
        { id: "next", label: "Next Step", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  destructive: {
    description: "Delete confirmation with safeguards",
    data: {
      id: "option-list-preview-destructive",
      options: [
        { id: "soft-delete", label: "Move to Trash", description: "Can be restored within 30 days" },
        { id: "hard-delete", label: "Delete Permanently", description: "Cannot be undone, all data will be lost" },
        { id: "archive", label: "Archive Instead", description: "Hide from view but keep all data" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "confirm", label: "Delete", confirmLabel: "Confirm Delete", variant: "destructive" },
      ],
    } satisfies SerializableOptionList,
  },
  settings: {
    description: "User preferences toggles",
    data: {
      id: "option-list-preview-settings",
      options: [
        { id: "dark-mode", label: "Dark Mode", description: "Use dark theme throughout the application" },
        { id: "notifications", label: "Push Notifications", description: "Receive alerts on your device" },
        { id: "analytics", label: "Usage Analytics", description: "Help us improve by sharing anonymous usage data" },
        { id: "beta", label: "Beta Features", description: "Get early access to experimental features" },
      ],
      selectionMode: "multi",
      responseActions: [
        { id: "reset", label: "Reset to Defaults", variant: "ghost" },
        { id: "save", label: "Save Preferences", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  ranking: {
    description: "Ordered choice selection",
    data: {
      id: "option-list-preview-ranking",
      options: [
        { id: "first", label: "1st Choice: ENIAC", description: "First general-purpose electronic computer" },
        { id: "second", label: "2nd Choice: UNIVAC", description: "First commercial computer in the US" },
        { id: "third", label: "3rd Choice: IBM 701", description: "IBM's first commercial scientific computer" },
      ],
      selectionMode: "single",
      responseActions: [
        { id: "clear", label: "Clear", variant: "ghost" },
        { id: "submit", label: "Submit Vote", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
  edgeCases: {
    description: "Disabled options, long text, missing descriptions",
    data: {
      id: "option-list-preview-edge-cases",
      options: [
        { id: "enabled", label: "Enabled Option", description: "This option can be selected normally" },
        { id: "disabled", label: "Disabled Option", description: "This option is disabled and cannot be selected", disabled: true },
        { id: "long-text", label: "Option with Very Long Label That Should Wrap or Truncate Gracefully", description: "This description is also quite long to test how the component handles text overflow and wrapping in both the label and description areas of an option item." },
        { id: "no-description", label: "Option Without Description" },
      ],
      selectionMode: "multi",
      maxSelections: 2,
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "confirm", label: "Confirm", variant: "default" },
      ],
    } satisfies SerializableOptionList,
  },
};
