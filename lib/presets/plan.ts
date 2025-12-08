import type { SerializablePlan } from "@/components/tool-ui/plan";

export interface PlanConfig {
  plan: SerializablePlan;
}

export type PlanPresetName =
  | "simple"
  | "comprehensive"
  | "mixed_states"
  | "all_complete";

const simplePreset: PlanConfig = {
  plan: {
    id: "plan-simple",
    title: "Quick Setup",
    description: "Get started in 3 easy steps",
    showProgress: false,
    todos: [
      { id: "1", label: "Install dependencies", status: "completed" },
      { id: "2", label: "Configure environment", status: "in_progress" },
      { id: "3", label: "Run the app", status: "pending" },
    ],
  },
};

const comprehensivePreset: PlanConfig = {
  plan: {
    id: "plan-comprehensive",
    title: "Feature Implementation Plan",
    description:
      "Step-by-step guide for implementing the new authentication system",
    todos: [
      {
        id: "1",
        label: "Review existing auth flow",
        status: "completed",
        description:
          "Analyzed current session-based auth and identified pain points",
      },
      {
        id: "2",
        label: "Design new token structure",
        status: "completed",
        description: "Created JWT schema with access/refresh token separation",
      },
      {
        id: "3",
        label: "Implement JWT middleware",
        status: "in_progress",
        description: "Adding token validation and refresh logic to API routes",
      },
      { id: "4", label: "Add refresh token logic", status: "pending" },
      { id: "5", label: "Update user model", status: "pending" },
      {
        id: "6",
        label: "Write integration tests",
        status: "pending",
        description: "Cover auth flows, token expiry, and edge cases",
      },
      { id: "7", label: "Update API documentation", status: "pending" },
      { id: "8", label: "Deploy to staging", status: "pending" },
    ],
  },
};

const mixedStatesPreset: PlanConfig = {
  plan: {
    id: "plan-mixed",
    title: "Migration Progress",
    todos: [
      { id: "1", label: "Backup database", status: "completed" },
      { id: "2", label: "Run migration scripts", status: "completed" },
      {
        id: "3",
        label: "Verify data integrity",
        status: "in_progress",
        description: "Running checksums on migrated records",
      },
      {
        id: "4",
        label: "Update legacy endpoints",
        status: "cancelled",
        description: "Decided to deprecate instead of migrate",
      },
      { id: "5", label: "Switch DNS records", status: "pending" },
    ],
  },
};

const allCompletePreset: PlanConfig = {
  plan: {
    id: "plan-all-complete",
    title: "Deployment Complete",
    description: "All steps finished successfully",
    todos: [
      { id: "1", label: "Run pre-flight checks", status: "completed" },
      { id: "2", label: "Deploy to production", status: "completed" },
      { id: "3", label: "Verify health endpoints", status: "completed" },
      { id: "4", label: "Update status page", status: "completed" },
    ],
  },
};

export const planPresets: Record<PlanPresetName, PlanConfig> = {
  simple: simplePreset,
  comprehensive: comprehensivePreset,
  mixed_states: mixedStatesPreset,
  all_complete: allCompletePreset,
};

export const planPresetDescriptions: Record<PlanPresetName, string> = {
  simple: "A minimal plan with 3 todos (no accordion)",
  comprehensive: "Detailed plan with descriptions and timestamp",
  mixed_states: "All 4 status states with expandable details",
  all_complete: "Completion celebration state",
};
