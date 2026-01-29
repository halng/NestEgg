export interface FilterCriteria {
  metricName: string;
  operator: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ' | 'BETWEEN';
  minValue?: number;
  maxValue?: number;
}

export interface StockMetrics {
  metricName: string;
  value: number;
  usedInFilter: boolean;
}

export interface StockScreenResult {
  ticker: string;
  name: string;
  exchange: string;
  industry: string;
  visibleMetrics: StockMetrics[];
}

export interface StockMetricsDetail {
  ticker: string;
  name: string;
  exchange: string;
  industry: string;
  allMetrics: Record<string, number>;
}

export interface ScreenRequest {
  filters: FilterCriteria[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
