import type { SerializableOptionList } from "@/components/tool-ui/option-list";

export interface OptionListConfig {
  optionList: SerializableOptionList;
}

export type OptionListPresetName =
  | "export"
  | "travel"
  | "notifications"
  | "receipt"
  | "actions"
  // New presets
  | "approval"     // All required (checklist)
  | "priority"     // Single with impact levels
  | "wizard"       // Back/Next navigation
  | "destructive"  // Delete confirmation
  | "settings"     // Multi-select preferences
  | "ranking"      // Single with order info
  | "edgeCases";   // Disabled, long text

const exportPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-export",
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
    surfaceId: "option-list-preview-travel",
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
    surfaceId: "option-list-preview-notifications",
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
    surfaceId: "option-list-preview-receipt",
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
    surfaceId: "option-list-preview-actions",
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

// ============================================================
// APPROVAL CHECKLIST (All items required)
// ============================================================
const approvalPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-approval",
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
    minSelections: 4, // All required
    footerActions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      {
        id: "approve",
        label: "Approve Release",
        confirmLabel: "Confirm Release",
        variant: "default",
      },
    ],
  },
};

// ============================================================
// PRIORITY SELECTION (Impact levels with destructive)
// ============================================================
const priorityPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-priority",
    options: [
      {
        id: "p0",
        label: "P0 - Critical",
        description: "Production is down, immediate action required",
      },
      {
        id: "p1",
        label: "P1 - High",
        description: "Major functionality impacted, fix within 24h",
      },
      {
        id: "p2",
        label: "P2 - Medium",
        description: "Workaround available, fix within 1 week",
      },
      {
        id: "p3",
        label: "P3 - Low",
        description: "Minor issue, fix when convenient",
      },
    ],
    selectionMode: "single",
    footerActions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      { id: "set", label: "Set Priority", variant: "default" },
    ],
  },
};

// ============================================================
// WIZARD NAVIGATION (Back/Next pattern)
// ============================================================
const wizardPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-wizard",
    options: [
      {
        id: "new",
        label: "Create New Project",
        description: "Start from scratch with our templates",
      },
      {
        id: "import",
        label: "Import Existing",
        description: "Bring in code from GitHub, GitLab, or Bitbucket",
      },
      {
        id: "clone",
        label: "Clone Template",
        description: "Fork one of our starter templates",
      },
    ],
    selectionMode: "single",
    footerActions: [
      { id: "back", label: "Back", variant: "ghost" },
      { id: "next", label: "Next Step", variant: "default" },
    ],
  },
};

// ============================================================
// DESTRUCTIVE CONFIRMATION (Delete with safeguards)
// ============================================================
const destructivePreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-destructive",
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
    footerActions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      {
        id: "confirm",
        label: "Delete",
        confirmLabel: "Confirm Delete",
        variant: "destructive",
      },
    ],
  },
};

// ============================================================
// SETTINGS PREFERENCES (Multi-select toggles)
// ============================================================
const settingsPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-settings",
    options: [
      {
        id: "dark-mode",
        label: "Dark Mode",
        description: "Use dark theme throughout the application",
      },
      {
        id: "notifications",
        label: "Push Notifications",
        description: "Receive alerts on your device",
      },
      {
        id: "analytics",
        label: "Usage Analytics",
        description: "Help us improve by sharing anonymous usage data",
      },
      {
        id: "beta",
        label: "Beta Features",
        description: "Get early access to experimental features",
      },
    ],
    selectionMode: "multi",
    footerActions: [
      { id: "reset", label: "Reset to Defaults", variant: "ghost" },
      { id: "save", label: "Save Preferences", variant: "default" },
    ],
  },
};

// ============================================================
// RANKING SELECTION (Ordered options)
// ============================================================
const rankingPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-ranking",
    options: [
      {
        id: "first",
        label: "1st Choice: ENIAC",
        description: "First general-purpose electronic computer",
      },
      {
        id: "second",
        label: "2nd Choice: UNIVAC",
        description: "First commercial computer in the US",
      },
      {
        id: "third",
        label: "3rd Choice: IBM 701",
        description: "IBM's first commercial scientific computer",
      },
    ],
    selectionMode: "single",
    footerActions: [
      { id: "clear", label: "Clear", variant: "ghost" },
      { id: "submit", label: "Submit Vote", variant: "default" },
    ],
  },
};

// ============================================================
// EDGE CASES (Disabled options, long text)
// ============================================================
const edgeCasesPreset: OptionListConfig = {
  optionList: {
    surfaceId: "option-list-preview-edge-cases",
    options: [
      {
        id: "enabled",
        label: "Enabled Option",
        description: "This option can be selected normally",
      },
      {
        id: "disabled",
        label: "Disabled Option",
        description: "This option is disabled and cannot be selected",
        disabled: true,
      },
      {
        id: "long-text",
        label: "Option with Very Long Label That Should Wrap or Truncate Gracefully",
        description: "This description is also quite long to test how the component handles text overflow and wrapping in both the label and description areas of an option item.",
      },
      {
        id: "no-description",
        label: "Option Without Description",
      },
    ],
    selectionMode: "multi",
    maxSelections: 2,
    footerActions: [
      { id: "cancel", label: "Cancel", variant: "ghost" },
      { id: "confirm", label: "Confirm", variant: "default" },
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
    // New presets
    approval: approvalPreset,
    priority: priorityPreset,
    wizard: wizardPreset,
    destructive: destructivePreset,
    settings: settingsPreset,
    ranking: rankingPreset,
    edgeCases: edgeCasesPreset,
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
  // New descriptions
  approval: "Release checklist (all items required)",
  priority: "Bug priority levels with impact descriptions",
  wizard: "Step navigation with back/next",
  destructive: "Delete confirmation with safeguards",
  settings: "User preferences toggles",
  ranking: "Ordered choice selection",
  edgeCases: "Disabled options, long text, missing descriptions",
};
