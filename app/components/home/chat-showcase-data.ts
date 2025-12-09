import type { Column } from "@/components/tool-ui/data-table";
import type { SerializableMediaCard } from "@/components/tool-ui/media-card";
import type { SerializableChart } from "@/components/tool-ui/chart";
import type { XPostData } from "@/components/tool-ui/x-post";

export type SupportTicket = {
  id: string;
  customer: string;
  issue: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in-progress" | "waiting" | "done";
  assignee: string;
  created: string;
};

type BadgeColor = "danger" | "warning" | "info" | "success" | "neutral";

export const TABLE_COLUMNS: Column<SupportTicket>[] = [
  { key: "id", label: "ID", sortable: true, priority: "primary" },
  { key: "issue", label: "Issue", sortable: false, priority: "primary" },
  {
    key: "priority",
    label: "Priority",
    sortable: true,
    priority: "primary",
    format: {
      kind: "badge",
      colorMap: {
        high: "danger",
        medium: "warning",
        low: "success",
      } as Record<string, BadgeColor>,
    },
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    priority: "primary",
    format: {
      kind: "badge",
      colorMap: {
        "in-progress": "info",
        open: "warning",
        waiting: "neutral",
        done: "success",
      } as Record<string, BadgeColor>,
    },
  },
];

const UNSORTED_TABLE_DATA: SupportTicket[] = [
  {
    id: "TKT-2847",
    customer: "Acme Corp",
    issue: "API authentication failing intermittently",
    priority: "high",
    status: "in-progress",
    assignee: "Sarah Chen",
    created: "2h ago",
  },
  {
    id: "TKT-2839",
    customer: "TechStart Inc",
    issue: "Unable to export data in CSV format",
    priority: "medium",
    status: "open",
    assignee: "Mike Rodriguez",
    created: "4h ago",
  },
  {
    id: "TKT-2815",
    customer: "CloudNine",
    issue: "User permissions not syncing across teams",
    priority: "low",
    status: "done",
    assignee: "Taylor Singh",
    created: "12h ago",
  },
  {
    id: "TKT-2801",
    customer: "Velocity Systems",
    issue: "Email notifications delayed by 2+ hours",
    priority: "medium",
    status: "waiting",
    assignee: "Alex Kim",
    created: "16h ago",
  },
];

const PRIORITY_ORDER: Record<SupportTicket["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const TABLE_DATA: SupportTicket[] = [...UNSORTED_TABLE_DATA].sort(
  (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
);

export const MEDIA_CARD: SerializableMediaCard = {
  id: "chat-showcase-media-card",
  assetId: "rsc-guide",
  kind: "link",
  href: "https://react.dev/reference/rsc/server-components",
  src: "https://react.dev/reference/rsc/server-components",
  title: "React Server Components",
  description:
    "Server Components are a new type of Component that renders ahead of time, before bundling. Learn how to use them in your app.",
  ratio: "16:9",
  domain: "react.dev",
  thumb:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
  createdAtISO: "2025-01-15T10:30:00.000Z",
  source: {
    label: "React Docs",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=react",
    url: "https://react.dev",
  },
  og: {
    imageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1200",
    description: "Official React documentation for Server Components.",
    title: "React Server Components",
  },
};

export const X_POST: XPostData = {
  id: "chat-showcase-x-post",
  author: {
    name: "DevTools Team",
    handle: "devtoolsco",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=1200",
  },
  text: "We're thrilled to announce that our component library is now open source! 🎉\n\nBuilt with React, TypeScript, and Tailwind. Fully accessible, customizable, and production-ready.\n\nStar us on GitHub and join the community ⭐️\n\ngithub.com/devtools/ui-kit",
  createdAt: "2025-11-10T14:30:00.000Z",
};

export const X_POST_ACTIONS = [
  { id: "cancel", label: "Discard", variant: "ghost" as const },
  { id: "edit", label: "Revise", variant: "outline" as const },
  { id: "send", label: "Post Now", variant: "default" as const },
];

const CHART_DATA = [
  { month: "Oct", signups: 1240, activations: 890 },
  { month: "Nov", signups: 1580, activations: 1190 },
  { month: "Dec", signups: 2120, activations: 1720 },
];

export const SIGNUP_CHART: Omit<SerializableChart, "id"> = {
  type: "line",
  title: "Q4 Signups",
  data: CHART_DATA,
  xKey: "month",
  series: [
    { key: "signups", label: "Signups" },
    { key: "activations", label: "Activations" },
  ],
  showLegend: true,
};
