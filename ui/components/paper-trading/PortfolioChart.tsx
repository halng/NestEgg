"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import { PortfolioSnapshot } from "@/lib/paper-trading/types"
import { formatCurrency, formatDate } from "@/lib/paper-trading/formatters"
import { STARTING_CAPITAL } from "@/lib/paper-trading/constants"

interface PortfolioChartProps {
  data: Record<string, PortfolioSnapshot[]>
  startingCapital?: number
}

type TimePeriod = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL"

const periodLabels: Record<TimePeriod, string> = {
  "1D": "1 Day",
  "1W": "1 Week",
  "1M": "1 Month",
  "3M": "3 Months",
  "6M": "6 Months",
  "1Y": "1 Year",
  "ALL": "All Time",
}

interface TooltipPayload {
  payload: PortfolioSnapshot
}

function ChartTooltip({ active, payload, startingCapital }: { active?: boolean; payload?: TooltipPayload[]; startingCapital: number }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const pnl = data.portfolioValue - startingCapital
  const pnlPercent = (pnl / startingCapital) * 100

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-2">{formatDate(data.date)}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-xs text-muted-foreground">Portfolio Value</span>
          <span className="text-sm font-semibold">{formatCurrency(data.portfolioValue)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-muted-foreground">P&L</span>
          <span className={`text-sm font-semibold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-border">
          <span className="text-xs text-muted-foreground">Cash</span>
          <span className="text-xs">{formatCurrency(data.cashBalance)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-muted-foreground">Holdings</span>
          <span className="text-xs">{formatCurrency(data.holdingsValue)}</span>
        </div>
      </div>
    </div>
  )
}

export function PortfolioChart({ data, startingCapital = STARTING_CAPITAL }: PortfolioChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("1M")

  const chartData = useMemo(() => data[period] || [], [data, period])

  const lastValue = chartData[chartData.length - 1]?.portfolioValue || startingCapital
  const isProfit = lastValue >= startingCapital

  const { minValue, maxValue } = useMemo(() => {
    if (chartData.length === 0) return { minValue: startingCapital * 0.9, maxValue: startingCapital * 1.1 }
    const values = chartData.map(d => d.portfolioValue)
    const min = Math.min(...values, startingCapital)
    const max = Math.max(...values, startingCapital)
    const padding = (max - min) * 0.1
    return { minValue: min - padding, maxValue: max + padding }
  }, [chartData, startingCapital])

  return (
    <div className="w-full h-full min-h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Portfolio Performance</h3>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                period === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isProfit ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isProfit ? "#10b981" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
              tickFormatter={(value) => {
                const date = new Date(value)
                return period === "1D" 
                  ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  : date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
              }}
            />
            
            <YAxis
              tick={{ fontSize: 10, fill: '#a1a1aa' }}
              tickLine={false}
              axisLine={false}
              domain={[minValue, maxValue]}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              width={45}
            />
            
            <Tooltip content={<ChartTooltip startingCapital={startingCapital} />} />
            
            <ReferenceLine
              y={startingCapital}
              stroke="#6b7280"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke={isProfit ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={false}
              activeDot={{ r: 4, fill: isProfit ? "#10b981" : "#ef4444", stroke: "#0a0a0c" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-0.5 ${isProfit ? 'bg-success' : 'bg-danger'}`} />
          <span>Portfolio Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-muted-foreground border-dashed" style={{ borderTop: '1px dashed' }} />
          <span>Starting Capital ({formatCurrency(startingCapital)})</span>
        </div>
      </div>
    </div>
  )
}
