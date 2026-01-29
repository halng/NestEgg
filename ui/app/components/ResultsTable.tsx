'use client';

import { StockScreenResult } from '../types/screener';

interface ResultsTableProps {
  results: StockScreenResult[];
  onSelectStock: (ticker: string) => void;
}

export default function ResultsTable({ results, onSelectStock }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          No stocks match the current filters. Try adjusting your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Ticker
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Exchange
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Industry
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Filter Metrics
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {results.map((stock) => (
              <tr
                key={stock.ticker}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {stock.ticker}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {stock.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {stock.exchange || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {stock.industry || '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {stock.visibleMetrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        title={`Used in filter: ${metric.metricName}`}
                      >
                        {metric.metricName}: {metric.value.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => onSelectStock(stock.ticker)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing {results.length} stock{results.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
