import type { Column, RowPrimitive } from "@/components/tool-ui/data-table";
import type { SerializableAction } from "@/components/tool-ui/shared";

type GenericRow = Record<string, RowPrimitive>;
export type SortState = { by?: string; direction?: "asc" | "desc" };

export interface DataTableConfig {
  id: string;
  columns: Column[];
  data: GenericRow[];
  rowIdKey?: string;
  defaultSort?: SortState;
  maxHeight?: string;
  emptyMessage?: string;
  locale?: string;
  responseActions?: SerializableAction[];
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
  id: "data-table-preview-stocks",
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
  id: "data-table-preview-tasks",
  columns: taskColumns,
  data: taskData,
  rowIdKey: "title",
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
  id: "data-table-preview-resources",
  columns: resourceColumns,
  data: resourceData,
  rowIdKey: "name",
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
  id: "data-table-preview-actions",
  columns: actionsColumns,
  data: actionsData,
  rowIdKey: "id",
  defaultSort: { by: "waitTime", direction: "desc" },
  responseActions: [
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

// ============================================================
// HARDWARE CATALOG (E-commerce pattern)
// Demonstrates: currency, number (inventory), badge, array, link
// ============================================================
const hardwareColumns: Column<GenericRow>[] = [
  { key: "model", label: "Model", priority: "primary" },
  { key: "manufacturer", label: "Manufacturer", priority: "primary" },
  {
    key: "price",
    label: "Price",
    align: "right",
    priority: "primary",
    format: { kind: "currency", currency: "USD", decimals: 2 },
  },
  {
    key: "stock",
    label: "Stock",
    align: "right",
    priority: "secondary",
    format: { kind: "number", decimals: 0 },
  },
  {
    key: "category",
    label: "Category",
    priority: "secondary",
    format: {
      kind: "badge",
      colorMap: {
        processor: "info",
        memory: "success",
        storage: "warning",
        peripheral: "neutral",
      },
    },
  },
  {
    key: "features",
    label: "Features",
    priority: "tertiary",
    format: { kind: "array", maxVisible: 2 },
  },
  {
    key: "datasheet",
    label: "Specs",
    priority: "tertiary",
    format: { kind: "link", external: true },
  },
];

const hardwareData: GenericRow[] = [
  {
    model: "Intel 4004",
    manufacturer: "Intel",
    price: 450.0,
    stock: 12,
    category: "processor",
    features: ["4-bit", "740kHz", "2300 transistors"],
    datasheet: "https://intel.com/4004",
  },
  {
    model: "MOS 6502",
    manufacturer: "MOS Technology",
    price: 25.0,
    stock: 847,
    category: "processor",
    features: ["8-bit", "1MHz", "Apple II"],
    datasheet: "https://mos.com/6502",
  },
  {
    model: "Magnetic Core Array",
    manufacturer: "IBM",
    price: 1200.0,
    stock: 3,
    category: "memory",
    features: ["4KB", "non-volatile", "hand-woven"],
    datasheet: "https://ibm.com/core",
  },
  {
    model: "CDC 6600 Disk Pack",
    manufacturer: "Control Data",
    price: 3500.0,
    stock: 0,
    category: "storage",
    features: ["100MB", "removable", "RAID-0"],
    datasheet: "https://cdc.com/disk",
  },
  {
    model: "Teletype Model 33",
    manufacturer: "Teletype Corp",
    price: 750.0,
    stock: 24,
    category: "peripheral",
    features: ["110 baud", "ASCII", "paper tape"],
    datasheet: "https://teletype.com/33",
  },
];

const sampleHardware: DataTableConfig = {
  id: "data-table-preview-hardware",
  columns: hardwareColumns,
  data: hardwareData,
  rowIdKey: "model",
};

// ============================================================
// SYSTEM METRICS (Analytics pattern)
// Demonstrates: number (compact), percent, delta, date (relative)
// ============================================================
const metricsColumns: Column<GenericRow>[] = [
  { key: "system", label: "System", priority: "primary" },
  {
    key: "uptime",
    label: "Uptime",
    align: "right",
    priority: "primary",
    format: { kind: "percent", decimals: 1, basis: "unit" },
  },
  {
    key: "jobs",
    label: "Jobs/Day",
    align: "right",
    priority: "primary",
    format: { kind: "number", compact: true },
  },
  {
    key: "jobsDelta",
    label: "vs Last Week",
    align: "right",
    priority: "secondary",
    format: { kind: "delta", decimals: 1, upIsPositive: true, showSign: true },
  },
  {
    key: "errorRate",
    label: "Errors",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 2, basis: "unit" },
  },
  {
    key: "lastReboot",
    label: "Last Reboot",
    priority: "tertiary",
    format: { kind: "date", dateFormat: "relative" },
  },
];

const metricsData: GenericRow[] = [
  {
    system: "ENIAC",
    uptime: 94.2,
    jobs: 156000,
    jobsDelta: 12.5,
    errorRate: 2.3,
    lastReboot: "2025-11-01T08:00:00.000Z",
  },
  {
    system: "UNIVAC I",
    uptime: 99.1,
    jobs: 423000,
    jobsDelta: -3.2,
    errorRate: 0.8,
    lastReboot: "2025-10-15T14:30:00.000Z",
  },
  {
    system: "IBM 701",
    uptime: 87.6,
    jobs: 89000,
    jobsDelta: 45.0,
    errorRate: 5.1,
    lastReboot: "2025-11-20T22:15:00.000Z",
  },
  {
    system: "SAGE",
    uptime: 99.9,
    jobs: 2100000,
    jobsDelta: 0.3,
    errorRate: 0.01,
    lastReboot: "2025-06-01T00:00:00.000Z",
  },
  {
    system: "PDP-1",
    uptime: 78.4,
    jobs: 34000,
    jobsDelta: -15.7,
    errorRate: 8.2,
    lastReboot: "2025-11-25T16:45:00.000Z",
  },
];

const sampleMetrics: DataTableConfig = {
  id: "data-table-preview-metrics",
  columns: metricsColumns,
  data: metricsData,
  rowIdKey: "system",
  defaultSort: { by: "uptime", direction: "desc" },
};

// ============================================================
// PROJECT LEDGER (Financial pattern)
// Demonstrates: currency, status, date, boolean
// ============================================================
const ledgerColumns: Column<GenericRow>[] = [
  { key: "project", label: "Project", priority: "primary" },
  {
    key: "budget",
    label: "Budget",
    align: "right",
    priority: "primary",
    format: { kind: "currency", currency: "USD", decimals: 0 },
  },
  {
    key: "spent",
    label: "Spent",
    align: "right",
    priority: "primary",
    format: { kind: "currency", currency: "USD", decimals: 0 },
  },
  {
    key: "status",
    label: "Status",
    priority: "secondary",
    format: {
      kind: "status",
      statusMap: {
        on_track: { tone: "success", label: "On Track" },
        at_risk: { tone: "warning", label: "At Risk" },
        over_budget: { tone: "danger", label: "Over Budget" },
        completed: { tone: "info", label: "Completed" },
      },
    },
  },
  {
    key: "fundedDate",
    label: "Funded",
    priority: "secondary",
    format: { kind: "date", dateFormat: "short" },
  },
  {
    key: "classified",
    label: "Classified",
    priority: "tertiary",
    format: { kind: "boolean", labels: { true: "Yes", false: "No" } },
  },
];

const ledgerData: GenericRow[] = [
  {
    project: "ARPANET Phase I",
    budget: 1500000,
    spent: 1420000,
    status: "completed",
    fundedDate: "1969-01-01",
    classified: false,
  },
  {
    project: "Alto Development",
    budget: 2800000,
    spent: 3100000,
    status: "over_budget",
    fundedDate: "1972-03-15",
    classified: false,
  },
  {
    project: "Multics Security",
    budget: 850000,
    spent: 420000,
    status: "on_track",
    fundedDate: "1970-06-01",
    classified: true,
  },
  {
    project: "CP/M Licensing",
    budget: 50000,
    spent: 48500,
    status: "at_risk",
    fundedDate: "1974-11-20",
    classified: false,
  },
  {
    project: "Ethernet Protocol",
    budget: 1200000,
    spent: 890000,
    status: "on_track",
    fundedDate: "1973-05-22",
    classified: false,
  },
];

const sampleLedger: DataTableConfig = {
  id: "data-table-preview-ledger",
  columns: ledgerColumns,
  data: ledgerData,
  rowIdKey: "project",
};

// ============================================================
// COMPUTING MILESTONES (Timeline pattern)
// Demonstrates: date (long), status (multi-level), boolean, link
// ============================================================
const milestonesColumns: Column<GenericRow>[] = [
  { key: "event", label: "Milestone", priority: "primary" },
  {
    key: "date",
    label: "Date",
    priority: "primary",
    format: { kind: "date", dateFormat: "long" },
  },
  {
    key: "significance",
    label: "Impact",
    priority: "primary",
    format: {
      kind: "status",
      statusMap: {
        foundational: { tone: "danger", label: "Foundational" },
        major: { tone: "warning", label: "Major" },
        notable: { tone: "info", label: "Notable" },
        incremental: { tone: "neutral", label: "Incremental" },
      },
    },
  },
  {
    key: "documented",
    label: "Documented",
    priority: "secondary",
    format: { kind: "boolean" },
  },
  {
    key: "reference",
    label: "Source",
    priority: "tertiary",
    format: { kind: "link", external: true },
  },
];

const milestonesData: GenericRow[] = [
  {
    event: "First stored program executed (Manchester Baby)",
    date: "1948-06-21",
    significance: "foundational",
    documented: true,
    reference: "https://computerhistory.org/baby",
  },
  {
    event: "FORTRAN compiler released",
    date: "1957-04-15",
    significance: "foundational",
    documented: true,
    reference: "https://ibm.com/fortran",
  },
  {
    event: "First email sent on ARPANET",
    date: "1971-10-29",
    significance: "major",
    documented: true,
    reference: "https://arpanet.org/email",
  },
  {
    event: "Xerox Alto demonstration",
    date: "1973-03-01",
    significance: "major",
    documented: false,
    reference: "https://parc.com/alto",
  },
  {
    event: "VisiCalc released for Apple II",
    date: "1979-10-17",
    significance: "major",
    documented: true,
    reference: "https://visicalc.com",
  },
];

const sampleMilestones: DataTableConfig = {
  id: "data-table-preview-milestones",
  columns: milestonesColumns,
  data: milestonesData,
  rowIdKey: "event",
  defaultSort: { by: "date", direction: "asc" },
};

// ============================================================
// DIGITAL ARCHIVES (File browser pattern)
// Demonstrates: number (file size), date, badge, link, array
// ============================================================
const archivesColumns: Column<GenericRow>[] = [
  { key: "filename", label: "File", priority: "primary" },
  {
    key: "sizeBytes",
    label: "Size",
    abbr: "Size",
    align: "right",
    priority: "primary",
    format: { kind: "number", compact: true, unit: "B" },
  },
  {
    key: "type",
    label: "Type",
    priority: "primary",
    format: {
      kind: "badge",
      colorMap: {
        source: "info",
        binary: "warning",
        document: "success",
        image: "neutral",
      },
    },
  },
  {
    key: "modified",
    label: "Modified",
    priority: "secondary",
    format: { kind: "date", dateFormat: "relative" },
  },
  {
    key: "permissions",
    label: "Access",
    priority: "secondary",
    format: { kind: "array", maxVisible: 3 },
  },
  {
    key: "path",
    label: "Location",
    priority: "tertiary",
    format: { kind: "link" },
  },
];

const archivesData: GenericRow[] = [
  {
    filename: "hello.c",
    sizeBytes: 1024,
    type: "source",
    modified: "2025-11-28T10:30:00.000Z",
    permissions: ["read", "write", "execute"],
    path: "/usr/src/hello.c",
  },
  {
    filename: "kernel.bin",
    sizeBytes: 524288,
    type: "binary",
    modified: "2025-11-15T08:00:00.000Z",
    permissions: ["read", "execute"],
    path: "/boot/kernel.bin",
  },
  {
    filename: "README.txt",
    sizeBytes: 2048,
    type: "document",
    modified: "2025-11-20T14:45:00.000Z",
    permissions: ["read"],
    path: "/docs/README.txt",
  },
  {
    filename: "logo.xbm",
    sizeBytes: 4096,
    type: "image",
    modified: "2025-10-01T09:00:00.000Z",
    permissions: ["read", "write"],
    path: "/assets/logo.xbm",
  },
  {
    filename: "libc.a",
    sizeBytes: 2097152,
    type: "binary",
    modified: "2025-11-01T00:00:00.000Z",
    permissions: ["read"],
    path: "/lib/libc.a",
  },
];

const sampleArchives: DataTableConfig = {
  id: "data-table-preview-archives",
  columns: archivesColumns,
  data: archivesData,
  rowIdKey: "filename",
};

// ============================================================
// PARTS INVENTORY (Inventory management pattern)
// Demonstrates: number (stock), status (levels), currency, delta
// ============================================================
const inventoryColumns: Column<GenericRow>[] = [
  { key: "partNumber", label: "Part #", priority: "primary" },
  { key: "description", label: "Description", priority: "primary", truncate: true },
  {
    key: "quantity",
    label: "Qty",
    align: "right",
    priority: "primary",
    format: { kind: "number", decimals: 0 },
  },
  {
    key: "stockLevel",
    label: "Status",
    priority: "primary",
    format: {
      kind: "status",
      statusMap: {
        adequate: { tone: "success", label: "In Stock" },
        low: { tone: "warning", label: "Low Stock" },
        critical: { tone: "danger", label: "Critical" },
        out: { tone: "danger", label: "Out of Stock" },
      },
    },
  },
  {
    key: "unitCost",
    label: "Unit Cost",
    align: "right",
    priority: "secondary",
    format: { kind: "currency", currency: "USD", decimals: 2 },
  },
  {
    key: "weeklyChange",
    label: "Weekly",
    align: "right",
    priority: "secondary",
    format: { kind: "delta", decimals: 0, upIsPositive: false, showSign: true },
  },
];

const inventoryData: GenericRow[] = [
  {
    partNumber: "VAC-12AX7",
    description: "Vacuum tube, dual triode, audio preamp",
    quantity: 2400,
    stockLevel: "adequate",
    unitCost: 12.5,
    weeklyChange: -120,
  },
  {
    partNumber: "RES-1K-5W",
    description: "Carbon resistor, 1K ohm, 5 watt",
    quantity: 150,
    stockLevel: "low",
    unitCost: 0.15,
    weeklyChange: -340,
  },
  {
    partNumber: "CAP-10UF",
    description: "Electrolytic capacitor, 10uF, 50V",
    quantity: 0,
    stockLevel: "out",
    unitCost: 0.45,
    weeklyChange: -85,
  },
  {
    partNumber: "TRANS-PWR",
    description: "Power transformer, 120V to 6.3V/250V",
    quantity: 8,
    stockLevel: "critical",
    unitCost: 45.0,
    weeklyChange: -4,
  },
  {
    partNumber: "WIRE-22AWG",
    description: "Hookup wire, 22 AWG, solid core (per ft)",
    quantity: 50000,
    stockLevel: "adequate",
    unitCost: 0.02,
    weeklyChange: 10000,
  },
];

const sampleInventory: DataTableConfig = {
  id: "data-table-preview-inventory",
  columns: inventoryColumns,
  data: inventoryData,
  rowIdKey: "partNumber",
  defaultSort: { by: "quantity", direction: "asc" },
};

// ============================================================
// LARGE DATASET (Performance testing)
// Demonstrates: Scrolling behavior with 100+ rows
// ============================================================
function generateLargeDataset(): GenericRow[] {
  const systems = [
    "ENIAC", "UNIVAC", "IBM 701", "SAGE", "PDP-1", "IBM 7090",
    "CDC 6600", "PDP-8", "IBM System/360", "PDP-11", "Alto",
    "Apple II", "VAX-11", "IBM PC", "Macintosh", "NeXT"
  ];
  const statuses = ["online", "maintenance", "offline", "degraded"];
  const rows: GenericRow[] = [];

  for (let i = 0; i < 120; i++) {
    const system = systems[i % systems.length];
    const instance = Math.floor(i / systems.length) + 1;
    rows.push({
      id: `SYS-${String(i + 1).padStart(4, "0")}`,
      name: `${system} #${instance}`,
      status: statuses[i % statuses.length],
      cpu: Math.round(Math.random() * 100),
      memory: Math.round(Math.random() * 100),
      lastSeen: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    });
  }
  return rows;
}

const largeDatasetColumns: Column<GenericRow>[] = [
  { key: "id", label: "ID", priority: "primary" },
  { key: "name", label: "System", priority: "primary" },
  {
    key: "status",
    label: "Status",
    priority: "primary",
    format: {
      kind: "status",
      statusMap: {
        online: { tone: "success" },
        maintenance: { tone: "warning" },
        offline: { tone: "danger" },
        degraded: { tone: "info" },
      },
    },
  },
  {
    key: "cpu",
    label: "CPU %",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 0, basis: "unit" },
  },
  {
    key: "memory",
    label: "Mem %",
    align: "right",
    priority: "secondary",
    format: { kind: "percent", decimals: 0, basis: "unit" },
  },
  {
    key: "lastSeen",
    label: "Last Seen",
    priority: "tertiary",
    format: { kind: "date", dateFormat: "relative" },
  },
];

const sampleLargeDataset: DataTableConfig = {
  id: "data-table-preview-large",
  columns: largeDatasetColumns,
  data: generateLargeDataset(),
  rowIdKey: "id",
  maxHeight: "400px",
};

export type PresetName =
  | "stocks"
  | "tasks"
  | "resources"
  | "actions"
  // New presets
  | "hardware"      // E-commerce style: vintage hardware catalog
  | "metrics"       // Analytics: system performance metrics
  | "ledger"        // Financial: computing project expenses
  | "milestones"    // Timeline: computing history milestones
  | "archives"      // File browser: digital archive files
  | "inventory"     // Inventory: parts and components
  | "largeDataset"; // Performance: 100+ rows

export const presets: Record<PresetName, DataTableConfig> = {
  stocks: sampleStocks,
  tasks: sampleTasks,
  resources: sampleResources,
  actions: sampleActions,
  // New presets
  hardware: sampleHardware,
  metrics: sampleMetrics,
  ledger: sampleLedger,
  milestones: sampleMilestones,
  archives: sampleArchives,
  inventory: sampleInventory,
  largeDataset: sampleLargeDataset,
};

export const presetDescriptions: Record<PresetName, string> = {
  stocks: "Market data with currency, delta, and percent formatting",
  tasks: "Status pills, boolean badges, and date formatting",
  resources: "Links, tag arrays, badges, and relative dates",
  actions: "Support ticket queue with response actions",
  hardware: "Vintage hardware catalog with inventory and categories",
  metrics: "System performance with uptime, throughput, and trends",
  ledger: "Project finances with budget tracking and status",
  milestones: "Historical timeline with significance levels",
  archives: "File browser with sizes, types, and permissions",
  inventory: "Parts management with stock levels and reorder alerts",
  largeDataset: "100+ rows for scroll and performance testing",
};
