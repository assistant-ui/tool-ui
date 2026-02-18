import type { Column, RowPrimitive } from "@/components/tool-ui/data-table";
import type { SerializableAction } from "@/components/tool-ui/shared";
import type { PresetWithCodeGen } from "./types";

type GenericRow = Record<string, RowPrimitive>;

export type SortState = { by?: string; direction?: "asc" | "desc" };

export interface DataTableData {
  id: string;
  columns: Column[];
  data: GenericRow[];
  rowIdKey?: string;
  defaultSort?: SortState;
  maxHeight?: string;
  emptyMessage?: string;
  locale?: string;
  localActions?: SerializableAction[];
}

function generateDataTableCode(data: DataTableData): string {
  const props: string[] = [];

  props.push(
    `  columns={${JSON.stringify(data.columns, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  props.push(
    `  data={${JSON.stringify(data.data, null, 4).replace(/\n/g, "\n  ")}}`,
  );

  if (data.rowIdKey) {
    props.push(`  rowIdKey="${data.rowIdKey}"`);
  }

  if (data.defaultSort) {
    props.push(
      `  defaultSort={${JSON.stringify(data.defaultSort, null, 4).replace(/\n/g, "\n  ")}}`,
    );
  }

  if (data.emptyMessage && data.emptyMessage !== "No data available") {
    props.push(`  emptyMessage="${data.emptyMessage}"`);
  }

  if (data.maxHeight) {
    props.push(`  maxHeight="${data.maxHeight}"`);
  }

  if (data.locale) {
    props.push(`  locale="${data.locale}"`);
  }

  const tableCode = `<DataTable\n${props.join("\n")}\n/>`;
  if (!data.localActions || data.localActions.length === 0) {
    return tableCode;
  }

  return `${tableCode}
<LocalActions
  surfaceId="${data.id}"
  actions={${JSON.stringify(data.localActions, null, 2).replace(/\n/g, "\n  ")}}
  onAction={(actionId) => console.log("Local action:", actionId)}
/>`;
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
    format: { kind: "delta", decimals: 2, upIsPositive: true, showSign: true },
  },
  {
    key: "changePercent",
    label: "Change %",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 2, showSign: true, basis: "unit" },
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
    key: "completedDate",
    label: "Completed",
    priority: "tertiary",
    format: { kind: "date", dateFormat: "long" },
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
    completedDate: null,
    isUrgent: true,
  },
  {
    title: "Port FORTRAN IV routines to C",
    status: "todo",
    priority: "critical",
    assignee: "Dennis",
    dueDate: "2025-11-04",
    completedDate: null,
    isUrgent: true,
  },
  {
    title: "Document UNIX pipeline patterns",
    status: "done",
    priority: "low",
    assignee: "Ken",
    dueDate: "2025-10-28",
    completedDate: "2025-10-27",
    isUrgent: false,
  },
  {
    title: "Design WIMP interface prototype",
    status: "blocked",
    priority: "medium",
    assignee: "Adele",
    dueDate: "2025-11-10",
    completedDate: null,
    isUrgent: false,
  },
  {
    title: "Optimize RISC instruction scheduling",
    status: "in_progress",
    priority: "medium",
    assignee: "Sophie",
    dueDate: "2025-11-08",
    completedDate: null,
    isUrgent: false,
  },
];

const linksTagsColumns: Column<GenericRow>[] = [
  { key: "name", label: "Resource", priority: "primary" },
  {
    key: "linkLabel",
    label: "Link",
    priority: "primary",
    truncate: true,
    format: { kind: "link", hrefKey: "url", external: true },
  },
  {
    key: "tags",
    label: "Tags",
    priority: "secondary",
    format: { kind: "array", maxVisible: 2 },
  },
];

const linksTagsData: GenericRow[] = [
  {
    name: "UNIX Philosophy",
    linkLabel: "Read chapter",
    url: "https://homepage.cs.uri.edu/~thenry/resources/unix_art/ch01s06.html",
    tags: ["unix", "pipelines", "design"],
  },
  {
    name: "ARPANET Origins",
    linkLabel: "Internet Society brief",
    url: "https://www.internetsociety.org/internet/history-internet/brief-history-internet/",
    tags: ["arpanet", "history", "networking"],
  },
  {
    name: "Xerox PARC Archive",
    linkLabel: "Open archive",
    url: "https://xeroxparc.archive.org/",
    tags: ["gui", "research", "innovation"],
  },
  {
    name: "ENIAC Collection",
    linkLabel: "Computer History Museum",
    url: "https://www.computerhistory.org/revolution/early-computers/5",
    tags: ["eniac", "hardware", "history"],
  },
];

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
    format: {
      kind: "delta",
      decimals: 0,
      upIsPositive: false,
      showSign: false,
    },
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

export type DataTablePresetName =
  | "stocks"
  | "tasks"
  | "links-tags"
  | "actions";

export const dataTablePresets: Record<
  DataTablePresetName,
  PresetWithCodeGen<DataTableData>
> = {
  stocks: {
    description: "Market data with currency, delta, and percent formatting",
    data: {
      id: "data-table-preview-stocks",
      columns: stockColumns,
      data: stockData,
      rowIdKey: "symbol",
    },
    generateExampleCode: generateDataTableCode,
  },
  tasks: {
    description: "Status pills, boolean badges, and multiple date formats",
    data: {
      id: "data-table-preview-tasks",
      columns: taskColumns,
      data: taskData,
      rowIdKey: "title",
    },
    generateExampleCode: generateDataTableCode,
  },
  "links-tags": {
    description: "Compact link and tag formatting without wide resource metadata",
    data: {
      id: "data-table-preview-links-tags",
      columns: linksTagsColumns,
      data: linksTagsData,
      rowIdKey: "name",
    },
    generateExampleCode: generateDataTableCode,
  },
  actions: {
    description: "Support queue with external local actions and wait indicators",
    data: {
      id: "data-table-preview-actions",
      columns: actionsColumns,
      data: actionsData,
      rowIdKey: "id",
      defaultSort: { by: "waitTime", direction: "desc" },
      localActions: [
        {
          id: "close",
          label: "Close tickets",
          confirmLabel: "Confirm close",
          variant: "destructive",
        },
        { id: "assign", label: "Assign to me", variant: "default" },
      ],
    },
    generateExampleCode: generateDataTableCode,
  },
};
