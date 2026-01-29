/**
 * Stock data type definitions for the screening feature
 */

export interface Stock {
  symbol: string;
  name: string;
  marketCap: number; // in billions USD
  peRatio: number | null; // Price-to-Earnings ratio
  roe: number | null; // Return on Equity (percentage)
  debtToEquity: number | null; // Debt-to-Equity ratio
  revenueGrowth: number | null; // Year-over-Year revenue growth (percentage)
  sector: string;
  price: number; // Current stock price
}

export interface ScreeningFilters {
  marketCapRange?: {
    min?: number;
    max?: number;
  };
  peRatioRange?: {
    min?: number;
    max?: number;
  };
  roeMinimum?: number;
  debtToEquityMaximum?: number;
  revenueGrowthMinimum?: number;
}
