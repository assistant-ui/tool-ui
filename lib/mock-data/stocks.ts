/**
 * Mock stock data service
 * Structured for easy replacement with real API later
 */

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe?: number;
  eps?: number;
}

const mockStockData: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 178.25,
    change: 2.35,
    changePercent: 1.34,
    volume: 48532100,
    marketCap: 2780000000000,
    pe: 29.5,
    eps: 6.05,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.91,
    change: -1.24,
    changePercent: -0.33,
    volume: 22451800,
    marketCap: 2810000000000,
    pe: 35.2,
    eps: 10.76,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 139.67,
    change: 0.89,
    changePercent: 0.64,
    volume: 19234500,
    marketCap: 1750000000000,
    pe: 26.8,
    eps: 5.21,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 145.32,
    change: 3.12,
    changePercent: 2.19,
    volume: 35678900,
    marketCap: 1500000000000,
    pe: 58.4,
    eps: 2.49,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 242.18,
    change: -5.67,
    changePercent: -2.29,
    volume: 89234100,
    marketCap: 768000000000,
    pe: 73.2,
    eps: 3.31,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 485.62,
    change: 8.45,
    changePercent: 1.77,
    volume: 41256700,
    marketCap: 1190000000000,
    pe: 115.8,
    eps: 4.19,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 325.78,
    change: 4.23,
    changePercent: 1.32,
    volume: 15234800,
    marketCap: 825000000000,
    pe: 28.6,
    eps: 11.39,
  },
  {
    symbol: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    price: 362.45,
    change: -0.87,
    changePercent: -0.24,
    volume: 2145300,
    marketCap: 790000000000,
    pe: 8.9,
    eps: 40.73,
  },
];

export interface GetStocksParams {
  symbols?: string[];
  limit?: number;
  sortBy?: "symbol" | "price" | "change" | "marketCap";
  sortDirection?: "asc" | "desc";
}

/**
 * Get stock data
 *
 * In production, replace this with actual API calls:
 * - Use Alpha Vantage, Finnhub, or similar API
 * - Add authentication and API key management
 * - Implement caching for rate limit compliance
 * - Add error handling for API failures
 */
export async function getStocks(params: GetStocksParams = {}): Promise<Stock[]> {
  const {
    symbols,
    limit,
    sortBy = "symbol",
    sortDirection = "asc",
  } = params;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let stocks = [...mockStockData];

  // Filter by symbols if provided
  if (symbols && symbols.length > 0) {
    const upperSymbols = symbols.map((s) => s.toUpperCase());
    stocks = stocks.filter((stock) => upperSymbols.includes(stock.symbol));
  }

  // Sort
  stocks.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Limit results
  if (limit && limit > 0) {
    stocks = stocks.slice(0, limit);
  }

  return stocks;
}

/**
 * Get a single stock by symbol
 */
export async function getStock(symbol: string): Promise<Stock | null> {
  const stocks = await getStocks({ symbols: [symbol] });
  return stocks[0] || null;
}
