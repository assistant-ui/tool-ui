import { LucideIcon, Table, MessageSquare } from "lucide-react";

export interface ComponentMetadata {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

export const componentsRegistry: ComponentMetadata[] = [
  {
    id: "data-table",
    label: "Data Table",
    description: "Display tabular data with sorting and actions",
    icon: Table,
    path: "/playground/data-table",
  },
  {
    id: "social-post",
    label: "Social Post",
    description: "Render social media posts from multiple platforms",
    icon: MessageSquare,
    path: "/playground/social-post",
  },
];

export function getComponentById(id: string): ComponentMetadata | undefined {
  return componentsRegistry.find((component) => component.id === id);
}

export function getDefaultComponent(): ComponentMetadata {
  return componentsRegistry[0];
}
