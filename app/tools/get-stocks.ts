import type { Stock } from "@/lib/mock-data/stocks";

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
