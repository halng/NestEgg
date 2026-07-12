"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity, 
  BarChart3, 
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { PerformanceMetrics as PerformanceMetricsType } from "@/lib/paper-trading/types"
import { formatCurrency, formatPercent } from "@/lib/paper-trading/formatters"

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType
}

interface MetricCardProps {
  icon: typeof TrendingUp
  label: string
  value: string
  subValue?: string
  trend?: "up" | "down" | "neutral"
  size?: "normal" | "large"
}

function MetricCard({ icon: Icon, label, value, subValue, trend, size = "normal" }: MetricCardProps) {
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-foreground"
  const isLarge = size === "large"

  return (
    <div className={`rounded-xl border border-border bg-background/60 p-4 ${isLarge ? 'col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`font-bold ${trendColor} ${isLarge ? 'text-2xl' : 'text-xl'}`}>{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  )
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={TrendingUp}
          label="Total Return"
          value={formatCurrency(metrics.totalReturn)}
          subValue={formatPercent(metrics.totalReturnPercent, true)}
          trend={metrics.totalReturn >= 0 ? "up" : "down"}
          size="large"
        />

        <MetricCard
          icon={Target}
          label="Win Rate"
          value={`${metrics.winRate.toFixed(1)}%`}
          subValue={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
          trend={metrics.winRate >= 50 ? "up" : "down"}
        />

        <MetricCard
          icon={TrendingDown}
          label="Max Drawdown"
          value={formatPercent(metrics.maxDrawdown)}
          trend="down"
        />

        <MetricCard
          icon={Activity}
          label="Sharpe Ratio"
          value={metrics.sharpeRatio.toFixed(2)}
          trend={metrics.sharpeRatio >= 1 ? "up" : metrics.sharpeRatio >= 0 ? "neutral" : "down"}
        />

        <MetricCard
          icon={BarChart3}
          label="Profit Factor"
          value={metrics.profitFactor.toFixed(2)}
          trend={metrics.profitFactor >= 1 ? "up" : "down"}
        />

        <MetricCard
          icon={Activity}
          label="Total Trades"
          value={metrics.totalTrades.toString()}
        />

        <MetricCard
          icon={ArrowUp}
          label="Avg Win"
          value={formatCurrency(metrics.avgWinAmount)}
          trend="up"
        />

        <MetricCard
          icon={ArrowDown}
          label="Avg Loss"
          value={formatCurrency(metrics.avgLossAmount)}
          trend="down"
        />
      </div>

      <div className="rounded-xl border border-border bg-background/60 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Return by Period</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Daily</p>
            <p className={`font-bold ${metrics.dailyReturn >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatPercent(metrics.dailyReturn, true)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weekly</p>
            <p className={`font-bold ${metrics.weeklyReturn >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatPercent(metrics.weeklyReturn, true)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly</p>
            <p className={`font-bold ${metrics.monthlyReturn >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatPercent(metrics.monthlyReturn, true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
