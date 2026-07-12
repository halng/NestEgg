"use client"

import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { PortfolioChart } from "@/components/paper-trading/PortfolioChart"
import { SectorAllocationChart } from "@/components/paper-trading/SectorAllocationChart"
import { PerformanceMetrics } from "@/components/paper-trading/PerformanceMetrics"
import { PositionSizeCalculator } from "@/components/paper-trading/PositionSizeCalculator"
import { TradeStatistics } from "@/components/paper-trading/TradeStatistics"
import { mockPortfolioHistory, mockPerformanceMetrics } from "@/lib/paper-trading/mock-analytics"
import { mockHoldings, mockSession } from "@/lib/paper-trading/mock-data"
import { mockOrderHistory } from "@/lib/paper-trading/mock-orders"

export default function AnalyticsPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view analytics" fallbackDescription="Portfolio analytics require authentication.">
      <AnalyticsContent />
    </RequireAuth>
  )
}

function AnalyticsContent() {
  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/paper-trading">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Portfolio Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed performance metrics and analysis
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-card/70 p-4 md:p-6">
          <PerformanceMetrics metrics={mockPerformanceMetrics} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <PortfolioChart 
              data={mockPortfolioHistory} 
              startingCapital={mockSession.startingCapital}
            />
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <SectorAllocationChart holdings={mockHoldings} />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card/70 p-4 md:p-6">
          <TradeStatistics orders={mockOrderHistory} />
        </section>

        <section className="rounded-3xl border border-border bg-card/70 p-4">
          <PositionSizeCalculator 
            portfolioValue={mockSession.totalPortfolioValue}
            cashBalance={mockSession.cashBalance}
          />
        </section>

        <section className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <h3 className="font-semibold text-primary mb-2">Performance Insights</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Your win rate of {mockPerformanceMetrics.winRate.toFixed(1)}% is {mockPerformanceMetrics.winRate >= 50 ? 'above' : 'below'} the break-even threshold</li>
            <li>• Profit factor of {mockPerformanceMetrics.profitFactor.toFixed(2)} means you make {mockPerformanceMetrics.profitFactor.toFixed(2)}x more on winners than you lose on losers</li>
            <li>• Max drawdown of {Math.abs(mockPerformanceMetrics.maxDrawdown).toFixed(1)}% indicates {Math.abs(mockPerformanceMetrics.maxDrawdown) < 10 ? 'conservative' : 'moderate'} risk exposure</li>
            <li>• Sharpe ratio of {mockPerformanceMetrics.sharpeRatio.toFixed(2)} suggests {mockPerformanceMetrics.sharpeRatio >= 1 ? 'good' : 'room for improvement in'} risk-adjusted returns</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
