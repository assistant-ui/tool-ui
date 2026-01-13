import type { SerializableProgressTracker } from "@/components/tool-ui/progress-tracker";
import type { PresetWithCodeGen } from "./types";

export type ProgressTrackerPresetName =
  | "in-progress"
  | "completed"
  | "failed"
  | "with-elapsed-time"
  | "receipt"
  | "receipt-failed";

type ProgressTrackerPreset = PresetWithCodeGen<SerializableProgressTracker>;

function generateProgressTrackerCode(
  data: SerializableProgressTracker,
): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(
    `  steps={${JSON.stringify(data.steps, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.elapsedTime !== undefined) {
    props.push(`  elapsedTime={${data.elapsedTime}}`);
  }

  if (data.receipt) {
    props.push(
      `  receipt={${JSON.stringify(data.receipt, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.responseActions) {
    props.push(
      `  responseActions={${JSON.stringify(data.responseActions, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  return `<ProgressTracker\n${props.join("\n")}\n/>`;
}

export const progressTrackerPresets = {
  "in-progress": {
    description: "Live deployment progress with running steps",
    data: {
      id: "progress-tracker-in-progress",
      steps: [
        {
          id: "build",
          label: "Building",
          description: "Compiling TypeScript and bundling assets",
          status: "completed",
        },
        {
          id: "test",
          label: "Running Tests",
          description: "147 tests across 23 suites",
          status: "in-progress",
        },
        {
          id: "deploy",
          label: "Deploy to Production",
          description: "Upload to edge nodes",
          status: "pending",
        },
      ],
      elapsedTime: 43200,
      responseActions: [{ id: "cancel", label: "Cancel", variant: "outline" }],
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
  completed: {
    description: "All steps successfully completed",
    data: {
      id: "progress-tracker-completed",
      steps: [
        {
          id: "verify",
          label: "Verify Credentials",
          description: "Authentication successful",
          status: "completed",
        },
        {
          id: "download",
          label: "Download Files",
          description: "3.2 GB transferred",
          status: "completed",
        },
        {
          id: "extract",
          label: "Extract Archive",
          description: "1,247 files extracted",
          status: "completed",
        },
        {
          id: "install",
          label: "Install Dependencies",
          description: "npm install completed",
          status: "completed",
        },
      ],
      elapsedTime: 128500,
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
  failed: {
    description: "Operation failed during execution",
    data: {
      id: "progress-tracker-failed",
      steps: [
        {
          id: "connect",
          label: "Connect to Database",
          description: "postgres://prod-db-1.example.com",
          status: "completed",
        },
        {
          id: "backup",
          label: "Create Backup",
          description: "Snapshot before migration",
          status: "completed",
        },
        {
          id: "migrate",
          label: "Run Migrations",
          description: "Failed: column 'user_id' already exists",
          status: "failed",
        },
        {
          id: "verify",
          label: "Verify Schema",
          status: "pending",
        },
      ],
      elapsedTime: 8300,
      responseActions: [
        { id: "cancel", label: "Cancel", variant: "ghost" },
        { id: "retry", label: "Retry Migration", variant: "default" },
      ],
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
  "with-elapsed-time": {
    description: "Long-running import with time tracking",
    data: {
      id: "progress-tracker-with-elapsed-time",
      steps: [
        {
          id: "parse",
          label: "Parse CSV",
          description: "124,856 rows detected",
          status: "completed",
        },
        {
          id: "validate",
          label: "Validate Records",
          description: "Checking required fields",
          status: "completed",
        },
        {
          id: "transform",
          label: "Transform Data",
          description: "Normalizing formats and values",
          status: "in-progress",
        },
        {
          id: "import",
          label: "Import to Database",
          description: "Batch insert in progress",
          status: "pending",
        },
      ],
      elapsedTime: 247800,
      responseActions: [{ id: "cancel", label: "Cancel", variant: "outline" }],
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
  receipt: {
    description: "Completed operation shown as receipt",
    data: {
      id: "progress-tracker-receipt",
      steps: [
        {
          id: "build",
          label: "Building",
          status: "completed",
        },
        {
          id: "test",
          label: "Testing",
          status: "completed",
        },
        {
          id: "deploy",
          label: "Deploying",
          status: "completed",
        },
      ],
      elapsedTime: 128500,
      receipt: {
        outcome: "success",
        summary: "Deployment complete",
        at: new Date().toISOString(),
      },
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
  "receipt-failed": {
    description: "Failed operation shown as receipt",
    data: {
      id: "progress-tracker-receipt-failed",
      steps: [
        {
          id: "connect",
          label: "Connect to Database",
          description: "postgres://prod-db-1.example.com",
          status: "completed",
        },
        {
          id: "backup",
          label: "Create Backup",
          description: "Snapshot before migration",
          status: "completed",
        },
        {
          id: "migrate",
          label: "Run Migrations",
          description: "Failed: column 'user_id' already exists",
          status: "failed",
        },
        {
          id: "verify",
          label: "Verify Schema",
          status: "pending",
        },
      ],
      elapsedTime: 8300,
      receipt: {
        outcome: "failed",
        summary: "Migration failed",
        at: new Date().toISOString(),
      },
    } satisfies SerializableProgressTracker,
    generateExampleCode: generateProgressTrackerCode,
  },
} satisfies Record<string, ProgressTrackerPreset>;
