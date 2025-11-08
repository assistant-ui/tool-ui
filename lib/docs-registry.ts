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
];
