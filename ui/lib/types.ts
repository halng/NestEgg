export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  isSuccess: boolean;
  timestamp: string;
}

export interface ScreeningCriteria {
  industry?: string;
  exchange?: string;
  minRating?: number;
  maxRating?: number;
  minDeltaInYear?: number;
  maxDeltaInYear?: number;
  minPriceToEarning?: number;
  maxPriceToEarning?: number;
  minPriceToBook?: number;
  maxPriceToBook?: number;
  minRoe?: number;
  maxRoe?: number;
  minRoa?: number;
  maxRoa?: number;
  minDividend?: number;
  maxDividend?: number;
}

export interface StockScreeningResult {
  symbol: string;
  name: string;
  industry: string | null;
  exchange: string | null;
  rating: number | null;
  deltaInYear: number | null;
  priceToEarning: number | null;
  priceToBook: number | null;
  roe: number | null;
  roa: number | null;
  dividend: number | null;
}
