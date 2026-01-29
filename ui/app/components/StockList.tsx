'use client';

import { Stock } from '../types/stock';

interface StockListProps {
  stocks: Stock[];
  totalCount: number;
}

/**
 * Component to display a list of stocks in a table format
 */
export function StockList({ stocks, totalCount }: StockListProps) {
  const formatNumber = (num: number | null, decimals: number = 2): string => {
    if (num === null) return 'N/A';
    return num.toFixed(decimals);
  };

  const formatMarketCap = (marketCap: number): string => {
    return `$${marketCap.toFixed(0)}B`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Stock Results
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Showing {stocks.length} of {totalCount} stocks
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                P/E Ratio
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                ROE (%)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                D/E
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Rev Growth (%)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  No stocks match the current filter criteria
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-700 dark:text-zinc-300">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {stock.sector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-700 dark:text-zinc-300">
                    {formatMarketCap(stock.marketCap)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-700 dark:text-zinc-300">
                    {formatNumber(stock.peRatio, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-700 dark:text-zinc-300">
                    {formatNumber(stock.roe, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-700 dark:text-zinc-300">
                    {formatNumber(stock.debtToEquity, 2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-zinc-700 dark:text-zinc-300">
                    {formatNumber(stock.revenueGrowth, 1)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
