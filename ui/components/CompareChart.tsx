"use client"
import * as React from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { mockChartDataMap } from "@/lib/mock-data"

interface CompareChartProps {
  tickers: string[]
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"]

export function CompareChart({ tickers }: CompareChartProps) {
  // Pivot data so it's shaped like: { date: '...', FPT: 110, VHM: 42 }
  const chartData = React.useMemo(() => {
    if (tickers.length === 0) return []
    
    // Assume all mock charts have 30 days and the same dates since they are generated simultaneously.
    const baseTicker = tickers[0]
    const baseData = mockChartDataMap[baseTicker]
    if (!baseData) return []

    return baseData.map((dataObj, index) => {
       const merged: any = { date: dataObj.date }
       tickers.forEach(t => {
          if (mockChartDataMap[t] && mockChartDataMap[t][index]) {
             merged[t] = mockChartDataMap[t][index].price
          }
       })
       return merged
    })
  }, [tickers])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-xl min-w-[150px]">
          <p className="font-semibold text-foreground mb-2 pb-2 border-b border-border">{label}</p>
          {payload.map((entry: any, index: number) => (
             <div key={index} className="flex justify-between items-center text-xs my-1 font-mono">
               <span style={{ color: entry.color }} className="font-bold mr-4">{entry.name}</span>
               <span className="text-muted-foreground">{entry.value.toLocaleString()} ₫</span>
             </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (tickers.length === 0) return <div className="p-4 text-muted-foreground text-center">No tickers selected for comparison.</div>

  return (
    <div className="w-full h-full min-h-[450px] flex flex-col relative bg-card rounded-xl border border-border p-4 md:p-6 shadow-sm">
      <div className="mb-6 flex justify-between items-end">
         <div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Performance Comparison</h3>
            <p className="text-xs text-muted-foreground mt-1">Overlaying absolute prices for {tickers.join(", ")} over 30 days.</p>
         </div>
      </div>
      
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#a1a1aa' }} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={20}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#a1a1aa' }} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => (val/1000).toFixed(0) + "k"}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
            />
            
            {tickers.map((ticker, i) => (
              <Line 
                key={ticker}
                type="monotone" 
                dataKey={ticker} 
                stroke={COLORS[i % COLORS.length]} 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
