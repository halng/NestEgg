"use client"

import { TrendingUp, TrendingDown, Target, Calendar } from "lucide-react"
import type { Order } from "@/lib/paper-trading/types"
import { formatCurrency } from "@/lib/paper-trading/formatters"

interface TradeStatisticsProps {
  orders: Order[]
}

export function TradeStatistics({ orders }: TradeStatisticsProps) {
  const filledOrders = orders.filter(o => o.status === 'FILLED')
  const buyOrders = filledOrders.filter(o => o.side === 'BUY')
  const sellOrders = filledOrders.filter(o => o.side === 'SELL')

  const totalBuyValue = buyOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalSellValue = sellOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrderSize = filledOrders.length > 0 
    ? filledOrders.reduce((sum, o) => sum + (o.total || 0), 0) / filledOrders.length 
    : 0

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentOrders = filledOrders.filter(o => new Date(o.createdAt) > thirtyDaysAgo)
  const tradesPerWeek = (recentOrders.length / 4).toFixed(1)

  const tickerCounts = filledOrders.reduce((acc, o) => {
    acc[o.ticker] = (acc[o.ticker] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topTickers = Object.entries(tickerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Trade Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Total Bought"
          value={formatCurrency(totalBuyValue)}
          subValue={`${buyOrders.length} orders`}
          color="text-success"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Sold"
          value={formatCurrency(totalSellValue)}
          subValue={`${sellOrders.length} orders`}
          color="text-danger"
        />
        <StatCard
          icon={Target}
          label="Avg Order Size"
          value={formatCurrency(avgOrderSize)}
          subValue={`${filledOrders.length} total trades`}
        />
        <StatCard
          icon={Calendar}
          label="Trading Frequency"
          value={`${tradesPerWeek}/week`}
          subValue="Last 30 days"
        />
      </div>

      {topTickers.length > 0 && (
        <div className="rounded-xl border border-border bg-background/60 p-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Most Traded Stocks</h4>
          <div className="flex gap-3">
            {topTickers.map(([ticker, count], index) => (
              <div 
                key={ticker}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  index === 0 ? 'bg-primary/10' : 'bg-muted'
                }`}
              >
                <span className={`font-bold ${index === 0 ? 'text-primary' : ''}`}>{ticker}</span>
                <span className="text-sm text-muted-foreground">{count} trades</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  color = "text-foreground" 
}: { 
  icon: typeof TrendingUp
  label: string
  value: string
  subValue: string
  color?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subValue}</p>
    </div>
  )
}
