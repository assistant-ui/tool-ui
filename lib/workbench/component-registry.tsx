"use client";

import type { ComponentType } from "react";
import { Chart } from "@/components/tool-ui/chart";
import { MediaCard } from "@/components/tool-ui/media-card";
import { OptionListSDK } from "./wrappers";
import {
  CodeBlock,
  parseSerializableCodeBlock,
} from "@/components/tool-ui/code-block";
import {
  Terminal,
  parseSerializableTerminal,
} from "@/components/tool-ui/terminal";
import { Plan, parseSerializablePlan } from "@/components/tool-ui/plan";

export type ComponentCategory =
  | "cards"
  | "lists"
  | "forms"
  | "data"
  | "display";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

export interface WorkbenchComponentEntry {
  id: string;
  label: string;
  description: string;
  category: ComponentCategory;
  component: AnyComponent;
  defaultProps: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Wrappers
// ─────────────────────────────────────────────────────────────────────────────

function CodeBlockWrapper(props: Record<string, unknown>) {
  const parsed = parseSerializableCodeBlock(props);
  return <CodeBlock {...parsed} />;
}

function TerminalWrapper(props: Record<string, unknown>) {
  const parsed = parseSerializableTerminal(props);
  return <Terminal {...parsed} />;
}

function PlanWrapper(props: Record<string, unknown>) {
  const parsed = parseSerializablePlan(props);
  return <Plan {...parsed} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const workbenchComponents: WorkbenchComponentEntry[] = [
  {
    id: "option-list",
    label: "Option List",
    description: "Interactive selection list with icons and descriptions",
    category: "lists",
    component: OptionListSDK,
    defaultProps: {
      id: "workbench-option-list",
      options: [
        {
          id: "sf",
          label: "San Francisco",
          description: "California, USA",
        },
        {
          id: "nyc",
          label: "New York City",
          description: "New York, USA",
        },
        {
          id: "london",
          label: "London",
          description: "United Kingdom",
        },
        {
          id: "tokyo",
          label: "Tokyo",
          description: "Japan",
        },
      ],
      selectionMode: "single",
    },
  },
  {
    id: "plan",
    label: "Plan",
    description: "Structured plan display with collapsible todo list",
    category: "lists",
    component: PlanWrapper,
    defaultProps: {
      id: "workbench-plan",
      title: "Implementation Plan",
      description: "Step-by-step guide for the feature rollout",
      todos: [
        { id: "1", label: "Review requirements", status: "completed" },
        { id: "2", label: "Design solution", status: "completed" },
        { id: "3", label: "Implement core logic", status: "in_progress" },
        { id: "4", label: "Write tests", status: "pending" },
        { id: "5", label: "Update documentation", status: "pending" },
        { id: "6", label: "Deploy to staging", status: "pending" },
      ],
    },
  },
  {
    id: "media-card",
    label: "Media Card",
    description: "Rich media display with image, video, audio, or link content",
    category: "cards",
    component: MediaCard,
    defaultProps: {
      id: "workbench-media-card",
      assetId: "workbench-asset",
      kind: "image",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
      alt: "Mountain sunrise with golden light",
      title: "Mountain Sunrise",
      description:
        "A beautiful sunrise illuminates the mountain peaks with golden light.",
      ratio: "16:9",
      domain: "unsplash.com",
      createdAtISO: new Date().toISOString(),
      source: {
        label: "Nature Photography",
        iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=nature",
      },
    },
  },
  {
    id: "code-block",
    label: "Code Block",
    description:
      "Syntax-highlighted code display with copy and collapse features",
    category: "display",
    component: CodeBlockWrapper,
    defaultProps: {
      id: "workbench-code-block",
      code: `function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
      language: "typescript",
      filename: "greet.ts",
      showLineNumbers: true,
    },
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Command output display with ANSI colors and exit codes",
    category: "display",
    component: TerminalWrapper,
    defaultProps: {
      id: "workbench-terminal",
      command: "echo 'Hello, World!'",
      stdout: "Hello, World!",
      exitCode: 0,
      durationMs: 45,
      cwd: "~",
    },
  },
  // Placeholder entries for components not yet integrated
  {
    id: "social-post",
    label: "Social Post (Coming Soon)",
    description: "Social media post preview - integration pending",
    category: "cards",
    component: PlaceholderComponent,
    defaultProps: {
      message: "Social Post component will be integrated here",
    },
  },
  {
    id: "data-table",
    label: "Data Table (Coming Soon)",
    description: "Tabular data display - integration pending",
    category: "data",
    component: PlaceholderComponent,
    defaultProps: {
      message: "Data Table component will be integrated here",
    },
  },
  {
    id: "chart",
    label: "Chart",
    description: "Data visualization with bar and line charts",
    category: "data",
    component: Chart,
    defaultProps: {
      id: "workbench-chart",
      type: "bar",
      title: "Monthly Revenue",
      description: "Revenue vs Expenses for 2024",
      data: [
        { month: "Jan", revenue: 4000, expenses: 2400 },
        { month: "Feb", revenue: 3000, expenses: 1398 },
        { month: "Mar", revenue: 2000, expenses: 9800 },
        { month: "Apr", revenue: 2780, expenses: 3908 },
        { month: "May", revenue: 1890, expenses: 4800 },
        { month: "Jun", revenue: 2390, expenses: 3800 },
      ],
      xKey: "month",
      series: [
        { key: "revenue", label: "Revenue" },
        { key: "expenses", label: "Expenses" },
      ],
      showLegend: true,
      showGrid: true,
    },
  },
];

function PlaceholderComponent({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="text-muted-foreground text-sm">
        {message || "Component coming soon"}
      </div>
    </div>
  );
}

export function getComponent(id: string): WorkbenchComponentEntry | undefined {
  return workbenchComponents.find((c) => c.id === id);
}

export function getComponentIds(): string[] {
  return workbenchComponents.map((c) => c.id);
}
