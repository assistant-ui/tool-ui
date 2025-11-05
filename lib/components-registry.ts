import { LucideIcon, Table } from "lucide-react";

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
    label: "DataTable",
    description: "Display tabular data with sorting and actions",
    icon: Table,
    path: "/playground/data-table",
  },
];

export function getComponentById(id: string): ComponentMetadata | undefined {
  return componentsRegistry.find((component) => component.id === id);
}

export function getDefaultComponent(): ComponentMetadata {
  return componentsRegistry[0];
}
