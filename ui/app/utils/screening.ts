import { Stock, ScreeningFilters } from '../types/stock';

/**
 * Apply screening filters to a list of stocks
 * All filters are optional and composable - only active filters are applied
 * 
 * @param stocks - The complete list of stocks to filter
 * @param filters - The screening criteria to apply
 * @returns Filtered list of stocks matching all active criteria
 */
export function applyScreeningFilters(
  stocks: Stock[],
  filters: ScreeningFilters
): Stock[] {
  return stocks.filter((stock) => {
    // Market Cap Range Filter
    if (filters.marketCapRange) {
      const { min, max } = filters.marketCapRange;
      if (min !== undefined && stock.marketCap < min) return false;
      if (max !== undefined && stock.marketCap > max) return false;
    }

    // P/E Ratio Range Filter
    if (filters.peRatioRange) {
      const { min, max } = filters.peRatioRange;
      // Skip stocks with null P/E ratio if filter is active
      if (stock.peRatio === null) return false;
      if (min !== undefined && stock.peRatio < min) return false;
      if (max !== undefined && stock.peRatio > max) return false;
    }

    // ROE Minimum Filter
    if (filters.roeMinimum !== undefined) {
      // Skip stocks with null ROE if filter is active
      if (stock.roe === null) return false;
      if (stock.roe < filters.roeMinimum) return false;
    }

    // Debt-to-Equity Maximum Filter
    if (filters.debtToEquityMaximum !== undefined) {
      // Skip stocks with null debt-to-equity if filter is active
      if (stock.debtToEquity === null) return false;
      if (stock.debtToEquity > filters.debtToEquityMaximum) return false;
    }

    // Revenue Growth Minimum Filter
    if (filters.revenueGrowthMinimum !== undefined) {
      // Skip stocks with null revenue growth if filter is active
      if (stock.revenueGrowth === null) return false;
      if (stock.revenueGrowth < filters.revenueGrowthMinimum) return false;
    }

    // Stock passed all active filters
    return true;
  });
}

/**
 * Check if any filters are currently active
 * 
 * @param filters - The screening filters object
 * @returns true if at least one filter is active
 */
export function hasActiveFilters(filters: ScreeningFilters): boolean {
  return !!(
    filters.marketCapRange?.min !== undefined ||
    filters.marketCapRange?.max !== undefined ||
    filters.peRatioRange?.min !== undefined ||
    filters.peRatioRange?.max !== undefined ||
    filters.roeMinimum !== undefined ||
    filters.debtToEquityMaximum !== undefined ||
    filters.revenueGrowthMinimum !== undefined
  );
}

/**
 * Get an empty filters object
 * 
 * @returns Empty screening filters
 */
export function getEmptyFilters(): ScreeningFilters {
  return {};
}
