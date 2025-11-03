"use client";

import { useState } from "react";
import { DataTable } from "./index";

const sampleColumns = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Company" },
  { key: "price", label: "Price", align: "right" as const },
  { key: "change", label: "Change %", align: "right" as const },
  { key: "volume", label: "Volume", align: "right" as const },
];

const sampleColumnsWithPriority = [
  { key: "symbol", label: "Symbol", priority: "primary" as const },
  { key: "name", label: "Company", priority: "primary" as const },
  {
    key: "price",
    label: "Price",
    align: "right" as const,
    priority: "primary" as const,
  },
  {
    key: "change",
    label: "Change %",
    align: "right" as const,
    priority: "secondary" as const,
  },
  {
    key: "volume",
    label: "Volume",
    align: "right" as const,
    priority: "secondary" as const,
  },
  {
    key: "marketCap",
    label: "Market Cap",
    align: "right" as const,
    priority: "secondary" as const,
  },
  {
    key: "pe",
    label: "P/E Ratio",
    align: "right" as const,
    priority: "tertiary" as const,
  },
];

const sampleData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.25,
    change: 2.3,
    volume: 52430000,
    marketCap: "2.8T",
    pe: 29.5,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.5,
    change: -0.8,
    volume: 28920000,
    marketCap: "1.8T",
    pe: 24.3,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 380.0,
    change: 1.2,
    volume: 31250000,
    marketCap: "2.9T",
    pe: 35.7,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 155.75,
    change: 3.1,
    volume: 45680000,
    marketCap: "1.6T",
    pe: 68.2,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.8,
    change: -1.5,
    volume: 98540000,
    marketCap: "768B",
    pe: 42.1,
  },
];

const sampleActions = [
  { id: "view", label: "View Details", variant: "secondary" as const },
  { id: "buy", label: "Buy", variant: "default" as const },
  { id: "sell", label: "Sell", variant: "destructive" as const },
];

export function DataTableExample() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Basic Table</h2>
        <DataTable columns={sampleColumns} data={sampleData} />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">
          With Column Priorities (Mobile Responsive)
        </h2>
        <p className="text-muted-foreground mb-4 text-sm">
          On mobile: Primary columns show in card header, secondary columns in
          expandable section, tertiary columns hidden.
        </p>
        <DataTable
          columns={sampleColumnsWithPriority}
          data={sampleData}
          actions={sampleActions}
          onAction={(actionId, row) => {
            console.log(`Action: ${actionId}`, row);
            alert(`${actionId} ${row.symbol}`);
          }}
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">With Actions</h2>
        <DataTable
          columns={sampleColumns}
          data={sampleData}
          actions={sampleActions}
          onAction={(actionId, row) => {
            console.log(`Action: ${actionId}`, row);
            alert(`${actionId} ${row.symbol}`);
          }}
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Empty State</h2>
        <DataTable
          columns={sampleColumns}
          data={[]}
          emptyMessage="No stocks found. Try adjusting your filters."
        />
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">Loading State</h2>
        <div className="space-y-2">
          <button
            onClick={() => setIsLoading(!isLoading)}
            className="bg-primary text-primary-foreground rounded px-4 py-2"
          >
            Toggle Loading
          </button>
          <DataTable
            columns={sampleColumns}
            data={sampleData}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">With Max Height</h2>
        <DataTable
          columns={sampleColumns}
          data={[...sampleData, ...sampleData, ...sampleData]}
          maxHeight="300px"
        />
      </div>
    </div>
  );
}
