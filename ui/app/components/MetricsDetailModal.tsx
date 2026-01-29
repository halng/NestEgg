'use client';

import { useEffect, useState } from 'react';
import { StockMetricsDetail } from '../types/screener';
import { getStockMetrics } from '../lib/api';

interface MetricsDetailModalProps {
  ticker: string | null;
  onClose: () => void;
}

export default function MetricsDetailModal({ ticker, onClose }: MetricsDetailModalProps) {
  const [metrics, setMetrics] = useState<StockMetricsDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    
    let mounted = true;
    
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getStockMetrics(ticker);
        if (mounted) {
          setMetrics(data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    };
    
    fetchMetrics();
    
    return () => {
      mounted = false;
    };
  }, [ticker]);

  if (!ticker) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {loading ? 'Loading...' : metrics?.name || ticker}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-zinc-600 dark:text-zinc-400">Loading metrics...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
          )}

          {metrics && !loading && (
            <div>
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Ticker</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {metrics.ticker}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Exchange</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {metrics.exchange || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Industry</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {metrics.industry || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                All Available Metrics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metrics.allMetrics)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded"
                    >
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </p>
                    </div>
                  ))}
              </div>

              {Object.keys(metrics.allMetrics).length === 0 && (
                <p className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                  No metrics available for this stock.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
