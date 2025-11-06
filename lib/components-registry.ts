import { LucideIcon, Table, MessageSquare, Image, CheckCircle2 } from "lucide-react";

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
    path: "/components/data-table",
  },

  {
    id: "media-card",
    label: "Media Card",
    description: "Preview images, links, videos, and audio safely",
    icon: Image,
    path: "/components/media-card",
  },
  {
    id: "decision-prompt",
    label: "Decision Prompt",
    description: "Inline prompts for user decisions and actions",
    icon: CheckCircle2,
    path: "/components/decision-prompt",
  },
  {
    id: "social-post",
    label: "Social Post",
    description: "Render social media posts from multiple platforms",
    icon: MessageSquare,
    path: "/components/social-post",
  },
];

export function getComponentById(id: string): ComponentMetadata | undefined {
  return componentsRegistry.find((component) => component.id === id);
}

export function getDefaultComponent(): ComponentMetadata {
  return componentsRegistry[0];
}
