export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

export interface Action {
  id: string;
  label: string;
  variant?: "default" | "secondary" | "ghost" | "destructive";
  requiresConfirmation?: boolean;
}

export interface DataTableConfig {
  columns: Column[];
  rows: Record<string, string | number | boolean | null>[];
  actions?: Action[];
}

export const sampleStocks: DataTableConfig = {
  columns: [
    { key: "symbol", label: "Symbol" },
    { key: "price", label: "Price", align: "right" },
    { key: "change", label: "Change %", align: "right" },
    { key: "volume", label: "Volume", align: "right" },
  ],
  rows: [
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
};

export const sampleProducts: DataTableConfig = {
  columns: [
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "price", label: "Price", align: "right" },
    { key: "stock", label: "In Stock", align: "right" },
  ],
  rows: [
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
};

export const sampleBasic: DataTableConfig = {
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
  ],
  rows: [
    { id: 1, name: "Item One", status: "Active" },
    { id: 2, name: "Item Two", status: "Pending" },
    { id: 3, name: "Item Three", status: "Completed" },
  ],
};

export const sampleEmpty: DataTableConfig = {
  columns: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "value", label: "Value" },
  ],
  rows: [],
};

export const sampleLarge: DataTableConfig = {
  columns: [
    { key: "id", label: "ID" },
    { key: "user", label: "User" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ],
  rows: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    user: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ["Admin", "Editor", "Viewer"][i % 3],
    status: ["Active", "Inactive"][i % 2],
  })),
  actions: [
    { id: "edit", label: "Edit" },
    { id: "disable", label: "Disable", variant: "destructive" },
  ],
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
