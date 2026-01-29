'use client';

import { useState, useMemo } from 'react';
import { Stock, ScreeningFilters } from '../types/stock';
import { applyScreeningFilters, hasActiveFilters, getEmptyFilters } from '../utils/screening';

/**
 * Custom hook for managing stock screening state and filtering
 * 
 * @param stocks - The complete universe of stocks to filter
 * @returns Object containing filtered stocks, filters, and filter update functions
 */
export function useStockScreening(stocks: Stock[]) {
  const [filters, setFilters] = useState<ScreeningFilters>(getEmptyFilters());

  // Apply filters to get filtered stock list
  // Uses useMemo for performance - only recalculates when stocks or filters change
  const filteredStocks = useMemo(
    () => applyScreeningFilters(stocks, filters),
    [stocks, filters]
  );

  // Update individual filter values
  const updateFilter = (key: keyof ScreeningFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters(getEmptyFilters());
  };

  // Check if any filters are active
  const filtersActive = hasActiveFilters(filters);

  return {
    filters,
    filteredStocks,
    updateFilter,
    clearAllFilters,
    filtersActive,
    totalStocks: stocks.length,
    filteredCount: filteredStocks.length,
  };
}
