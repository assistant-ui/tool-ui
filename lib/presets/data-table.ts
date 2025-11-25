import type { Column, RowPrimitive } from "@/components/tool-ui/data-table";
import type { SerializableAction } from "@/components/tool-ui/shared";

type GenericRow = Record<string, RowPrimitive>;
export type SortState = { by?: string; direction?: "asc" | "desc" };

export interface DataTableConfig {
  surfaceId: string;
  columns: Column[];
  data: GenericRow[];
  rowIdKey?: string;
  defaultSort?: SortState;
  maxHeight?: string;
  emptyMessage?: string;
  locale?: string;
  footerActions?: SerializableAction[];
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
    symbol: "IBM",
    name: "International Business Machines",
    price: 170.42,
    change: 1.12,
    changePercent: 0.66,
    volume: 18420000,
  },
  {
    symbol: "AAPL",
    name: "Apple",
    price: 178.25,
    change: 2.35,
    changePercent: 1.34,
    volume: 52430000,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 380.0,
    change: 1.24,
    changePercent: 0.33,
    volume: 31250000,
  },
  {
    symbol: "INTC",
    name: "Intel Corporation",
    price: 39.85,
    change: -0.42,
    changePercent: -1.04,
    volume: 29840000,
  },
  {
    symbol: "ORCL",
    name: "Oracle Corporation",
    price: 110.31,
    change: 0.78,
    changePercent: 0.71,
    volume: 14230000,
  },
];

export const sampleStocks: DataTableConfig = {
  surfaceId: "data-table-preview-stocks",
  columns: stockColumns,
  data: stockData,
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
        todo: { tone: "neutral", label: "Todo" },
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
    title: "Transcribe punch cards to magnetic tape",
    status: "in_progress",
    priority: "high",
    assignee: "Grace",
    dueDate: "2025-11-05",
    isUrgent: true,
  },
  {
    title: "Port FORTRAN IV routines to C",
    status: "todo",
    priority: "critical",
    assignee: "Dennis",
    dueDate: "2025-11-04",
    isUrgent: true,
  },
  {
    title: "Document UNIX pipeline patterns",
    status: "done",
    priority: "low",
    assignee: "Ken",
    dueDate: "2025-10-28",
    isUrgent: false,
  },
  {
    title: "Design WIMP interface prototype",
    status: "blocked",
    priority: "medium",
    assignee: "Adele",
    dueDate: "2025-11-10",
    isUrgent: false,
  },
  {
    title: "Optimize RISC instruction scheduling",
    status: "in_progress",
    priority: "medium",
    assignee: "Sophie",
    dueDate: "2025-11-08",
    isUrgent: false,
  },
];

const sampleTasks: DataTableConfig = {
  surfaceId: "data-table-preview-tasks",
  columns: taskColumns,
  data: taskData,
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
    endpoint: "/api/eniac/program",
    p95: 145,
    latencyDelta: -15,
    errorRate: 0.12,
    throughput: 12500,
  },
  {
    endpoint: "/api/arpanet/routing",
    p95: 230,
    latencyDelta: 25,
    errorRate: 0.05,
    throughput: 8200,
  },
  {
    endpoint: "/api/unix/pipe",
    p95: 180,
    latencyDelta: -8,
    errorRate: 0.08,
    throughput: 6800,
  },
  {
    endpoint: "/api/gui/wimp",
    p95: 520,
    latencyDelta: 35,
    errorRate: 0.15,
    throughput: 4200,
  },
];

export const sampleMetrics: DataTableConfig = {
  surfaceId: "data-table-preview-metrics",
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
    name: "The ENIAC Story",
    category: "Documentation",
    url: "https://www.computerhistory.org/revolution/early-computers/5",
    tags: ["eniac", "vacuum-tube", "history"],
    updatedAt: "2025-05-12T09:00:00.000Z",
  },
  {
    name: "The UNIX Philosophy",
    category: "Reference",
    url: "https://homepage.cs.uri.edu/~thenry/resources/unix_art/ch01s06.html",
    tags: ["unix", "pipe", "philosophy"],
    updatedAt: "2025-05-12T13:00:00.000Z",
  },
  {
    name: "ARPANET Origins",
    category: "Tutorial",
    url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
    tags: ["arpanet", "internet", "packet-switching"],
    updatedAt: "2025-05-12T18:00:00.000Z",
  },
  {
    name: "Xerox PARC Research",
    category: "Tool",
    url: "https://xeroxparc.archive.org/",
    tags: ["gui", "wimp", "innovation"],
    updatedAt: "2025-05-06T09:00:00.000Z",
  },
];

const sampleResources: DataTableConfig = {
  surfaceId: "data-table-preview-resources",
  columns: resourceColumns,
  data: resourceData,
  rowIdKey: "name",
};

const sampleLocalized: DataTableConfig = {
  surfaceId: "data-table-preview-localized",
  columns: stockColumns,
  data: stockData,
  rowIdKey: "symbol",
  locale: "de-DE",
};

const sampleEmpty: DataTableConfig = {
  surfaceId: "data-table-preview-empty",
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ],
  data: [],
  emptyMessage: "No rows yet. Connect a data source.",
};

const actionsColumns: Column<GenericRow>[] = [
  { key: "id", label: "Ticket", priority: "primary" },
  { key: "subject", label: "Subject", priority: "primary", truncate: true },
  {
    key: "priority",
    label: "Priority",
    priority: "primary",
    format: {
      kind: "status",
      statusMap: {
        urgent: { tone: "danger", label: "Urgent" },
        high: { tone: "warning", label: "High" },
        normal: { tone: "neutral", label: "Normal" },
      },
    },
  },
  {
    key: "status",
    label: "Status",
    priority: "secondary",
    format: {
      kind: "status",
      statusMap: {
        open: { tone: "info", label: "Open" },
        pending: { tone: "warning", label: "Pending" },
        escalated: { tone: "danger", label: "Escalated" },
      },
    },
  },
  {
    key: "waitTime",
    label: "Wait Time",
    abbr: "Wait",
    align: "right",
    priority: "secondary",
    format: { kind: "number", decimals: 0, unit: "h" },
  },
  {
    key: "createdAt",
    label: "Created",
    priority: "tertiary",
    format: { kind: "date", dateFormat: "relative" },
  },
];

const actionsData: GenericRow[] = [
  {
    id: "TKT-4521",
    subject: "Payment failed - urgent customer escalation",
    priority: "urgent",
    status: "escalated",
    waitTime: 36,
    createdAt: "2025-11-23T08:15:00.000Z",
  },
  {
    id: "TKT-4518",
    subject: "Cannot access account after password reset",
    priority: "high",
    status: "open",
    waitTime: 12,
    createdAt: "2025-11-24T14:30:00.000Z",
  },
  {
    id: "TKT-4515",
    subject: "Billing discrepancy on November invoice",
    priority: "high",
    status: "pending",
    waitTime: 8,
    createdAt: "2025-11-24T18:45:00.000Z",
  },
  {
    id: "TKT-4512",
    subject: "Feature request: export to PDF",
    priority: "normal",
    status: "open",
    waitTime: 4,
    createdAt: "2025-11-25T09:00:00.000Z",
  },
];

const sampleActions: DataTableConfig = {
  surfaceId: "data-table-preview-actions",
  columns: actionsColumns,
  data: actionsData,
  rowIdKey: "id",
  defaultSort: { by: "waitTime", direction: "desc" },
  footerActions: [
    { id: "assign", label: "Assign to me", variant: "default" },
    { id: "escalate", label: "Escalate", variant: "secondary" },
    {
      id: "close",
      label: "Close tickets",
      confirmLabel: "Confirm close",
      variant: "destructive",
    },
  ],
};

export type PresetName =
  | "stocks"
  | "tasks"
  | "metrics"
  | "resources"
  | "localized"
  | "empty"
  | "actions";

export const presets: Record<PresetName, DataTableConfig> = {
  stocks: sampleStocks,
  tasks: sampleTasks,
  metrics: sampleMetrics,
  resources: sampleResources,
  localized: sampleLocalized,
  empty: sampleEmpty,
  actions: sampleActions,
};

export const presetDescriptions: Record<PresetName, string> = {
  stocks: "Market data with currency, delta, and percent formatting",
  tasks: "Status pills, boolean badges, and date formatting",
  metrics: "Numbers with units, inverted deltas, and default sorting",
  resources: "Links, tag arrays, and relative dates",
  localized: "German locale formatting for numbers and currency",
  empty: "Empty state messaging with configurable text",
  actions: "Support ticket queue with footer actions",
};
