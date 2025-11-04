import type { Stock } from "@/lib/mock-data/stocks";

/**
 * Tool input type for get_stocks
 *
 * Must match the inputSchema defined in app/api/chat/route.ts
 */
export interface GetStocksInput {
  query: string;
}

/**
 * Tool output type for get_stocks
 *
 * Note: The tool itself is defined in the API route (app/api/chat/route.ts)
 * for backend execution. This file only exports types for use in the tool UI component.
 */
export interface GetStocksOutput {
  stocks: Stock[];
  count: number;
}
