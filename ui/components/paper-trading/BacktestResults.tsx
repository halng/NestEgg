"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Percent,
  Activity,
} from "lucide-react"
import { formatCurrency, formatPercent, formatDate } from "@/lib/paper-trading/formatters"
import type { BacktestResult, BacktestTrade, EquityPoint } from "@/lib/paper-trading/backtest"

interface BacktestResultsProps {
  result: BacktestResult
  onReset?: () => void
}

export function BacktestResults({ result, onReset }: BacktestResultsProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "trades" | "chart">("summary")

  const isPositiveReturn = result.totalReturnPercent >= 0
  const beatsBuyHold = result.totalReturnPercent > result.buyAndHoldReturnPercent

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{result.strategyName}</h2>
            <p className="text-sm text-muted-foreground">
              {result.ticker} · {result.period.start} to {result.period.end}
            </p>
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="text-sm text-primary hover:underline"
            >
              Run Another
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        <MetricCard
          label="Total Return"
          value={formatPercent(result.totalReturnPercent)}
          subValue={formatCurrency(result.totalReturn)}
          isPositive={result.totalReturn >= 0}
          icon={isPositiveReturn ? TrendingUp : TrendingDown}
        />
        <MetricCard
          label="Final Value"
          value={formatCurrency(result.finalValue)}
          subValue={`Started: ${formatCurrency(result.initialCapital)}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Win Rate"
          value={`${result.winRate.toFixed(1)}%`}
          subValue={`${result.winningTrades}W / ${result.losingTrades}L`}
          isPositive={result.winRate >= 50}
          icon={Target}
        />
        <MetricCard
          label="Sharpe Ratio"
          value={result.sharpeRatio.toFixed(2)}
          subValue={result.sharpeRatio >= 1 ? "Good risk-adjusted returns" : "Below average"}
          isPositive={result.sharpeRatio >= 1}
          icon={Activity}
        />
      </div>

      {/* Comparison Banner */}
      <div className={`px-6 py-3 flex items-center gap-3 ${
        beatsBuyHold ? "bg-success/10" : "bg-warning/10"
      }`}>
        {beatsBuyHold ? (
          <Award className="h-5 w-5 text-success" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-warning" />
        )}
        <div className="text-sm">
          <span className="font-medium">
            {beatsBuyHold ? "Outperformed" : "Underperformed"} buy-and-hold
          </span>
          <span className="text-muted-foreground ml-1">
            by {formatPercent(Math.abs(result.totalReturnPercent - result.buyAndHoldReturnPercent))}
          </span>
          <span className="text-muted-foreground ml-2">
            (Buy & Hold: {formatPercent(result.buyAndHoldReturnPercent)})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "summary", label: "Summary" },
          { id: "trades", label: `Trades (${result.totalTrades})` },
          { id: "chart", label: "Equity Curve" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {/* Performance Stats */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Performance Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatRow
                  label="Total Trades"
                  value={result.totalTrades.toString()}
                />
                <StatRow
                  label="Winning Trades"
                  value={result.winningTrades.toString()}
                  valueClass="text-success"
                />
                <StatRow
                  label="Losing Trades"
                  value={result.losingTrades.toString()}
                  valueClass="text-danger"
                />
                <StatRow
                  label="Win Rate"
                  value={`${result.winRate.toFixed(1)}%`}
                  valueClass={result.winRate >= 50 ? "text-success" : "text-danger"}
                />
              </div>
            </div>

            {/* Risk Metrics */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Risk Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <StatRow
                  label="Max Drawdown"
                  value={formatCurrency(result.maxDrawdown)}
                  valueClass="text-danger"
                />
                <StatRow
                  label="Max Drawdown %"
                  value={`-${result.maxDrawdownPercent.toFixed(2)}%`}
                  valueClass="text-danger"
                />
                <StatRow
                  label="Sharpe Ratio"
                  value={result.sharpeRatio.toFixed(2)}
                  valueClass={result.sharpeRatio >= 1 ? "text-success" : "text-warning"}
                />
              </div>
            </div>

            {/* Comparison */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Strategy vs Buy & Hold</h3>
              <div className="rounded-xl bg-background/60 border border-border p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Your Strategy</p>
                    <p className={`text-xl font-bold ${
                      result.totalReturnPercent >= 0 ? "text-success" : "text-danger"
                    }`}>
                      {formatPercent(result.totalReturnPercent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(result.finalValue)}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground px-4">vs</div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Buy & Hold</p>
                    <p className={`text-xl font-bold ${
                      result.buyAndHoldReturnPercent >= 0 ? "text-success" : "text-danger"
                    }`}>
                      {formatPercent(result.buyAndHoldReturnPercent)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(result.initialCapital + result.buyAndHoldReturn)}
                    </p>
                  </div>
                </div>

                <div className={`text-center py-2 rounded-lg ${
                  beatsBuyHold ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}>
                  {beatsBuyHold ? (
                    <span className="flex items-center justify-center gap-1 text-sm font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      Strategy wins by {formatPercent(result.totalReturnPercent - result.buyAndHoldReturnPercent)}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1 text-sm font-medium">
                      <ArrowDownRight className="h-4 w-4" />
                      Buy & Hold wins by {formatPercent(result.buyAndHoldReturnPercent - result.totalReturnPercent)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === "trades" && (
          <div>
            {result.trades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No trades were executed during this backtest period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Entry</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Exit</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Shares</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Entry Price</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Exit Price</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((trade, i) => (
                      <TradeRow key={i} trade={trade} index={i + 1} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Chart Tab */}
        {activeTab === "chart" && (
          <EquityCurveChart
            equityCurve={result.equityCurve}
            buyAndHoldCurve={result.buyAndHoldCurve}
          />
        )}
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  label: string
  value: string
  subValue?: string
  isPositive?: boolean
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ label, value, subValue, isPositive, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-xl font-bold ${
        isPositive === undefined ? "" : isPositive ? "text-success" : "text-danger"
      }`}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
      )}
    </div>
  )
}

// Stat Row Component
interface StatRowProps {
  label: string
  value: string
  valueClass?: string
}

function StatRow({ label, value, valueClass }: StatRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-mono font-medium ${valueClass || ""}`}>{value}</span>
    </div>
  )
}

// Trade Row Component
interface TradeRowProps {
  trade: BacktestTrade
  index: number
}

function TradeRow({ trade, index }: TradeRowProps) {
  const isWin = (trade.pnl || 0) >= 0

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="py-3 px-2 text-muted-foreground">{index}</td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDate(trade.entryDate)}
        </div>
      </td>
      <td className="py-3 px-2">
        {trade.exitDate ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(trade.exitDate)}
          </div>
        ) : (
          <span className="text-warning">Open</span>
        )}
      </td>
      <td className="py-3 px-2 text-right font-mono">{trade.shares}</td>
      <td className="py-3 px-2 text-right font-mono">{formatCurrency(trade.entryPrice)}</td>
      <td className="py-3 px-2 text-right font-mono">
        {trade.exitPrice ? formatCurrency(trade.exitPrice) : "—"}
      </td>
      <td className={`py-3 px-2 text-right font-mono font-medium ${
        isWin ? "text-success" : "text-danger"
      }`}>
        {trade.pnl !== undefined ? (
          <div>
            <div>{formatCurrency(trade.pnl)}</div>
            <div className="text-xs">
              ({formatPercent(trade.pnlPercent || 0)})
            </div>
          </div>
        ) : "—"}
      </td>
    </tr>
  )
}

// Simple Equity Curve Chart (using CSS/HTML)
interface EquityCurveChartProps {
  equityCurve: EquityPoint[]
  buyAndHoldCurve: EquityPoint[]
}

function EquityCurveChart({ equityCurve, buyAndHoldCurve }: EquityCurveChartProps) {
  if (equityCurve.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available for chart.
      </div>
    )
  }

  // Get min/max for scaling
  const allValues = [...equityCurve.map(p => p.value), ...buyAndHoldCurve.map(p => p.value)]
  const minValue = Math.min(...allValues)
  const maxValue = Math.max(...allValues)
  const range = maxValue - minValue || 1

  // Sample points for display (max 50 points)
  const sampleRate = Math.ceil(equityCurve.length / 50)
  const sampledEquity = equityCurve.filter((_, i) => i % sampleRate === 0 || i === equityCurve.length - 1)
  const sampledBuyHold = buyAndHoldCurve.filter((_, i) => i % sampleRate === 0 || i === buyAndHoldCurve.length - 1)

  const getY = (value: number) => 100 - ((value - minValue) / range) * 80 - 10

  // Generate SVG path
  const createPath = (points: EquityPoint[]) => {
    if (points.length === 0) return ""
    const step = 100 / (points.length - 1)
    return points
      .map((point, i) => {
        const x = i * step
        const y = getY(point.value)
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  const equityPath = createPath(sampledEquity)
  const buyHoldPath = createPath(sampledBuyHold)

  // Key data points
  const firstPoint = equityCurve[0]
  const lastPoint = equityCurve[equityCurve.length - 1]
  const firstBH = buyAndHoldCurve[0]
  const lastBH = buyAndHoldCurve[buyAndHoldCurve.length - 1]

  return (
    <div className="space-y-4">
      {/* Chart Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-primary" />
          <span className="text-sm">Your Strategy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-muted-foreground" />
          <span className="text-sm">Buy & Hold</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-64 rounded-xl bg-background/60 border border-border p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />
          ))}

          {/* Buy & Hold line */}
          <path
            d={buyHoldPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Strategy line */}
          <path
            d={equityPath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* End point markers */}
          <circle
            cx="100"
            cy={getY(lastPoint.value)}
            r="2"
            fill="hsl(var(--primary))"
          />
          <circle
            cx="100"
            cy={getY(lastBH.value)}
            r="2"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-2">
          <span>{formatCurrency(maxValue)}</span>
          <span>{formatCurrency(minValue)}</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-muted-foreground px-4">
          <span>{firstPoint.date}</span>
          <span>{lastPoint.date}</span>
        </div>
      </div>

      {/* Summary stats below chart */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-background/60 border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-4 rounded bg-primary" />
            <span className="text-muted-foreground">Strategy</span>
          </div>
          <div className="flex justify-between">
            <span>Start</span>
            <span className="font-mono">{formatCurrency(firstPoint.value)}</span>
          </div>
          <div className="flex justify-between">
            <span>End</span>
            <span className={`font-mono font-medium ${
              lastPoint.value >= firstPoint.value ? "text-success" : "text-danger"
            }`}>
              {formatCurrency(lastPoint.value)}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-background/60 border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-4 rounded bg-muted-foreground" />
            <span className="text-muted-foreground">Buy & Hold</span>
          </div>
          <div className="flex justify-between">
            <span>Start</span>
            <span className="font-mono">{formatCurrency(firstBH.value)}</span>
          </div>
          <div className="flex justify-between">
            <span>End</span>
            <span className={`font-mono font-medium ${
              lastBH.value >= firstBH.value ? "text-success" : "text-danger"
            }`}>
              {formatCurrency(lastBH.value)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
