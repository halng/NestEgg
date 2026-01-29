'use client';

import { useState } from 'react';
import FilterControls from '../components/FilterControls';
import ResultsTable from '../components/ResultsTable';
import MetricsDetailModal from '../components/MetricsDetailModal';
import { FilterCriteria, StockScreenResult } from '../types/screener';
import { screenStocks } from '../lib/api';

export default function ScreenerPage() {
  const [results, setResults] = useState<StockScreenResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleApplyFilters = async (filters: FilterCriteria[]) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await screenStocks({ filters });
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Stock Screener
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Filter stocks by financial metrics and view detailed explanations
          </p>
        </header>

        <div className="space-y-6">
          <FilterControls onApplyFilters={handleApplyFilters} isLoading={isLoading} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </div>
          )}

          {hasSearched && !isLoading && !error && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                Results ({results.length} stocks)
              </h2>
              <ResultsTable results={results} onSelectStock={setSelectedTicker} />
            </div>
          )}

          {!hasSearched && !isLoading && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">
                Set your filters above and click &quot;Apply Filters&quot; to start screening stocks
              </p>
            </div>
          )}
        </div>
      </div>

      <MetricsDetailModal ticker={selectedTicker} onClose={() => setSelectedTicker(null)} />
    </div>
  );
}
