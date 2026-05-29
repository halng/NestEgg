"use client"
import * as React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { mockChartDataMap } from "@/lib/mock-data"

interface CompareChartProps {
  tickers: string[]
}

type CompareDatum = { date: string } & Record<string, string | number>
type TooltipEntry = { color?: string; name?: string; value: number }
type CompareTooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string }

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"]

function CompareTooltip({ active, payload, label }: CompareTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="min-w-[150px] rounded-lg border border-border bg-card p-3 shadow-xl">
        <p className="mb-2 border-b border-border pb-2 font-semibold text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="my-1 flex items-center justify-between text-xs font-mono">
            <span style={{ color: entry.color }} className="mr-4 font-bold">{entry.name}</span>
            <span className="text-muted-foreground">{entry.value.toLocaleString()} ₫</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function CompareChart({ tickers }: CompareChartProps) {
  const chartData = React.useMemo<CompareDatum[]>(() => {
    if (tickers.length === 0) return []

    const baseTicker = tickers[0]
    const baseData = mockChartDataMap[baseTicker]
    if (!baseData) return []

    return baseData.map((dataObj, index) => {
      const merged: CompareDatum = { date: dataObj.date }
      tickers.forEach((ticker) => {
        if (mockChartDataMap[ticker]?.[index]) {
          merged[ticker] = mockChartDataMap[ticker][index].price
        }
      })
      return merged
    })
  }, [tickers])

  if (tickers.length === 0) return <div className="p-4 text-center text-muted-foreground">No tickers selected for comparison.</div>

  return (
    <div className="relative flex h-full min-h-[450px] w-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">Performance Comparison</h3>
          <p className="mt-1 text-xs text-muted-foreground">Overlaying absolute prices for {tickers.join(", ")} over 30 days.</p>
        </div>
      </div>

      <div className="relative w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(val) => (val / 1000).toFixed(0) + "k"} />
            <Tooltip content={<CompareTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />

            {tickers.map((ticker, i) => (
              <Line key={ticker} type="monotone" dataKey={ticker} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
