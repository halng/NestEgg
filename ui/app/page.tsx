'use client';

import { mockStocks } from './data/mockStocks';
import { useStockScreening } from './hooks/useStockScreening';
import { StockList } from './components/StockList';
import { FilterPanel } from './components/FilterPanel';

export default function Home() {
  const {
    filters,
    filteredStocks,
    updateFilter,
    clearAllFilters,
    filtersActive,
    totalStocks,
    filteredCount,
  } = useStockScreening(mockStocks);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            NestEgg Stock Screener
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Apply financial filters to identify companies matching your investment criteria
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Panel - Sidebar on large screens */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                onClearFilters={clearAllFilters}
                hasActiveFilters={filtersActive}
              />
            </div>
          </div>

          {/* Stock List - Main content area */}
          <div className="lg:col-span-3">
            <StockList stocks={filteredStocks} totalCount={totalStocks} />
          </div>
        </div>
      </div>
    </div>
  );
}
