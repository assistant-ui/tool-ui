export interface ComponentMeta {
  id: string;
  label: string;
  path: string;
}

export const componentsRegistry: ComponentMeta[] = [
  {
    id: "data-table",
    label: "Data Table",
    path: "/docs/data-table",
  },
  {
    id: "option-list",
    label: "Option List",
    path: "/docs/option-list",
  },
  {
    id: "media-card",
    label: "Media Card",
    path: "/docs/media-card",
  },
  {
    id: "social-post",
    label: "Social Post",
    path: "/docs/social-post",
  },
];

export function getComponentById(id: string): ComponentMeta | undefined {
  return componentsRegistry.find((component) => component.id === id);
}
