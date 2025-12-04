"use client";

/**
 * Component Registry
 *
 * Registry of built-in Tool UI components available for testing in the Workbench.
 * Each entry maps to an actual React component from the tool-ui library.
 */

import type { ComponentType } from "react";
import { MediaCard } from "@/components/tool-ui/media-card";
import {
  OptionList,
  parseSerializableOptionList,
} from "@/components/tool-ui/option-list";
import {
  CodeBlock,
  parseSerializableCodeBlock,
} from "@/components/tool-ui/code-block";
import {
  Terminal,
  parseSerializableTerminal,
} from "@/components/tool-ui/terminal";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ComponentCategory =
  | "cards"
  | "lists"
  | "forms"
  | "data"
  | "display";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

export interface WorkbenchComponentEntry {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Brief description */
  description: string;
  /** Category for grouping */
  category: ComponentCategory;
  /** The actual React component */
  component: AnyComponent;
  /** Default props/toolInput */
  defaultProps: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Wrapper for OptionList (handles parsing)
// ─────────────────────────────────────────────────────────────────────────────

function OptionListWrapper(props: Record<string, unknown>) {
  // Parse the serializable data into the expected format
  const parsed = parseSerializableOptionList(props);
  return <OptionList {...parsed} />;
}

function CodeBlockWrapper(props: Record<string, unknown>) {
  // Parse the serializable data into the expected format
  const parsed = parseSerializableCodeBlock(props);
  return <CodeBlock {...parsed} />;
}

function TerminalWrapper(props: Record<string, unknown>) {
  // Parse the serializable data into the expected format
  const parsed = parseSerializableTerminal(props);
  return <Terminal {...parsed} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

export const workbenchComponents: WorkbenchComponentEntry[] = [
  {
    id: "media-card",
    label: "Media Card",
    description: "Rich media display with image, video, audio, or link content",
    category: "cards",
    component: MediaCard,
    defaultProps: {
      surfaceId: "workbench-media-card",
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
    id: "option-list",
    label: "Option List",
    description: "Interactive selection list with icons and descriptions",
    category: "lists",
    component: OptionListWrapper,
    defaultProps: {
      surfaceId: "workbench-option-list",
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
    id: "code-block",
    label: "Code Block",
    description:
      "Syntax-highlighted code display with copy and collapse features",
    category: "display",
    component: CodeBlockWrapper,
    defaultProps: {
      surfaceId: "workbench-code-block",
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
      surfaceId: "workbench-terminal",
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
];

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Component
// ─────────────────────────────────────────────────────────────────────────────

function PlaceholderComponent({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="text-muted-foreground text-sm">
        {message || "Component coming soon"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a component entry by ID.
 */
export function getComponent(id: string): WorkbenchComponentEntry | undefined {
  return workbenchComponents.find((c) => c.id === id);
}

/**
 * Get all component IDs.
 */
export function getComponentIds(): string[] {
  return workbenchComponents.map((c) => c.id);
}
