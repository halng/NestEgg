"use client"
import * as React from "react"
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface DataPoint {
  date: string
  price: number
  volume: number
}

interface StockChartProps {
  data: DataPoint[]
  ticker: string
}


type TooltipPayload = { value: number }
type ChartTooltipProps = { active?: boolean; payload?: TooltipPayload[]; label?: string }

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 text-xs shadow-md">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-primary text-[11px]">Price: {payload[0].value.toLocaleString()}</p>
        {payload[1] && (
           <p className="text-muted-foreground text-[11px]">Vol: {payload[1].value.toLocaleString()}</p>
        )}
      </div>
    )
  }
  return null
}

export function StockChart({ data, ticker }: StockChartProps) {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{ticker} - Price & Volume</h3>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: '#a1a1aa' }} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={20}
            />
            {/* Left Y-axis for Price */}
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 10, fill: '#a1a1aa' }} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(val) => val.toLocaleString()}
            />
            {/* Right Y-axis for Volume (hidden but needed for scale) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={false} 
              axisLine={false} 
              domain={[0, 'dataMax * 3']} // scale down volume visually
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#27272a', strokeWidth: 1 }} />
            
            <Bar yAxisId="right" dataKey="volume" fill="#27272a" radius={[2, 2, 0, 0]} maxBarSize={20} />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4, fill: "#10b981", stroke: "#0a0a0c" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
