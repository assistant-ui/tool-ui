"use client";

import type { ComponentType } from "react";
import { Chart } from "@/components/tool-ui/chart";
import { Image } from "@/components/tool-ui/image";
import { Video } from "@/components/tool-ui/video";
import { Audio } from "@/components/tool-ui/audio";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { OptionListSDK, POIMapSDK } from "./wrappers";
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
    id: "poi-map",
    label: "POI Map",
    description:
      "Interactive map with points of interest - demonstrates display mode transitions, widget state, and tool calls",
    category: "data",
    component: POIMapSDK,
    defaultProps: {
      id: "workbench-poi-map",
      title: "San Francisco Highlights",
      pois: [
        {
          id: "1",
          name: "Golden Gate Bridge",
          category: "landmark",
          lat: 37.8199,
          lng: -122.4783,
          description:
            "Iconic suspension bridge spanning the Golden Gate strait",
          rating: 4.8,
          imageUrl:
            "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=400",
        },
        {
          id: "2",
          name: "Fisherman's Wharf",
          category: "entertainment",
          lat: 37.808,
          lng: -122.4177,
          description: "Historic waterfront with restaurants and attractions",
          rating: 4.3,
        },
        {
          id: "3",
          name: "Alcatraz Island",
          category: "museum",
          lat: 37.8267,
          lng: -122.4233,
          description: "Former federal prison, now a museum",
          rating: 4.7,
        },
        {
          id: "4",
          name: "Chinatown",
          category: "shopping",
          lat: 37.7941,
          lng: -122.4078,
          description: "Oldest Chinatown in North America",
          rating: 4.4,
        },
        {
          id: "5",
          name: "Golden Gate Park",
          category: "park",
          lat: 37.7694,
          lng: -122.4862,
          description: "Large urban park with gardens and museums",
          rating: 4.6,
        },
        {
          id: "6",
          name: "Pier 39",
          category: "entertainment",
          lat: 37.8087,
          lng: -122.4098,
          description: "Waterfront shopping and entertainment complex",
          rating: 4.2,
        },
      ],
      initialCenter: { lat: 37.7749, lng: -122.4194 },
      initialZoom: 12,
    },
  },
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
    id: "image",
    label: "Image",
    description: "Display images with metadata and attribution",
    category: "cards",
    component: Image,
    defaultProps: {
      id: "workbench-image",
      assetId: "workbench-image-asset",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop",
      alt: "Mountain sunrise with golden light",
      title: "Mountain Sunrise",
      description:
        "A beautiful sunrise illuminates the mountain peaks with golden light.",
      ratio: "16:9",
      domain: "unsplash.com",
      createdAt: new Date().toISOString(),
      source: {
        label: "Nature Photography",
        iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=nature",
      },
    },
  },
  {
    id: "video",
    label: "Video",
    description: "Video playback with controls and poster",
    category: "cards",
    component: Video,
    defaultProps: {
      id: "workbench-video",
      assetId: "workbench-video-asset",
      src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
      poster:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop",
      title: "Sample Video",
      description: "A sample video demonstrating the component.",
      ratio: "16:9",
      durationMs: 5000,
    },
  },
  {
    id: "audio",
    label: "Audio",
    description: "Audio playback with artwork and metadata",
    category: "cards",
    component: Audio,
    defaultProps: {
      id: "workbench-audio",
      assetId: "workbench-audio-asset",
      src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3",
      title: "Sample Audio",
      description: "A sample audio clip demonstrating the component.",
      artwork:
        "https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&auto=format&fit=crop",
      durationMs: 6000,
    },
  },
  {
    id: "link-preview",
    label: "Link Preview",
    description: "Rich link previews with OG data",
    category: "cards",
    component: LinkPreview,
    defaultProps: {
      id: "workbench-link-preview",
      href: "https://react.dev/reference/rsc/server-components",
      title: "React Server Components",
      description:
        "Server Components are a new type of Component that renders ahead of time.",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
      domain: "react.dev",
      ratio: "16:9",
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
