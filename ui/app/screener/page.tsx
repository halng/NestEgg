'use client';

import { useState } from 'react';
import { screenStocks } from '@/lib/api';
import { ScreeningCriteria, StockScreeningResult } from '@/lib/types';
import ScreenerFilters from '@/components/stock/ScreenerFilters';
import ScreenerResults from '@/components/stock/ScreenerResults';

export default function StockScreenerPage() {
  const [results, setResults] = useState<StockScreeningResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleApplyFilters = async (criteria: ScreeningCriteria) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const stocks = await screenStocks(criteria);
      setResults(stocks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Stock Screener</h1>
          <p className="text-gray-600">
            Discover stocks that meet your investment criteria using fundamental financial metrics.
          </p>
        </div>

        <ScreenerFilters onApplyFilters={handleApplyFilters} isLoading={isLoading} />
        
        {hasSearched && (
          <ScreenerResults results={results} isLoading={isLoading} error={error} />
        )}
      </div>
    </div>
  );
}
