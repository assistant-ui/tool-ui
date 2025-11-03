import type { Column, Action } from "@/components/data-table";

export interface DataTableConfig {
  columns: Column[];
  data: Record<string, string | number | boolean | null>[];
  actions?: Action[];
  rowIdKey?: string;
}

export const sampleStocks: DataTableConfig = {
  columns: [
    { key: "symbol", label: "Symbol" },
    { key: "price", label: "Price", align: "right", format: { kind: "currency", currency: "USD", decimals: 2 } },
    { key: "change", label: "Change %", align: "right", format: { kind: "percent", decimals: 2, showSign: true, basis: "unit" } },
    { key: "volume", label: "Volume", align: "right", format: { kind: "number", compact: true } },
  ],
  data: [
    { symbol: "AAPL", price: 178.25, change: 2.3, volume: 52431200 },
    { symbol: "GOOGL", price: 142.5, change: -0.8, volume: 28392100 },
    { symbol: "MSFT", price: 380.0, change: 1.2, volume: 31284500 },
    { symbol: "AMZN", price: 152.75, change: -1.5, volume: 48392100 },
    { symbol: "TSLA", price: 242.8, change: 3.7, volume: 115382900 },
  ],
  actions: [
    { id: "view", label: "View Details", variant: "default" },
    { id: "buy", label: "Buy", variant: "secondary" },
    { id: "sell", label: "Sell", variant: "destructive" },
  ],
  rowIdKey: "symbol",
};

export const sampleProducts: DataTableConfig = {
  columns: [
    { key: "name", label: "Product" },
    { key: "category", label: "Category", format: { kind: "badge", colorMap: { Tools: "info", Electronics: "warning", Accessories: "neutral" } } },
    { key: "price", label: "Price", align: "right", format: { kind: "currency", currency: "USD", decimals: 2 } },
    { key: "stock", label: "In Stock", align: "right", format: { kind: "number", decimals: 0 } },
  ],
  data: [
    { name: "Widget Pro", category: "Tools", price: 29.99, stock: 150 },
    { name: "Gadget Plus", category: "Electronics", price: 149.99, stock: 42 },
    { name: "Doohickey", category: "Accessories", price: 9.99, stock: 320 },
    { name: "Thingamajig", category: "Tools", price: 19.99, stock: 89 },
    { name: "Gizmo", category: "Electronics", price: 79.99, stock: 5 },
  ],
  actions: [
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
  rowIdKey: "name",
};

export const sampleBasic: DataTableConfig = {
  columns: [
    { key: "id", label: "ID", align: "right" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", format: { kind: "status", statusMap: {
      Active: { tone: "success" },
      Pending: { tone: "warning" },
      Completed: { tone: "success" },
      Inactive: { tone: "neutral" },
    } } },
  ],
  data: [
    { id: 1, name: "Item One", status: "Active" },
    { id: 2, name: "Item Two", status: "Pending" },
    { id: 3, name: "Item Three", status: "Completed" },
  ],
  rowIdKey: "id",
};

export const sampleEmpty: DataTableConfig = {
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ],
  data: [],
};

export const sampleLarge: DataTableConfig = {
  columns: [
    { key: "id", label: "ID", align: "right" },
    { key: "user", label: "User" },
    { key: "email", label: "Email", format: { kind: "link" } },
    { key: "role", label: "Role", format: { kind: "badge", colorMap: { Admin: "danger", Editor: "info", Viewer: "neutral" } } },
    { key: "status", label: "Status", format: { kind: "status", statusMap: { Active: { tone: "success" }, Inactive: { tone: "neutral" } } } },
  ],
  data: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    user: `User ${i + 1}`,
    email: `https://example.com/users/${i + 1}`,
    role: ["Admin", "Editor", "Viewer"][i % 3],
    status: ["Active", "Inactive"][i % 2],
  })),
  actions: [
    { id: "edit", label: "Edit" },
    { id: "disable", label: "Disable", variant: "destructive" },
  ],
  rowIdKey: "id",
};

export type PresetName =
  | "basic"
  | "stocks"
  | "products"
  | "empty"
  | "large"
  | "with-actions"
  | "sorted";

export const presets: Record<PresetName, DataTableConfig> = {
  basic: sampleBasic,
  stocks: sampleStocks,
  products: sampleProducts,
  empty: sampleEmpty,
  large: sampleLarge,
  "with-actions": sampleStocks,
  sorted: sampleStocks,
};

export const presetDescriptions: Record<PresetName, string> = {
  basic: "Simple 3-column table with minimal data",
  stocks: "Stock market data with numbers and percentages",
  products: "Product catalog with mixed data types",
  empty: "Empty state demonstration",
  large: "Large dataset with 50+ rows",
  "with-actions": "Table with row actions (inline and dropdown)",
  sorted: "Pre-sorted table by a specific column",
};
