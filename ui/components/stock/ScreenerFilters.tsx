'use client';

import { ScreeningCriteria } from '@/lib/types';
import { useState } from 'react';

interface ScreenerFiltersProps {
  onApplyFilters: (criteria: ScreeningCriteria) => void;
  isLoading: boolean;
}

export default function ScreenerFilters({ onApplyFilters, isLoading }: ScreenerFiltersProps) {
  const [criteria, setCriteria] = useState<ScreeningCriteria>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(criteria);
  };

  const handleReset = () => {
    setCriteria({});
    onApplyFilters({});
  };

  const updateCriteria = (field: keyof ScreeningCriteria, value: string) => {
    setCriteria(prev => ({
      ...prev,
      [field]: value === '' ? undefined : isNaN(Number(value)) ? value : Number(value),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Filter Criteria</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="industry" className="block text-sm font-medium mb-1">
            Industry
          </label>
          <input
            id="industry"
            type="text"
            value={criteria.industry || ''}
            onChange={(e) => updateCriteria('industry', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Technology"
          />
        </div>

        <div>
          <label htmlFor="exchange" className="block text-sm font-medium mb-1">
            Exchange
          </label>
          <input
            id="exchange"
            type="text"
            value={criteria.exchange || ''}
            onChange={(e) => updateCriteria('exchange', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., NASDAQ"
          />
        </div>

        <div>
          <label htmlFor="minRating" className="block text-sm font-medium mb-1">
            Min Rating
          </label>
          <input
            id="minRating"
            type="number"
            step="0.1"
            value={criteria.minRating ?? ''}
            onChange={(e) => updateCriteria('minRating', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 3.5"
          />
        </div>

        <div>
          <label htmlFor="maxRating" className="block text-sm font-medium mb-1">
            Max Rating
          </label>
          <input
            id="maxRating"
            type="number"
            step="0.1"
            value={criteria.maxRating ?? ''}
            onChange={(e) => updateCriteria('maxRating', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 5.0"
          />
        </div>

        <div>
          <label htmlFor="minDeltaInYear" className="block text-sm font-medium mb-1">
            Min YoY Change (%)
          </label>
          <input
            id="minDeltaInYear"
            type="number"
            step="0.01"
            value={criteria.minDeltaInYear ?? ''}
            onChange={(e) => updateCriteria('minDeltaInYear', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 5"
          />
        </div>

        <div>
          <label htmlFor="maxDeltaInYear" className="block text-sm font-medium mb-1">
            Max YoY Change (%)
          </label>
          <input
            id="maxDeltaInYear"
            type="number"
            step="0.01"
            value={criteria.maxDeltaInYear ?? ''}
            onChange={(e) => updateCriteria('maxDeltaInYear', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 50"
          />
        </div>

        <div>
          <label htmlFor="minPriceToEarning" className="block text-sm font-medium mb-1">
            Min P/E Ratio
          </label>
          <input
            id="minPriceToEarning"
            type="number"
            step="0.1"
            value={criteria.minPriceToEarning ?? ''}
            onChange={(e) => updateCriteria('minPriceToEarning', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 10"
          />
        </div>

        <div>
          <label htmlFor="maxPriceToEarning" className="block text-sm font-medium mb-1">
            Max P/E Ratio
          </label>
          <input
            id="maxPriceToEarning"
            type="number"
            step="0.1"
            value={criteria.maxPriceToEarning ?? ''}
            onChange={(e) => updateCriteria('maxPriceToEarning', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 30"
          />
        </div>

        <div>
          <label htmlFor="minRoe" className="block text-sm font-medium mb-1">
            Min ROE (%)
          </label>
          <input
            id="minRoe"
            type="number"
            step="0.1"
            value={criteria.minRoe ?? ''}
            onChange={(e) => updateCriteria('minRoe', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 15"
          />
        </div>

        <div>
          <label htmlFor="maxRoe" className="block text-sm font-medium mb-1">
            Max ROE (%)
          </label>
          <input
            id="maxRoe"
            type="number"
            step="0.1"
            value={criteria.maxRoe ?? ''}
            onChange={(e) => updateCriteria('maxRoe', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 100"
          />
        </div>

        <div>
          <label htmlFor="minDividend" className="block text-sm font-medium mb-1">
            Min Dividend
          </label>
          <input
            id="minDividend"
            type="number"
            step="0.01"
            value={criteria.minDividend ?? ''}
            onChange={(e) => updateCriteria('minDividend', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 1"
          />
        </div>

        <div>
          <label htmlFor="maxDividend" className="block text-sm font-medium mb-1">
            Max Dividend
          </label>
          <input
            id="maxDividend"
            type="number"
            step="0.01"
            value={criteria.maxDividend ?? ''}
            onChange={(e) => updateCriteria('maxDividend', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., 10"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Screening...' : 'Apply Filters'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
