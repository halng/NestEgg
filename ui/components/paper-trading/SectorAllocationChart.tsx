"use client"

import { useMemo } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { SectorAllocation, PaperTradingHolding } from "@/lib/paper-trading/types"
import { formatCurrency } from "@/lib/paper-trading/formatters"
import { calculateSectorAllocation } from "@/lib/paper-trading/mock-analytics"
import { PieChartIcon } from "lucide-react"

interface SectorAllocationChartProps {
  holdings: PaperTradingHolding[]
}

interface TooltipPayload {
  payload: SectorAllocation
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-semibold">{data.sector}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Value</span>
          <span className="font-mono">{formatCurrency(data.value)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Allocation</span>
          <span className="font-mono">{data.percent.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

interface LegendPayload {
  value: string
  color: string
  payload: { percent: number }
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.value}</span>
          <span className="font-mono text-xs">({entry.payload.percent.toFixed(1)}%)</span>
        </div>
      ))}
    </div>
  )
}

export function SectorAllocationChart({ holdings }: SectorAllocationChartProps) {
  const sectorData = useMemo(() => {
    return calculateSectorAllocation(holdings)
  }, [holdings])

  const totalValue = useMemo(() => {
    return sectorData.reduce((sum, s) => sum + s.value, 0)
  }, [sectorData])

  if (holdings.length === 0 || totalValue === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
        <PieChartIcon className="h-16 w-16 text-muted-foreground/30" />
        <p className="mt-4 text-muted-foreground">No holdings to display</p>
        <p className="text-sm text-muted-foreground/70">
          Buy some stocks to see your sector allocation
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Sector Allocation</h3>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              nameKey="sector"
              strokeWidth={0}
            >
              {sectorData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center -mt-8 mb-4">
        <p className="text-xs text-muted-foreground">Total Holdings</p>
        <p className="text-lg font-bold font-mono">{formatCurrency(totalValue)}</p>
      </div>
    </div>
  )
}
