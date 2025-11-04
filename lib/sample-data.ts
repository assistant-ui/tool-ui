import type { Column, Action, RowPrimitive } from "@/components/data-table";

export interface DataTableConfig {
  columns: Column[];
  data: Record<string, string | number | boolean | null>[];
  actions?: Action[];
  rowIdKey?: string;
}

export const sampleStocks: DataTableConfig = {
  columns: [
    { key: "symbol", label: "Symbol" } as Column<Record<string, RowPrimitive>>, 
    { key: "price", label: "Price", align: "right", format: { kind: "currency", currency: "USD", decimals: 2 } } as Column<Record<string, RowPrimitive>>,
    { key: "change", label: "Change", align: "right", format: { kind: "delta", decimals: 2, upIsPositive: true, showSign: true } } as Column<Record<string, RowPrimitive>>,
    { key: "volume", label: "Volume", align: "right", format: { kind: "number", compact: true } } as Column<Record<string, RowPrimitive>>,
  ],
  data: [
    { symbol: "AAPL", price: 178.25, change: 2.35, volume: 52431200 },
    { symbol: "GOOGL", price: 142.5, change: -0.87, volume: 28392100 },
    { symbol: "MSFT", price: 380.0, change: 1.24, volume: 31284500 },
    { symbol: "AMZN", price: 152.75, change: 3.12, volume: 48392100 },
    { symbol: "TSLA", price: 242.8, change: -5.67, volume: 115382900 },
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
    { key: "name", label: "Product" } as Column<Record<string, RowPrimitive>>,
    { key: "category", label: "Category", format: { kind: "badge", colorMap: { Tools: "info", Electronics: "warning", Accessories: "neutral" } } } as Column<Record<string, RowPrimitive>>,
    { key: "price", label: "Price", align: "right", format: { kind: "currency", currency: "USD", decimals: 2 } } as Column<Record<string, RowPrimitive>>,
    { key: "stock", label: "In Stock", align: "right", format: { kind: "number", decimals: 0 } } as Column<Record<string, RowPrimitive>>,
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
    { key: "id", label: "ID", align: "left" } as Column<Record<string, RowPrimitive>>,
    { key: "name", label: "Name" } as Column<Record<string, RowPrimitive>>,
    { key: "status", label: "Status", format: { kind: "status", statusMap: {
      Active: { tone: "success" },
      Pending: { tone: "warning" },
      Completed: { tone: "success" },
      Inactive: { tone: "neutral" },
    } } } as Column<Record<string, RowPrimitive>>,
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
    { key: "id", label: "ID", align: "left" } as Column<Record<string, RowPrimitive>>,
    { key: "user", label: "User" } as Column<Record<string, RowPrimitive>>,
    { key: "email", label: "Email", format: { kind: "link" } } as Column<Record<string, RowPrimitive>>,
    { key: "role", label: "Role", format: { kind: "badge", colorMap: { Admin: "danger", Editor: "info", Viewer: "neutral" } } } as Column<Record<string, RowPrimitive>>,
    { key: "status", label: "Status", format: { kind: "status", statusMap: { Active: { tone: "success" }, Inactive: { tone: "neutral" } } } } as Column<Record<string, RowPrimitive>>,
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
