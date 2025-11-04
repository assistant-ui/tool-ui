import type { Column, Action, RowPrimitive } from "@/components/data-table";

type GenericRow = Record<string, RowPrimitive>;
export type SortState = { by?: string; direction?: "asc" | "desc" };

export interface DataTableConfig {
  columns: Column[];
  data: GenericRow[];
  actions?: Action[];
  rowIdKey?: string;
  defaultSort?: SortState;
  maxHeight?: string;
  emptyMessage?: string;
  locale?: string;
}

const stockColumns: Column<GenericRow>[] = [
  { key: "symbol", label: "Symbol", priority: "primary" },
  { key: "name", label: "Company", priority: "primary" },
  {
    key: "price",
    label: "Price",
    align: "right",
    priority: "primary",
    format: { kind: "currency", currency: "USD", decimals: 2 },
  },
  {
    key: "change",
    label: "Change",
    align: "right",
    priority: "secondary",
    format: {
      kind: "delta",
      decimals: 2,
      upIsPositive: true,
      showSign: true,
    },
  },
  {
    key: "changePercent",
    label: "Change %",
    align: "right",
    priority: "secondary",
    format: {
      kind: "percent",
      decimals: 2,
      showSign: true,
      basis: "unit",
    },
  },
  {
    key: "volume",
    label: "Volume",
    align: "right",
    priority: "secondary",
    format: { kind: "number", compact: true },
  },
];

const stockData: GenericRow[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.25,
    change: 2.35,
    changePercent: 1.34,
    volume: 52430000,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.5,
    change: -0.87,
    changePercent: -0.61,
    volume: 28920000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 380.0,
    change: 1.24,
    changePercent: 0.33,
    volume: 31250000,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 155.75,
    change: 3.12,
    changePercent: 2.19,
    volume: 45680000,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.8,
    change: -5.67,
    changePercent: -2.29,
    volume: 98540000,
  },
];

export const sampleStocks: DataTableConfig = {
  columns: stockColumns,
  data: stockData,
  actions: [
    { id: "edit", label: "Edit", variant: "secondary" },
    { id: "buy", label: "Buy", variant: "default" },
    { id: "sell", label: "Sell", variant: "destructive" },
  ],
  rowIdKey: "symbol",
};

const taskColumns: Column<GenericRow>[] = [
  { key: "title", label: "Task", priority: "primary" },
  {
    key: "status",
    label: "Status",
    priority: "primary",
    format: {
      kind: "status",
      statusMap: {
        todo: { tone: "neutral", label: "To Do" },
        in_progress: { tone: "info", label: "In Progress" },
        done: { tone: "success", label: "Done" },
        blocked: { tone: "danger", label: "Blocked" },
      },
    },
  },
  {
    key: "priority",
    label: "Priority",
    priority: "secondary",
    format: {
      kind: "status",
      statusMap: {
        low: { tone: "success" },
        medium: { tone: "warning" },
        high: { tone: "danger" },
        critical: { tone: "danger", label: "Critical" },
      },
    },
  },
  { key: "assignee", label: "Assignee", priority: "secondary" },
  {
    key: "dueDate",
    label: "Due Date",
    priority: "secondary",
    format: { kind: "date", dateFormat: "short" },
  },
  {
    key: "isUrgent",
    label: "Urgent",
    priority: "tertiary",
    format: { kind: "boolean" },
  },
];

const taskData: GenericRow[] = [
  {
    title: "Implement user authentication",
    status: "in_progress",
    priority: "high",
    assignee: "Alice",
    dueDate: "2025-11-05",
    isUrgent: true,
  },
  {
    title: "Fix login bug",
    status: "todo",
    priority: "critical",
    assignee: "Bob",
    dueDate: "2025-11-04",
    isUrgent: true,
  },
  {
    title: "Update documentation",
    status: "done",
    priority: "low",
    assignee: "Carol",
    dueDate: "2025-10-28",
    isUrgent: false,
  },
  {
    title: "Design new landing page",
    status: "blocked",
    priority: "medium",
    assignee: "David",
    dueDate: "2025-11-10",
    isUrgent: false,
  },
  {
    title: "Optimize database queries",
    status: "in_progress",
    priority: "medium",
    assignee: "Eve",
    dueDate: "2025-11-08",
    isUrgent: false,
  },
];

export const sampleTasks: DataTableConfig = {
  columns: taskColumns,
  data: taskData,
  actions: [
    { id: "edit", label: "Edit", variant: "secondary" },
    { id: "complete", label: "Complete", variant: "default" },
    {
      id: "delete",
      label: "Delete",
      variant: "destructive",
      requiresConfirmation: true,
    },
  ],
  rowIdKey: "title",
};

const metricColumns: Column<GenericRow>[] = [
  { key: "endpoint", label: "Endpoint", priority: "primary" },
  {
    key: "p95",
    label: "P95 Latency",
    align: "right",
    priority: "primary",
    format: { kind: "number", decimals: 0, unit: " ms" },
  },
  {
    key: "latencyDelta",
    label: "Δ Latency",
    align: "right",
    priority: "primary",
    format: {
      kind: "delta",
      decimals: 0,
      upIsPositive: false,
      showSign: true,
    },
  },
  {
    key: "errorRate",
    label: "Error Rate",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 2 },
  },
  {
    key: "throughput",
    label: "Throughput",
    align: "right",
    priority: "secondary",
    format: { kind: "number", compact: true, unit: " req/s" },
  },
];

const metricData: GenericRow[] = [
  {
    endpoint: "/api/users",
    p95: 145,
    latencyDelta: -15,
    errorRate: 0.12,
    throughput: 12500,
  },
  {
    endpoint: "/api/products",
    p95: 230,
    latencyDelta: 25,
    errorRate: 0.05,
    throughput: 8200,
  },
  {
    endpoint: "/api/orders",
    p95: 180,
    latencyDelta: -8,
    errorRate: 0.08,
    throughput: 6800,
  },
  {
    endpoint: "/api/search",
    p95: 520,
    latencyDelta: 35,
    errorRate: 0.15,
    throughput: 4200,
  },
];

export const sampleMetrics: DataTableConfig = {
  columns: metricColumns,
  data: metricData,
  rowIdKey: "endpoint",
  defaultSort: { by: "p95", direction: "desc" },
};

const resourceColumns: Column<GenericRow>[] = [
  { key: "name", label: "Resource", priority: "primary" },
  {
    key: "category",
    label: "Category",
    priority: "primary",
    format: {
      kind: "badge",
      colorMap: {
        documentation: "info",
        tutorial: "success",
        reference: "neutral",
        tool: "warning",
      },
    },
  },
  {
    key: "url",
    label: "Link",
    priority: "secondary",
    format: { kind: "link", external: true },
  },
  {
    key: "tags",
    label: "Tags",
    priority: "secondary",
    format: { kind: "array", maxVisible: 2 },
  },
  {
    key: "updatedAt",
    label: "Last Updated",
    priority: "tertiary",
    format: { kind: "date", dateFormat: "relative" },
  },
];

const resourceData: GenericRow[] = [
  {
    name: "React Docs",
    category: "documentation",
    url: "https://react.dev",
    tags: ["react", "javascript", "frontend"],
    updatedAt: "2025-05-12T09:00:00.000Z",
  },
  {
    name: "TypeScript Handbook",
    category: "reference",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    tags: ["typescript", "javascript"],
    updatedAt: "2025-05-12T13:00:00.000Z",
  },
  {
    name: "Next.js Tutorial",
    category: "tutorial",
    url: "https://nextjs.org/learn",
    tags: ["nextjs", "react", "fullstack"],
    updatedAt: "2025-05-12T18:00:00.000Z",
  },
  {
    name: "Tailwind CSS",
    category: "tool",
    url: "https://tailwindcss.com",
    tags: ["css", "styling", "utility-first", "responsive"],
    updatedAt: "2025-05-06T09:00:00.000Z",
  },
];

export const sampleResources: DataTableConfig = {
  columns: resourceColumns,
  data: resourceData,
  rowIdKey: "name",
};

const layoutColumns: Column<GenericRow>[] = [
  {
    key: "id",
    label: "ID",
    priority: "primary",
    width: "80px",
    sortable: false,
  },
  {
    key: "description",
    label: "Description",
    priority: "primary",
    truncate: true,
  },
  {
    key: "owner",
    label: "Owner",
    abbr: "Own.",
    priority: "secondary",
  },
  {
    key: "desktopOnlyNotes",
    label: "Desktop Notes",
    priority: "tertiary",
    hideOnMobile: true,
    sortable: false,
  },
  {
    key: "status",
    label: "Status",
    priority: "secondary",
    format: {
      kind: "status",
      statusMap: {
        planned: { tone: "neutral", label: "Planned" },
        in_progress: { tone: "info", label: "In Progress" },
        done: { tone: "success", label: "Done" },
      },
    },
  },
];

const layoutData: GenericRow[] = [
  {
    id: "PL-204",
    description: "Ship billing settings redesign with usage caps and alerts",
    owner: "Marla",
    desktopOnlyNotes: "Contains hover-only tooltips for plan badges",
    status: "in_progress",
  },
  {
    id: "PL-198",
    description: "Migrate export flow to async jobs for large CSV payloads",
    owner: "Jon",
    desktopOnlyNotes: "Keep legacy download button until Q2",
    status: "planned",
  },
  {
    id: "PL-176",
    description: "Improve incident timeline readability with grouping",
    owner: "Priya",
    desktopOnlyNotes: "Desktop table hides avatar column on narrow widths",
    status: "done",
  },
];

export const sampleLayout: DataTableConfig = {
  columns: layoutColumns,
  data: layoutData,
  rowIdKey: "id",
  maxHeight: "240px",
};

export const sampleLocalized: DataTableConfig = {
  columns: stockColumns,
  data: stockData,
  rowIdKey: "symbol",
  locale: "de-DE",
};

export const sampleEmpty: DataTableConfig = {
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ],
  data: [],
  emptyMessage: "No rows yet. Connect a data source.",
};

const largeColumns: Column<GenericRow>[] = [
  { key: "id", label: "ID", priority: "primary" },
  { key: "user", label: "User", priority: "primary" },
  {
    key: "email",
    label: "Profile",
    priority: "secondary",
    format: { kind: "link", external: false },
  },
  {
    key: "role",
    label: "Role",
    priority: "secondary",
    format: {
      kind: "badge",
      colorMap: { Admin: "danger", Editor: "info", Viewer: "neutral" },
    },
  },
  {
    key: "status",
    label: "Status",
    priority: "secondary",
    format: {
      kind: "status",
      statusMap: {
        Active: { tone: "success" },
        Inactive: { tone: "neutral" },
      },
    },
  },
];

const largeData: GenericRow[] = Array.from({ length: 50 }, (_, index) => {
  const i = index + 1;
  return {
    id: i,
    user: `User ${i}`,
    email: `https://example.com/users/${i}`,
    role: ["Admin", "Editor", "Viewer"][index % 3],
    status: ["Active", "Inactive"][index % 2],
  };
});

export const sampleLarge: DataTableConfig = {
  columns: largeColumns,
  data: largeData,
  rowIdKey: "id",
  maxHeight: "320px",
};

export type PresetName =
  | "stocks"
  | "tasks"
  | "metrics"
  | "resources"
  | "layout"
  | "localized"
  | "large"
  | "empty";

export const presets: Record<PresetName, DataTableConfig> = {
  stocks: sampleStocks,
  tasks: sampleTasks,
  metrics: sampleMetrics,
  resources: sampleResources,
  layout: sampleLayout,
  localized: sampleLocalized,
  large: sampleLarge,
  empty: sampleEmpty,
};

export const presetDescriptions: Record<PresetName, string> = {
  stocks: "Market data with currency, delta, percent, and actions",
  tasks: "Status pills, boolean badges, and confirmation-required actions",
  metrics: "Numbers with units, inverted deltas, and default sorting",
  resources: "Links, tag arrays, and relative dates",
  layout: "Fixed widths, truncation, abbreviations, and mobile-only controls",
  localized: "German locale formatting for numbers and currency",
  large: "50-row dataset with badges, links, and max-height scroll",
  empty: "Empty state messaging with configurable text",
};
