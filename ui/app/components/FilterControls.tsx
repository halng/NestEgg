'use client';

import { useState } from 'react';
import { FilterCriteria } from '../types/screener';

interface FilterControlsProps {
  onApplyFilters: (filters: FilterCriteria[]) => void;
  isLoading: boolean;
}

const AVAILABLE_METRICS = [
  { value: 'priceToEarning', label: 'P/E Ratio' },
  { value: 'priceToBook', label: 'P/B Ratio' },
  { value: 'roe', label: 'ROE (%)' },
  { value: 'dividend', label: 'Dividend Yield (%)' },
  { value: 'capitalize', label: 'Market Cap' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'netProfit', label: 'Net Profit' },
  { value: 'earningPerShare', label: 'EPS' },
];

const OPERATORS = [
  { value: 'GT', label: '>' },
  { value: 'GTE', label: '>=' },
  { value: 'LT', label: '<' },
  { value: 'LTE', label: '<=' },
  { value: 'EQ', label: '=' },
  { value: 'BETWEEN', label: 'Between' },
];

export default function FilterControls({ onApplyFilters, isLoading }: FilterControlsProps) {
  const [filters, setFilters] = useState<FilterCriteria[]>([
    { metricName: 'priceToEarning', operator: 'LT', minValue: 20 },
  ]);

  const addFilter = () => {
    setFilters([
      ...filters,
      { metricName: 'priceToEarning', operator: 'GT', minValue: 0 },
    ]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof FilterCriteria, value: string | number) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    
    // Clear maxValue when operator changes from BETWEEN to something else
    if (field === 'operator' && value !== 'BETWEEN') {
      newFilters[index].maxValue = undefined;
    }
    
    setFilters(newFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        Stock Filters
      </h2>

      <div className="space-y-4">
        {filters.map((filter, index) => (
          <div
            key={index}
            className="flex flex-wrap items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
          >
            <select
              value={filter.metricName}
              onChange={(e) => updateFilter(index, 'metricName', e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
            >
              {AVAILABLE_METRICS.map((metric) => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>

            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50"
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={filter.minValue ?? ''}
              onChange={(e) => updateFilter(index, 'minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Value"
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 w-32"
            />

            {filter.operator === 'BETWEEN' && (
              <>
                <span className="text-zinc-600 dark:text-zinc-400">and</span>
                <input
                  type="number"
                  value={filter.maxValue ?? ''}
                  onChange={(e) => updateFilter(index, 'maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Max Value"
                  className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 w-32"
                />
              </>
            )}

            <button
              onClick={() => removeFilter(index)}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={addFilter}
          className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded transition-colors"
        >
          Add Filter
        </button>
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors"
        >
          {isLoading ? 'Screening...' : 'Apply Filters'}
        </button>
      </div>
    </div>
  );
}
