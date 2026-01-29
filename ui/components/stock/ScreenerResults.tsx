'use client';

import { StockScreeningResult } from '@/lib/types';

interface ScreenerResultsProps {
  results: StockScreeningResult[];
  isLoading: boolean;
  error: string | null;
}

export default function ScreenerResults({ results, isLoading, error }: ScreenerResultsProps) {
  const formatNumber = (value: number | null, decimals: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimals);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Loading results...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-center text-gray-500 py-8">
          No stocks found matching your criteria. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-bold">
          Screening Results ({results.length} {results.length === 1 ? 'stock' : 'stocks'})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Industry</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Exchange</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Rating</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">YoY Change (%)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">P/E</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">P/B</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">ROE (%)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">ROA (%)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Dividend</th>
            </tr>
          </thead>
          <tbody>
            {results.map((stock, index) => (
              <tr 
                key={stock.symbol} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{stock.symbol}</td>
                <td className="px-4 py-3 text-sm">{stock.name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stock.industry || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">{stock.exchange || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.rating, 1)}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  stock.deltaInYear !== null && stock.deltaInYear > 0 
                    ? 'text-green-600' 
                    : stock.deltaInYear !== null && stock.deltaInYear < 0 
                    ? 'text-red-600' 
                    : ''
                }`}>
                  {formatNumber(stock.deltaInYear)}
                </td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.priceToEarning)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.priceToBook)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.roe)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.roa)}</td>
                <td className="px-4 py-3 text-sm text-right">{formatNumber(stock.dividend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
