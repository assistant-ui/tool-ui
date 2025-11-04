"use client";

import { makeAssistantToolUI } from "@assistant-ui/react";
import { DataTable, type Column } from "@/components/data-table";
import type { GetStocksInput, GetStocksOutput } from "@/app/tools/get-stocks";
import type { Stock } from "@/lib/mock-data/stocks";

/**
 * Tool UI for get_stocks - renders stock data using DataTable
 *
 * Displays stock information in a responsive table with:
 * - Desktop: Full table with sortable columns
 * - Mobile: Accordion cards with column prioritization
 */
export const GetStocksUI = makeAssistantToolUI<
  GetStocksInput,
  GetStocksOutput
>({
  toolName: "get_stocks",
  render: ({ result, status }) => {
    if (status.type === "running") {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            Fetching stock data...
          </p>
        </div>
      );
    }

    if (status.type === "incomplete") {
      return (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive text-sm">
            Failed to fetch stock data. Please try again.
          </p>
        </div>
      );
    }

    if (!result) {
      return null;
    }

    const { stocks, count } = result;

    if (count === 0) {
      return (
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm">
            No stocks found matching your criteria.
          </p>
        </div>
      );
    }

    const columns: Column<Stock>[] = [
      {
        key: "symbol",
        label: "Symbol",
        sortable: true,
        priority: "primary",
      },
      {
        key: "name",
        label: "Company",
        sortable: true,
        priority: "primary",
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        align: "right",
        priority: "primary",
        format: { kind: "currency", currency: "USD", decimals: 2 },
      },
      {
        key: "change",
        label: "Change",
        sortable: true,
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
        label: "Change Percent",
        abbr: "Change %",
        sortable: true,
        align: "right",
        priority: "secondary",
        format: { kind: "percent", decimals: 2, showSign: true, basis: "unit" },
      },
      {
        key: "volume",
        label: "Volume",
        abbr: "Vol",
        sortable: true,
        align: "right",
        priority: "secondary",
        format: { kind: "number", compact: true },
      },
      {
        key: "marketCap",
        label: "Market Capitalization",
        abbr: "Mkt Cap",
        sortable: true,
        align: "right",
        priority: "secondary",
        format: { kind: "number", compact: true },
      },
      {
        key: "pe",
        label: "Price to Earnings Ratio",
        abbr: "P/E",
        sortable: true,
        align: "right",
        priority: "tertiary",
      },
      {
        key: "eps",
        label: "Earnings Per Share",
        abbr: "EPS",
        sortable: true,
        align: "right",
        priority: "tertiary",
      },
    ];

    return (
      <div className="flex flex-col gap-2">
        <div className="text-muted-foreground text-sm">
          Showing {count} {count === 1 ? "stock" : "stocks"}
        </div>
        <DataTable<Stock>
          rowIdKey="symbol"
          columns={columns as Column<Stock>[]}
          data={stocks}
        />
      </div>
    );
  },
});
