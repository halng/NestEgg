import {
  ScreenRequest,
  StockScreenResult,
  StockMetricsDetail,
  ApiResponse,
} from '../types/screener';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Fetch the list of all available stocks with optional sorting
 */
export async function getStockList(
  sortBy: string = 'symbol',
  sortOrder: string = 'asc'
): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/stocks?sortBy=${sortBy}&sortOrder=${sortOrder}`);

  if (!response.ok) {
    throw new Error('Failed to fetch stock list');
  }

  const data: ApiResponse<any[]> = await response.json();
  return data.data;
}

/**
 * Screen stocks with explainability based on filter criteria
 */
export async function screenStocks(
  request: ScreenRequest
): Promise<StockScreenResult[]> {
  const response = await fetch(`${API_BASE_URL}/stocks/screen/explainable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to screen stocks');
  }

  const data: ApiResponse<StockScreenResult[]> = await response.json();
  return data.data;
}

/**
 * Get detailed metrics for a specific stock
 */
export async function getStockMetrics(
  ticker: string
): Promise<StockMetricsDetail> {
  const response = await fetch(`${API_BASE_URL}/stocks/${ticker}/metrics`);

  if (!response.ok) {
    throw new Error(`Failed to get metrics for ${ticker}`);
  }

  const data: ApiResponse<StockMetricsDetail> = await response.json();
  return data.data;
}
