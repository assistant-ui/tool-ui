import type { SerializablePlan } from "@/components/tool-ui/plan";
import type { PresetWithCodeGen } from "./types";

export type PlanPresetName = "simple" | "comprehensive" | "mixed_states" | "all_complete" | "with-actions";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function generatePlanCode(data: SerializablePlan): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  title="${escape(data.title)}"`);

  if (data.description) {
    props.push(`  description="${escape(data.description)}"`);
  }

  props.push(
    `  todos={${JSON.stringify(data.todos, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.maxVisibleTodos) {
    props.push(`  maxVisibleTodos={${data.maxVisibleTodos}}`);
  }

  if (data.showProgress === false) {
    props.push(`  showProgress={false}`);
  }

  if (data.responseActions && Array.isArray(data.responseActions) && data.responseActions.length > 0) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
    props.push(`  onResponseAction={(id) => console.log("Action:", id)}`);
  }

  return `<Plan\n${props.join("\n")}\n/>`;
}

export const planPresets: Record<PlanPresetName, PresetWithCodeGen<SerializablePlan>> = {
  simple: {
    description: "A minimal plan with 3 todos (no progress bar)",
    data: {
      id: "plan-simple",
      title: "Quick Setup",
      description: "Get started in 3 easy steps",
      showProgress: false,
      todos: [
        { id: "1", label: "Install dependencies", status: "completed" },
        { id: "2", label: "Configure environment", status: "in_progress" },
        { id: "3", label: "Run the app", status: "pending" },
      ],
    } satisfies SerializablePlan,
    generateExampleCode: generatePlanCode,
  },
  comprehensive: {
    description: "Detailed plan with descriptions and progress bar",
    data: {
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
    } satisfies SerializablePlan,
    generateExampleCode: generatePlanCode,
  },
  mixed_states: {
    description: "All 4 status states with expandable details",
    data: {
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
    } satisfies SerializablePlan,
    generateExampleCode: generatePlanCode,
  },
  all_complete: {
    description: "Completion celebration state",
    data: {
      id: "plan-all-complete",
      title: "Deployment Complete",
      description: "All steps finished successfully",
      todos: [
        { id: "1", label: "Run pre-flight checks", status: "completed" },
        { id: "2", label: "Deploy to production", status: "completed" },
        { id: "3", label: "Verify health endpoints", status: "completed" },
        { id: "4", label: "Update status page", status: "completed" },
      ],
    } satisfies SerializablePlan,
    generateExampleCode: generatePlanCode,
  },
  "with-actions": {
    description: "Plan with response action buttons",
    data: {
      id: "plan-with-actions",
      title: "Refactoring Plan",
      description: "Steps to improve code quality",
      showProgress: false,
      todos: [
        { id: "1", label: "Identify duplicated code", status: "pending" },
        { id: "2", label: "Extract shared utilities", status: "pending" },
        { id: "3", label: "Update imports", status: "pending" },
        { id: "4", label: "Run tests", status: "pending" },
      ],
      responseActions: [
        { id: "modify", label: "Request Changes", variant: "outline" },
        { id: "approve", label: "Approve Plan" },
      ],
    } satisfies SerializablePlan,
    generateExampleCode: generatePlanCode,
  },
};
