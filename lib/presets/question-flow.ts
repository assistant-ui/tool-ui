import type {
  SerializableQuestionFlow,
  SerializableProgressiveMode,
  SerializableUpfrontMode,
  SerializableReceiptMode,
} from "@/components/tool-ui/question-flow";
import type { PresetWithCodeGen } from "./types";

export type QuestionFlowPresetName =
  | "progressive"
  | "upfront"
  | "multi-select"
  | "receipt";

function generateProgressiveCode(data: SerializableProgressiveMode): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(`  step={${data.step}}`);
  props.push(`  title="${data.title}"`);

  if (data.description) {
    props.push(`  description="${data.description}"`);
  }

  props.push(
    `  options={${JSON.stringify(data.options, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.selectionMode && data.selectionMode !== "single") {
    props.push(`  selectionMode="${data.selectionMode}"`);
  }

  props.push(`  onSelect={(ids) => console.log("Selected:", ids)}`);
  props.push(`  onBack={() => console.log("Go back")}`);

  return `<QuestionFlowProgressive\n${props.join("\n")}\n/>`;
}

function generateUpfrontCode(data: SerializableUpfrontMode): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(
    `  steps={${JSON.stringify(data.steps, null, 4).replace(/\n/g, "\n  ")}}`,
  );
  props.push(`  onComplete={(answers) => console.log("Complete:", answers)}`);

  return `<QuestionFlowUpfront\n${props.join("\n")}\n/>`;
}

function generateReceiptCode(data: SerializableReceiptMode): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);
  props.push(
    `  choice={${JSON.stringify(data.choice, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  return `<QuestionFlowReceipt\n${props.join("\n")}\n/>`;
}

function generateQuestionFlowCode(data: SerializableQuestionFlow): string {
  if ("choice" in data && data.choice) {
    return generateReceiptCode(data as SerializableReceiptMode);
  }
  if ("steps" in data && data.steps) {
    return generateUpfrontCode(data as SerializableUpfrontMode);
  }
  return generateProgressiveCode(data as SerializableProgressiveMode);
}

export const questionFlowPresets: Record<
  QuestionFlowPresetName,
  PresetWithCodeGen<SerializableQuestionFlow>
> = {
  progressive: {
    description: "AI-controlled step with database selection",
    data: {
      id: "question-flow-database",
      step: 2,
      title: "Select database type",
      description: "Where should we store your data?",
      options: [
        {
          id: "postgres",
          label: "PostgreSQL",
          description: "Open source with strong SQL support",
        },
        {
          id: "mysql",
          label: "MySQL",
          description: "Widely supported, good for web applications",
        },
        {
          id: "sqlite",
          label: "SQLite",
          description: "Embedded, no setup required",
        },
      ],
    } satisfies SerializableProgressiveMode,
    generateExampleCode: generateQuestionFlowCode,
  },
  upfront: {
    description: "Complete wizard with all steps defined upfront",
    data: {
      id: "question-flow-project-setup",
      steps: [
        {
          id: "language",
          title: "Select a programming language",
          description: "This determines which frameworks and tools are available.",
          options: [
            { id: "python", label: "Python" },
            { id: "typescript", label: "TypeScript" },
            { id: "go", label: "Go" },
          ],
        },
        {
          id: "framework",
          title: "Choose a framework",
          description: "Pick the framework you're most comfortable with.",
          options: [
            { id: "fastapi", label: "FastAPI" },
            { id: "django", label: "Django" },
            { id: "flask", label: "Flask" },
          ],
        },
        {
          id: "database",
          title: "Select your database",
          description: "Your data will be stored and queried from here.",
          options: [
            { id: "postgres", label: "PostgreSQL" },
            { id: "mysql", label: "MySQL" },
            { id: "mongodb", label: "MongoDB" },
          ],
        },
      ],
    } satisfies SerializableUpfrontMode,
    generateExampleCode: generateQuestionFlowCode,
  },
  "multi-select": {
    description: "Step with multiple selections allowed",
    data: {
      id: "question-flow-features",
      step: 3,
      title: "Select features to include",
      description: "Choose all the features you want in your project.",
      selectionMode: "multi",
      options: [
        {
          id: "auth",
          label: "Authentication",
          description: "User login and registration",
        },
        {
          id: "api",
          label: "REST API",
          description: "API endpoints for external access",
        },
        {
          id: "admin",
          label: "Admin Panel",
          description: "Dashboard for managing content",
        },
        {
          id: "analytics",
          label: "Analytics",
          description: "Track user behavior and metrics",
        },
      ],
    } satisfies SerializableProgressiveMode,
    generateExampleCode: generateQuestionFlowCode,
  },
  receipt: {
    description: "Completed wizard showing configuration summary",
    data: {
      id: "question-flow-receipt",
      choice: {
        title: "Project configured",
        summary: [
          { label: "Language", value: "Python" },
          { label: "Framework", value: "FastAPI" },
          { label: "Database", value: "PostgreSQL" },
          { label: "Features", value: "Auth, API, Admin" },
        ],
      },
    } satisfies SerializableReceiptMode,
    generateExampleCode: generateQuestionFlowCode,
  },
};
