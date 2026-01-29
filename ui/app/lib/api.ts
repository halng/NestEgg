import {
  ScreenRequest,
  StockScreenResult,
  StockMetricsDetail,
  ApiResponse,
} from '../types/screener';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function screenStocks(
  request: ScreenRequest
): Promise<StockScreenResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/stocks/screen`, {
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

export async function getStockMetrics(
  ticker: string
): Promise<StockMetricsDetail> {
  const response = await fetch(`${API_BASE_URL}/api/stocks/${ticker}/metrics`);

  if (!response.ok) {
    throw new Error(`Failed to get metrics for ${ticker}`);
  }

  const data: ApiResponse<StockMetricsDetail> = await response.json();
  return data.data;
}
