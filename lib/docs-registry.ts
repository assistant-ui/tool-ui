export interface DocsPageMeta {
  id: string;
  label: string;
  description?: string;
  path: string;
}

export const docsRegistry: DocsPageMeta[] = [
  {
    id: "overview",
    label: "Overview",
    description: "What Tool UI is and how to use it",
    path: "/docs/overview",
  },
  {
    id: "getting-started",
    label: "Getting Started",
    description: "Install, configure, and render your first UI",
    path: "/docs/getting-started",
  },
  {
    id: "design-guidelines",
    label: "Design Guidelines",
    description: "Principles for designing Tool UI components",
    path: "/docs/design-guidelines",
  },
  {
    id: "implementation-guidelines",
    label: "Implementation Guidelines",
    description: "Conventions for building new components",
    path: "/docs/implementation-guidelines",
  },
  {
    id: "patterns",
    label: "Patterns",
    description: "Reusable flows like confirms and error states",
    path: "/docs/patterns",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    description: "WCAG targets, keyboard maps, and ARIA guidance",
    path: "/docs/accessibility",
  },
  {
    id: "theming-tokens",
    label: "Theming & Tokens",
    description: "Colors, spacing, motion, and variants",
    path: "/docs/theming-tokens",
  },
  {
    id: "architecture",
    label: "Architecture",
    description: "Component architecture and container queries",
    path: "/docs/architecture",
  },
];
