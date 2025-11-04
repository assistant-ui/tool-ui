"use client";

import { useState } from "react";
import { DataTable, type Column } from "./index";

// ============================================================================
// Stock Example - Demonstrates: currency, delta, percent
// ============================================================================

type StockRow = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string | number;
};

const stockColumns: Column<StockRow>[] = [
  { key: "symbol", label: "Symbol", priority: "primary" as const },
  { key: "name", label: "Company", priority: "primary" as const },
  {
    key: "price",
    label: "Price",
    align: "right" as const,
    priority: "primary" as const,
    format: { kind: "currency" as const, currency: "USD", decimals: 2 },
  },
  {
    key: "change",
    label: "Change",
    align: "right" as const,
    priority: "secondary" as const,
    format: {
      kind: "delta" as const,
      decimals: 2,
      upIsPositive: true,
      showSign: true,
    },
  },
  {
    key: "changePercent",
    label: "Change %",
    align: "right" as const,
    priority: "secondary" as const,
    format: {
      kind: "percent" as const,
      decimals: 2,
      showSign: true,
      basis: "unit" as const,
    },
  },
  {
    key: "volume",
    label: "Volume",
    align: "right" as const,
    priority: "secondary" as const,
    format: { kind: "number" as const, compact: true },
  },
  {
    key: "marketCap",
    label: "Market Cap",
    align: "right" as const,
    priority: "tertiary" as const,
  },
];

const stockData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.25,
    change: 4.12,
    changePercent: 2.36,
    volume: 52430000,
    marketCap: "2.8T",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.5,
    change: -1.15,
    changePercent: -0.8,
    volume: 28920000,
    marketCap: "1.8T",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 380.0,
    change: 4.56,
    changePercent: 1.22,
    volume: 31250000,
    marketCap: "2.9T",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 155.75,
    change: 4.68,
    changePercent: 3.1,
    volume: 45680000,
    marketCap: "1.6T",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.8,
    change: -3.65,
    changePercent: -1.48,
    volume: 98540000,
    marketCap: "768B",
  },
];

// ============================================================================
// Task Example - Demonstrates: status, date, boolean
// ============================================================================

type TaskRow = {
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string | Date;
  isUrgent: boolean;
};

const taskColumns: Column<TaskRow>[] = [
  { key: "title", label: "Task", priority: "primary" as const },
  {
    key: "status",
    label: "Status",
    priority: "primary" as const,
    format: {
      kind: "status" as const,
      statusMap: {
        todo: { tone: "neutral" as const, label: "To Do" },
        in_progress: { tone: "info" as const, label: "In Progress" },
        done: { tone: "success" as const, label: "Done" },
        blocked: { tone: "danger" as const, label: "Blocked" },
      },
    },
  },
  {
    key: "priority",
    label: "Priority",
    priority: "secondary" as const,
    format: {
      kind: "status" as const,
      statusMap: {
        low: { tone: "success" as const },
        medium: { tone: "warning" as const },
        high: { tone: "danger" as const },
        critical: { tone: "danger" as const, label: "Critical" },
      },
    },
  },
  {
    key: "assignee",
    label: "Assignee",
    priority: "secondary" as const,
  },
  {
    key: "dueDate",
    label: "Due Date",
    priority: "secondary" as const,
    format: { kind: "date" as const, dateFormat: "short" },
  },
  {
    key: "isUrgent",
    label: "Urgent",
    priority: "tertiary" as const,
    format: { kind: "boolean" as const },
  },
];

const taskData = [
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

// ============================================================================
// Metrics Example - Demonstrates: number with units, inverted delta
// ============================================================================

type MetricsRow = {
  endpoint: string;
  p95: number;
  latencyDelta: number;
  errorRate: number;
  throughput: number;
};

const metricsColumns: Column<MetricsRow>[] = [
  { key: "endpoint", label: "Endpoint", priority: "primary" as const },
  {
    key: "p95",
    label: "P95 Latency",
    align: "right" as const,
    priority: "primary" as const,
    format: { kind: "number" as const, decimals: 0, unit: " ms" },
  },
  {
    key: "latencyDelta",
    label: "Δ Latency",
    align: "right" as const,
    priority: "primary" as const,
    format: {
      kind: "delta" as const,
      decimals: 0,
      upIsPositive: false, // Lower latency is better
      showSign: true,
    },
  },
  {
    key: "errorRate",
    label: "Error Rate",
    align: "right" as const,
    priority: "secondary" as const,
    format: { kind: "percent" as const, decimals: 2 },
  },
  {
    key: "throughput",
    label: "Throughput",
    align: "right" as const,
    priority: "secondary" as const,
    format: { kind: "number" as const, compact: true, unit: " req/s" },
  },
];

const metricsData = [
  {
    endpoint: "/api/users",
    p95: 145,
    latencyDelta: -15, // Improved
    errorRate: 0.12,
    throughput: 12500,
  },
  {
    endpoint: "/api/products",
    p95: 230,
    latencyDelta: 25, // Got worse
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

// ============================================================================
// Link Example - Demonstrates: link, badge, array
// ============================================================================

type ResourceRow = {
  name: string;
  category: string;
  url: string;
  tags: string[];
  updatedAt: string | Date;
};

const resourceColumns: Column<ResourceRow>[] = [
  { key: "name", label: "Resource", priority: "primary" as const },
  {
    key: "category",
    label: "Category",
    priority: "primary" as const,
    format: {
      kind: "badge" as const,
      colorMap: {
        documentation: "info" as const,
        tutorial: "success" as const,
        reference: "neutral" as const,
        tool: "warning" as const,
      },
    },
  },
  {
    key: "url",
    label: "Link",
    priority: "secondary" as const,
    format: { kind: "link" as const, external: true },
  },
  {
    key: "tags",
    label: "Tags",
    priority: "secondary" as const,
    format: { kind: "array" as const, maxVisible: 2 },
  },
  {
    key: "updatedAt",
    label: "Last Updated",
    priority: "tertiary" as const,
    format: { kind: "date" as const, dateFormat: "relative" },
  },
];

const resourceData = [
  {
    name: "React Docs",
    category: "documentation",
    url: "https://react.dev",
    tags: ["react", "javascript", "frontend"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    name: "TypeScript Handbook",
    category: "reference",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    tags: ["typescript", "javascript"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    name: "Next.js Tutorial",
    category: "tutorial",
    url: "https://nextjs.org/learn",
    tags: ["nextjs", "react", "fullstack"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    name: "Tailwind CSS",
    category: "tool",
    url: "https://tailwindcss.com",
    tags: ["css", "styling", "utility-first", "responsive"],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
  },
];

// ============================================================================
// Component
// ============================================================================

export function DataTableExample() {
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState<{
    by?: keyof StockRow;
    direction?: "asc" | "desc";
  }>({});

  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="mb-2 text-2xl">Stock Prices</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Demonstrates: currency, delta (gains/losses), percent, compact numbers
        </p>
        <DataTable columns={stockColumns} data={stockData} />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Task List</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Demonstrates: status pills, priority badges, dates, boolean values
        </p>
        <DataTable
          columns={taskColumns}
          data={taskData}
          actions={[
            { id: "edit", label: "Edit", variant: "secondary" },
            { id: "complete", label: "Complete", variant: "default" },
          ]}
          onAction={(actionId, row) => {
            console.log(`Action: ${actionId}`, row);
            alert(`${actionId} task: ${row.title}`);
          }}
        />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">API Metrics</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Demonstrates: numbers with units, inverted delta (lower is better),
          percent
        </p>
        <DataTable columns={metricsColumns} data={metricsData} />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Learning Resources</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Demonstrates: links, badges, tag arrays, relative dates
        </p>
        <DataTable columns={resourceColumns} data={resourceData} />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Empty State</h2>
        <DataTable
          columns={stockColumns}
          data={[]}
          emptyMessage="No data available. Try adjusting your filters."
        />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Loading State</h2>
        <div className="space-y-2">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="bg-primary text-primary-foreground rounded px-4 py-2"
          >
            Toggle Loading
          </button>
          <DataTable
            columns={stockColumns}
            data={stockData}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-2xl">With Max Height (Scrollable)</h2>
        <DataTable
          columns={stockColumns}
          data={[...stockData, ...stockData, ...stockData]}
          maxHeight="300px"
        />
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Controlled Sorting + Clear</h2>
        <div className="mb-2 flex gap-2">
          <button
            onClick={() => {
              setSort({});
            }}
            className="bg-secondary text-secondary-foreground rounded px-3 py-1.5"
          >
            Clear Sort
          </button>
        </div>
        <DataTable
          columns={stockColumns}
          data={stockData}
          rowIdKey="symbol"
          sort={sort}
          onSortChange={(next) => setSort(next)}
        />
      </div>
    </div>
  );
}
