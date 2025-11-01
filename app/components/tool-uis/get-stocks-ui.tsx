"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { DataTable, type Column } from "@/components/data-table";
import type { GetStocksOutput } from "@/app/tools/get-stocks";

/**
 * Tool UI for get_stocks - renders stock data using DataTable
 *
 * Displays stock information in a responsive table with:
 * - Desktop: Full table with sortable columns
 * - Mobile: Accordion cards with column prioritization
 */
export const GetStocksUI = makeAssistantToolUI<
  {
    symbols?: string[];
    limit?: number;
    sortBy?: "symbol" | "price" | "change" | "marketCap";
    sortDirection?: "asc" | "desc";
  },
  GetStocksOutput
>({
  toolName: "get_stocks",
  render: ({ result, status }) => {
    // Show loading state while tool is executing
    if (status.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Fetching stock data...
          </p>
        </div>
      );
    }

    // Show error state if tool execution failed
    if (status.type === "incomplete") {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to fetch stock data. Please try again.
          </p>
        </div>
      );
    }

    // Tool completed successfully - render data
    if (!result) {
      return null;
    }

    const { stocks, count } = result;

    if (count === 0) {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            No stocks found matching your criteria.
          </p>
        </div>
      );
    }

    // Define DataTable columns with mobile priorities
    const columns: Column[] = [
      {
        key: "symbol",
        label: "Symbol",
        sortable: true,
        priority: "primary", // Always visible on mobile
      },
      {
        key: "name",
        label: "Company",
        sortable: true,
        priority: "primary", // Always visible on mobile
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        align: "right",
        priority: "primary", // Always visible on mobile
      },
      {
        key: "change",
        label: "Change",
        sortable: true,
        align: "right",
        priority: "secondary", // Shown when accordion expanded
      },
      {
        key: "changePercent",
        label: "Change Percent",
        abbr: "Change %",
        sortable: true,
        align: "right",
        priority: "secondary", // Shown when accordion expanded
      },
      {
        key: "volume",
        label: "Volume",
        abbr: "Vol",
        sortable: true,
        align: "right",
        priority: "secondary", // Shown when accordion expanded
      },
      {
        key: "marketCap",
        label: "Market Capitalization",
        abbr: "Mkt Cap",
        sortable: true,
        align: "right",
        priority: "secondary", // Shown when accordion expanded
      },
      {
        key: "pe",
        label: "Price to Earnings Ratio",
        abbr: "P/E",
        sortable: true,
        align: "right",
        priority: "tertiary", // Hidden on mobile
      },
      {
        key: "eps",
        label: "Earnings Per Share",
        abbr: "EPS",
        sortable: true,
        align: "right",
        priority: "tertiary", // Hidden on mobile
      },
    ];

    // Format stock data for display
    const formattedRows = stocks.map((stock: any) => ({
      symbol: stock.symbol,
      name: stock.name,
      price: `$${stock.price.toFixed(2)}`,
      change: stock.change >= 0 ? `+$${stock.change.toFixed(2)}` : `-$${Math.abs(stock.change).toFixed(2)}`,
      changePercent: stock.changePercent >= 0 ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`,
      volume: stock.volume.toLocaleString(),
      marketCap: `$${(stock.marketCap / 1_000_000_000).toFixed(1)}B`,
      pe: stock.pe?.toFixed(1) ?? "—",
      eps: stock.eps ? `$${stock.eps.toFixed(2)}` : "—",
    }));

    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Showing {count} {count === 1 ? "stock" : "stocks"}
        </div>
        <DataTable
          columns={columns}
          rows={formattedRows}
        />
      </div>
    );
  },
});
