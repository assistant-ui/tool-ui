export interface ComponentMeta {
  id: string;
  label: string;
  path: string;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "chart",
    label: "Chart",
    path: "/docs/chart",
  },
  {
    id: "code-block",
    label: "Code Block",
    path: "/docs/code-block",
  },
  {
    id: "data-table",
    label: "Data Table",
    path: "/docs/data-table",
  },
  {
    id: "media-card",
    label: "Media Card",
    path: "/docs/media-card",
  },
  {
    id: "option-list",
    label: "Option List",
    path: "/docs/option-list",
  },
  {
    id: "social-post",
    label: "Social Posts",
    path: "/docs/social-post",
  },
  {
    id: "terminal",
    label: "Terminal",
    path: "/docs/terminal",
  },
];

export function getComponentById(id: string): ComponentMeta | undefined {
  return componentsRegistry.find((component) => component.id === id);
}
