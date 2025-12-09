export interface ComponentMeta {
  id: string;
  label: string;
  description: string;
  path: string;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "chart",
    label: "Chart",
    description: "Visualize data with interactive charts",
    path: "/docs/chart",
  },
  {
    id: "code-block",
    label: "Code Block",
    description: "Display syntax-highlighted code snippets",
    path: "/docs/code-block",
  },
  {
    id: "data-table",
    label: "Data Table",
    description: "Present structured data in sortable tables",
    path: "/docs/data-table",
  },
  {
    id: "media-card",
    label: "Media Card",
    description: "Showcase images and media content",
    path: "/docs/media-card",
  },
  {
    id: "option-list",
    label: "Option List",
    description: "Let users select from multiple choices",
    path: "/docs/option-list",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Display step-by-step task workflows",
    path: "/docs/plan",
  },
  {
    id: "social-post",
    label: "Social Posts",
    description: "Render social media content previews",
    path: "/docs/social-post",
  },
  {
    id: "terminal",
    label: "Terminal",
    description: "Show command-line output and logs",
    path: "/docs/terminal",
  },
];

export function getComponentById(id: string): ComponentMeta | undefined {
  return componentsRegistry.find((component) => component.id === id);
}
