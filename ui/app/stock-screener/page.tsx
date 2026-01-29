'use client';

import { useState, useEffect } from 'react';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  marketCap: number | null;
}

interface ApiResponse {
  code: number;
  message: string;
  data: Stock[];
  success: boolean;
  timestamp: string;
}

type SortBy = 'symbol' | 'marketCap';
type SortOrder = 'asc' | 'desc';

export default function StockScreener() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('symbol');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchStocks();
  }, [sortBy, sortOrder]);

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:9009/api/v1/portfolio-management/stocks?sortBy=${sortBy}&sortOrder=${sortOrder}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }

      const result: ApiResponse = await response.json();
      setStocks(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const formatMarketCap = (marketCap: number | null): string => {
    if (marketCap === null || marketCap === undefined) {
      return 'N/A';
    }
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Stock Screener
          </h1>
          <div className="flex items-center justify-center py-12">
            <div className="text-zinc-600 dark:text-zinc-400">Loading stocks...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Stock Screener
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Stock Screener
          </h1>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                No Market Data Available
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                No stock data is currently available. Please synchronize market data to view the stock universe.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Stock Screener
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Explore {stocks.length} stocks from the market universe
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sort by:
            </span>
            <button
              onClick={() => handleSortChange('symbol')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'symbol'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Symbol {sortBy === 'symbol' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('marketCap')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'marketCap'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              Market Cap {sortBy === 'marketCap' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Stock List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map((stock) => (
            <div
              key={`${stock.symbol}-${stock.exchange}`}
              className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {stock.symbol}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {stock.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-500">Exchange</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {stock.exchange || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 dark:text-zinc-500">Market Cap</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatMarketCap(stock.marketCap)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
