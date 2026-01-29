'use client';

import { ScreeningFilters } from '../types/stock';

interface FilterPanelProps {
  filters: ScreeningFilters;
  onFilterChange: (key: keyof ScreeningFilters, value: ScreeningFilters[keyof ScreeningFilters]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Component for filtering stocks by various financial criteria
 */
export function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  const handleMarketCapMinChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('marketCapRange', {
      ...filters.marketCapRange,
      min: numValue,
    });
  };

  const handleMarketCapMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('marketCapRange', {
      ...filters.marketCapRange,
      max: numValue,
    });
  };

  const handlePERatioMinChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('peRatioRange', {
      ...filters.peRatioRange,
      min: numValue,
    });
  };

  const handlePERatioMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('peRatioRange', {
      ...filters.peRatioRange,
      max: numValue,
    });
  };

  const handleROEMinChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('roeMinimum', numValue);
  };

  const handleDebtToEquityMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('debtToEquityMaximum', numValue);
  };

  const handleRevenueGrowthMinChange = (value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    onFilterChange('revenueGrowthMinimum', numValue);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Screening Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Market Cap Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Market Capitalization (Billions USD)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="marketCapMin" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Minimum
              </label>
              <input
                id="marketCapMin"
                type="number"
                placeholder="Min"
                value={filters.marketCapRange?.min ?? ''}
                onChange={(e) => handleMarketCapMinChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="marketCapMax" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Maximum
              </label>
              <input
                id="marketCapMax"
                type="number"
                placeholder="Max"
                value={filters.marketCapRange?.max ?? ''}
                onChange={(e) => handleMarketCapMaxChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* P/E Ratio Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Price-to-Earnings (P/E) Ratio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="peRatioMin" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Minimum
              </label>
              <input
                id="peRatioMin"
                type="number"
                placeholder="Min"
                value={filters.peRatioRange?.min ?? ''}
                onChange={(e) => handlePERatioMinChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="peRatioMax" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                Maximum
              </label>
              <input
                id="peRatioMax"
                type="number"
                placeholder="Max"
                value={filters.peRatioRange?.max ?? ''}
                onChange={(e) => handlePERatioMaxChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* ROE Minimum */}
        <div className="space-y-2">
          <label htmlFor="roeMin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Return on Equity (ROE) Minimum (%)
          </label>
          <input
            id="roeMin"
            type="number"
            placeholder="e.g., 15"
            value={filters.roeMinimum ?? ''}
            onChange={(e) => handleROEMinChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Debt-to-Equity Maximum */}
        <div className="space-y-2">
          <label htmlFor="debtToEquityMax" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Debt-to-Equity Maximum
          </label>
          <input
            id="debtToEquityMax"
            type="number"
            placeholder="e.g., 1.5"
            value={filters.debtToEquityMaximum ?? ''}
            onChange={(e) => handleDebtToEquityMaxChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Revenue Growth Minimum */}
        <div className="space-y-2">
          <label htmlFor="revenueGrowthMin" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Revenue Growth (YoY) Minimum (%)
          </label>
          <input
            id="revenueGrowthMin"
            type="number"
            placeholder="e.g., 10"
            value={filters.revenueGrowthMinimum ?? ''}
            onChange={(e) => handleRevenueGrowthMinChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
