import type {
  SerializablePreferencesPanel,
  SerializablePreferencesReceipt,
} from "@/components/tool-ui/preferences-panel";
import type { PresetWithCodeGen } from "./types";

export type PreferencesPanelPresetName =
  | "notifications"
  | "privacy"
  | "appearance"
  | "workflow"
  | "receipt"
  | "error";

type PreferencesPanelPresetData =
  | SerializablePreferencesPanel
  | SerializablePreferencesReceipt;

function generatePreferencesPanelCode(data: PreferencesPanelPresetData): string {
  const props: string[] = [];

  if (data.title) {
    props.push(`  title="${data.title}"`);
  }

  props.push(
    `  sections={${JSON.stringify(data.sections, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if ("choice" in data) {
    props.push(
      `  choice={${JSON.stringify(data.choice, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    if (data.error) {
      props.push(
        `  error={${JSON.stringify(data.error, null, 4).replace(/\n/g, "\n  ")}}`,
      );
    }
    return `<PreferencesPanelReceipt\n${props.join("\n")}\n/>`;
  }

  if (data.responseActions) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  props.push(
    `  onSave={(values) => {\n    console.log("Saved:", values);\n  }}`,
  );
  props.push(
    `  onCancel={() => {\n    console.log("Cancelled");\n  }}`,
  );

  return `<PreferencesPanel\n${props.join("\n")}\n/>`;
}

export const preferencesPanelPresets: Record<
  PreferencesPanelPresetName,
  PresetWithCodeGen<PreferencesPanelPresetData>
> = {
  "notifications": {
    description: "Basic notification preferences with switches",
    data: {
      id: "preferences-panel-preview-notifications",
      sections: [
        {
          items: [
            {
              id: "email-notifications",
              label: "Email Notifications",
              description: "Receive updates via email",
              type: "switch",
              defaultChecked: true,
            },
            {
              id: "push-notifications",
              label: "Push Notifications",
              description: "Mobile and desktop alerts",
              type: "switch",
              defaultChecked: false,
            },
            {
              id: "weekly-digest",
              label: "Weekly Digest",
              description: "Summary of activity every Monday",
              type: "switch",
              defaultChecked: true,
            },
          ],
        },
      ],
    } satisfies SerializablePreferencesPanel,
    generateExampleCode: generatePreferencesPanelCode,
  },
  "privacy": {
    description: "Multi-section settings with headings and mixed controls",
    data: {
      id: "preferences-panel-preview-privacy",
      title: "Privacy Settings",
      sections: [
        {
          heading: "Visibility",
          items: [
            {
              id: "profile-visibility",
              label: "Profile Visibility",
              description: "Who can see your profile",
              type: "toggle",
              options: [
                { value: "public", label: "Public" },
                { value: "connections", label: "Friends" },
                { value: "private", label: "Private" },
              ],
              defaultValue: "connections",
            },
            {
              id: "activity-status",
              label: "Activity Status",
              description: "Show when you're active",
              type: "switch",
              defaultChecked: true,
            },
          ],
        },
        {
          heading: "Data",
          items: [
            {
              id: "analytics",
              label: "Usage Analytics",
              description: "Help improve our service",
              type: "switch",
              defaultChecked: false,
            },
          ],
        },
      ],
    } satisfies SerializablePreferencesPanel,
    generateExampleCode: generatePreferencesPanelCode,
  },
  "appearance": {
    description: "Mixed control types: toggle and select",
    data: {
      id: "preferences-panel-preview-appearance",
      sections: [
        {
          items: [
            {
              id: "theme",
              label: "Theme",
              description: "Choose your color scheme",
              type: "toggle",
              options: [
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto" },
              ],
              defaultValue: "auto",
            },
            {
              id: "font-size",
              label: "Font Size",
              description: "Adjust text size",
              type: "select",
              selectOptions: [
                { value: "xs", label: "Extra Small" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
                { value: "xl", label: "Extra Large" },
              ],
              defaultSelected: "md",
            },
            {
              id: "compact-mode",
              label: "Compact Mode",
              description: "Reduce spacing for more content",
              type: "switch",
              defaultChecked: false,
            },
          ],
        },
      ],
    } satisfies SerializablePreferencesPanel,
    generateExampleCode: generatePreferencesPanelCode,
  },
  "workflow": {
    description: "Workflow automation settings with select dropdown",
    data: {
      id: "preferences-panel-preview-workflow",
      title: "Automation Settings",
      sections: [
        {
          items: [
            {
              id: "auto-assign",
              label: "Auto-Assign Tasks",
              description: "Automatically assign based on workload",
              type: "switch",
              defaultChecked: true,
            },
            {
              id: "default-priority",
              label: "Default Priority",
              description: "Priority for new tasks",
              type: "select",
              selectOptions: [
                { value: "critical", label: "Critical" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
                { value: "backlog", label: "Backlog" },
              ],
              defaultSelected: "medium",
            },
            {
              id: "notification-timing",
              label: "Notification Timing",
              description: "When to send reminders",
              type: "toggle",
              options: [
                { value: "instant", label: "Instant" },
                { value: "hourly", label: "Hourly" },
                { value: "daily", label: "Daily" },
              ],
              defaultValue: "instant",
            },
          ],
        },
      ],
    } satisfies SerializablePreferencesPanel,
    generateExampleCode: generatePreferencesPanelCode,
  },
  "receipt": {
    description: "Confirmed preferences in receipt state",
    data: {
      id: "preferences-panel-preview-receipt",
      title: "Privacy Settings",
      sections: [
        {
          heading: "Visibility",
          items: [
            {
              id: "profile-visibility",
              label: "Profile Visibility",
              description: "Who can see your profile",
              type: "toggle",
              options: [
                { value: "public", label: "Public" },
                { value: "connections", label: "Friends" },
                { value: "private", label: "Private" },
              ],
              defaultValue: "connections",
            },
            {
              id: "activity-status",
              label: "Activity Status",
              description: "Show when you're active",
              type: "switch",
              defaultChecked: true,
            },
          ],
        },
        {
          heading: "Data",
          items: [
            {
              id: "analytics",
              label: "Usage Analytics",
              description: "Help improve our service",
              type: "switch",
              defaultChecked: false,
            },
          ],
        },
      ],
      choice: {
        "profile-visibility": "private",
        "activity-status": false,
        "analytics": false,
      },
    } satisfies SerializablePreferencesReceipt,
    generateExampleCode: generatePreferencesPanelCode,
  },
  "error": {
    description: "Partial save with errors showing failed fields",
    data: {
      id: "preferences-panel-preview-error",
      title: "Privacy Settings",
      sections: [
        {
          heading: "Visibility",
          items: [
            {
              id: "profile-visibility",
              label: "Profile Visibility",
              description: "Who can see your profile",
              type: "toggle",
              options: [
                { value: "public", label: "Public" },
                { value: "connections", label: "Friends" },
                { value: "private", label: "Private" },
              ],
              defaultValue: "connections",
            },
            {
              id: "activity-status",
              label: "Activity Status",
              description: "Show when you're active",
              type: "switch",
              defaultChecked: true,
            },
          ],
        },
        {
          heading: "Data",
          items: [
            {
              id: "analytics",
              label: "Usage Analytics",
              description: "Help improve our service",
              type: "switch",
              defaultChecked: false,
            },
          ],
        },
      ],
      choice: {
        "profile-visibility": "private",
        "activity-status": false,
        "analytics": false,
      },
      error: {
        "analytics": "Analytics requires accepting Terms of Service",
      },
    } satisfies SerializablePreferencesReceipt,
    generateExampleCode: generatePreferencesPanelCode,
  },
};
