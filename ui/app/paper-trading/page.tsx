"use client"

import { RequireAuth } from "@/components/auth/RequireAuth"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/Button"
import { fetchPaperTradingSession, placePaperTradingOrder, resetPaperTradingAccount, type PaperTradingMarketTicker, type PaperTradingSession } from "@/lib/paper-trading-api"
import { 
  TradeTicket, 
  PendingOrdersTable, 
  ModifyOrderDialog,
  PortfolioChart, 
  SectorAllocationChart,
  PerformanceMetrics 
} from "@/components/paper-trading"
import { 
  mockPendingOrders, 
  mockOrderHistory,
  simulatePlaceOrder 
} from "@/lib/paper-trading/mock-orders"
import { mockPortfolioHistory, mockPerformanceMetrics } from "@/lib/paper-trading/mock-analytics"
import { formatCurrency, formatNumber } from "@/lib/paper-trading/formatters"
import type { Order, PlaceOrderRequest } from "@/lib/paper-trading/types"
import { 
  Activity, 
  AlertTriangle, 
  Bot, 
  History, 
  LineChart, 
  RefreshCcw, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Wallet,
  Clock,
  BarChart3,
  ExternalLink,
  X
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState, useCallback } from "react"

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

export default function PaperTradingPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to paper trade" fallbackDescription="Paper trading uses your protected virtual account, holdings, and transaction ledger from the NestEgg backend.">
      <PaperTradingWorkspace />
    </RequireAuth>
  )
}

function PaperTradingWorkspace() {
  const { user } = useAuth()
  const [session, setSession] = useState<PaperTradingSession | null>(null)
  const [selectedTicker, setSelectedTicker] = useState("")
  const [message, setMessage] = useState("Loading your paper trading account...")
  const [isBusy, setIsBusy] = useState(false)
  
  // Order management state - only load mock data when flag is enabled
  const [pendingOrders, setPendingOrders] = useState<Order[]>(USE_MOCK_DATA ? mockPendingOrders : [])
  const [modifyingOrder, setModifyingOrder] = useState<Order | null>(null)
  
  // Mobile trade sheet state
  const [showMobileTradeSheet, setShowMobileTradeSheet] = useState(false)

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    fetchPaperTradingSession(user.id, controller.signal)
      .then((data) => {
        setSession(data)
        setSelectedTicker(data.marketWatch[0]?.ticker ?? "")
        setMessage(data.mentorMessage)
      })
      .catch((error: Error) => setMessage(error.message))
    return () => controller.abort()
  }, [user])

  const refreshSession = useCallback((nextSession: PaperTradingSession) => {
    setSession(nextSession)
    setSelectedTicker((current) => current || nextSession.marketWatch[0]?.ticker || "")
    setMessage(nextSession.mentorMessage)
  }, [])

  const handleOrderSubmit = async (order: PlaceOrderRequest) => {
    if (!user || !session) return
    setIsBusy(true)
    try {
      if (USE_MOCK_DATA) {
        const newOrder = simulatePlaceOrder(order)
        if (newOrder.status === "PENDING") {
          setPendingOrders(prev => [newOrder, ...prev])
          setMessage(`${order.orderType} order placed for ${order.shares} shares of ${order.ticker}. Waiting to be filled.`)
        } else {
          setMessage(`Market order executed: ${order.side} ${order.shares} shares of ${order.ticker}`)
        }
      } else {
        refreshSession(await placePaperTradingOrder(user.id, { 
          ticker: order.ticker, 
          shares: order.shares, 
          side: order.side 
        }))
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed")
    } finally {
      setIsBusy(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId))
    setMessage("Order cancelled successfully")
  }

  const handleModifyOrder = async (orderId: string, updates: { shares?: number; limitPrice?: number; stopPrice?: number }) => {
    setPendingOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o
      return {
        ...o,
        // Map 'shares' from dialog to 'requestedShares' in Order type
        requestedShares: updates.shares ?? o.requestedShares,
        limitPrice: updates.limitPrice ?? o.limitPrice,
        stopPrice: updates.stopPrice ?? o.stopPrice,
        updatedAt: new Date().toISOString(),
      }
    }))
    setMessage("Order modified successfully")
  }

  const resetAccount = async () => {
    if (!user) return
    setIsBusy(true)
    try {
      refreshSession(await resetPaperTradingAccount(user.id))
      setPendingOrders([])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset failed")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Hero Section */}
        <section className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-2xl shadow-black/20 backdrop-blur xl:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Paper Trading Lab
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
                Practice Vietnam market execution with advanced order types.
              </h1>
              <p className="mt-4 max-w-3xl text-muted-foreground md:text-lg">
                Place market, limit, and stop orders. Track performance with detailed analytics. All trades are simulated with no real money at risk.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/paper-trading/orders">
                <Button variant="outline">
                  <History className="h-4 w-4" />
                  Order History
                </Button>
              </Link>
              <Button variant="outline" onClick={resetAccount} disabled={isBusy || !session}>
                <RefreshCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <Metric 
              icon={Wallet} 
              label="Purchasing Power" 
              value={formatCurrency(session?.cashBalance ?? 0)} 
            />
            <Metric 
              icon={LineChart} 
              label="Portfolio Value" 
              value={formatCurrency(session?.totalPortfolioValue ?? 0)} 
            />
            <Metric 
              icon={TrendingUp} 
              label="Overall ROI" 
              value={`${(session?.roiPercent ?? 0) >= 0 ? "+" : ""}${(session?.roiPercent ?? 0).toFixed(2)}%`} 
              tone={(session?.roiPercent ?? 0) >= 0 ? "text-success" : "text-danger"} 
            />
            <Metric 
              icon={Clock} 
              label="Pending Orders" 
              value={pendingOrders.length.toString()} 
            />
          </div>
        </section>

        {/* Main Trading Section */}
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Market Watch */}
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Market Watch</h2>
              <span className="text-xs text-muted-foreground">{session?.marketWatch.length ?? 0} stocks</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(session?.marketWatch ?? []).slice(0, 8).map((stock) => (
                <MarketCard 
                  key={stock.ticker} 
                  stock={stock} 
                  active={stock.ticker === selectedTicker} 
                  onTrade={() => setSelectedTicker(stock.ticker)} 
                />
              ))}
            </div>
          </div>

          {/* Trade Ticket - Desktop */}
          <div className="hidden xl:block">
            {session && (
              <TradeTicket
                marketWatch={session.marketWatch}
                selectedTicker={selectedTicker}
                cashBalance={session.cashBalance}
                holdings={session.holdings}
                onOrderSubmit={handleOrderSubmit}
                onTickerSelect={setSelectedTicker}
                disabled={isBusy}
              />
            )}
          </div>
        </section>

        {/* AI Mentor Panel */}
        <section className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <Bot className="mt-1 h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-bold text-primary">AI Mentor Panel</p>
              <p className="mt-1 text-sm leading-6 text-foreground">{message}</p>
            </div>
          </div>
        </section>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <section className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Pending Orders</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {pendingOrders.length}
                </span>
              </div>
              <Link href="/paper-trading/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <PendingOrdersTable
              orders={pendingOrders}
              onModify={setModifyingOrder}
              onCancel={handleCancelOrder}
              isLoading={isBusy}
            />
          </section>
        )}

        {/* Portfolio Analytics */}
        <section className="grid gap-4 xl:grid-cols-2">
          {/* Portfolio Chart */}
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <PortfolioChart 
              data={mockPortfolioHistory} 
              startingCapital={session?.startingCapital ?? 100_000_000}
            />
          </div>

          {/* Sector Allocation */}
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <SectorAllocationChart holdings={session?.holdings ?? []} />
          </div>
        </section>

        {/* Holdings & Ledger */}
        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          {/* Holdings Table */}
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <h2 className="text-xl font-bold mb-4">Portfolio Holdings</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">Ticker</th>
                    <th className="p-3">Shares</th>
                    <th className="p-3">Avg Cost</th>
                    <th className="p-3">Current</th>
                    <th className="p-3">Market Value</th>
                    <th className="p-3">P/L</th>
                    <th className="p-3">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {(session?.holdings ?? []).map((row) => (
                    <tr key={row.ticker} className="border-t border-border hover:bg-muted/30 transition">
                      <td className="p-3 font-bold">{row.ticker}</td>
                      <td className="p-3 font-mono">{formatNumber(row.shares)}</td>
                      <td className="p-3 font-mono">{formatCurrency(row.averageCost)}</td>
                      <td className="p-3 font-mono">{formatCurrency(row.currentPrice)}</td>
                      <td className="p-3 font-mono">{formatCurrency(row.marketValue)}</td>
                      <td className={`p-3 font-semibold ${row.unrealizedPnl >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(row.unrealizedPnl)}
                      </td>
                      <td className="p-3">{row.sector ?? "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {session?.holdings.length === 0 && (
                <p className="rounded-2xl bg-background/70 p-6 text-center text-muted-foreground">
                  No holdings yet. Start by buying some stocks!
                </p>
              )}
            </div>
          </div>

          {/* Transaction Ledger */}
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Recent Transactions</h2>
              </div>
              <Link href="/paper-trading/orders" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {(session?.ledger ?? []).slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-background/70 p-3 ring-1 ring-border">
                  <div className="flex items-center justify-between">
                    <span className={entry.side === "BUY" ? "font-bold text-success" : "font-bold text-danger"}>
                      {entry.side} {entry.ticker}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.executedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatNumber(entry.shares)} shares @ {formatCurrency(entry.price)} · {formatCurrency(entry.total)}
                  </p>
                </div>
              ))}
              {session?.ledger.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transactions yet. Place your first order!
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="rounded-3xl border border-border bg-card/70 p-4">
          <PerformanceMetrics metrics={mockPerformanceMetrics} />
        </section>

        {/* Feature Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <Feature 
            icon={ShieldCheck} 
            title="Risk-Free Learning" 
            text="Practice trading strategies with virtual money. Make mistakes and learn without financial consequences." 
          />
          <Feature 
            icon={BarChart3} 
            title="Advanced Analytics" 
            text="Track your performance with detailed metrics including win rate, Sharpe ratio, and drawdown analysis." 
          />
          <Feature 
            icon={Activity} 
            title="Real Market Data" 
            text="Trade with real Vietnam stock prices and market conditions for authentic learning experience." 
          />
        </section>
      </div>

      {/* Mobile Trade FAB */}
      <button
        onClick={() => setShowMobileTradeSheet(true)}
        className="fixed bottom-6 right-6 xl:hidden flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-primary-foreground shadow-lg hover:bg-primary/90 transition"
      >
        <TrendingUp className="h-5 w-5" />
        <span className="font-semibold">Trade</span>
      </button>

      {/* Mobile Trade Sheet */}
      {showMobileTradeSheet && session && (
        <MobileTradeSheet
          session={session}
          selectedTicker={selectedTicker}
          onTickerSelect={setSelectedTicker}
          onOrderSubmit={handleOrderSubmit}
          onClose={() => setShowMobileTradeSheet(false)}
          disabled={isBusy}
        />
      )}

      {/* Modify Order Dialog */}
      <ModifyOrderDialog
        order={modifyingOrder}
        onClose={() => setModifyingOrder(null)}
        onSave={handleModifyOrder}
      />
    </main>
  )
}

function Metric({ icon: Icon, label, value, tone = "text-foreground" }: { 
  icon: typeof Wallet
  label: string
  value: string
  tone?: string 
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className={`text-2xl font-black ${tone}`}>{value}</p>
    </div>
  )
}

function MarketCard({ stock, active, onTrade }: { 
  stock: PaperTradingMarketTicker
  active: boolean
  onTrade: () => void 
}) {
  return (
    <button 
      onClick={onTrade} 
      className={`rounded-2xl border p-4 text-left transition ${
        active 
          ? "border-primary bg-primary/10" 
          : "border-border bg-background/60 hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-black">{stock.ticker}</p>
          <p className="text-xs text-muted-foreground">
            {stock.exchange ?? "VN"} · {stock.sector ?? "Unknown"}
          </p>
        </div>
        <span className={`text-sm font-bold ${stock.changePercent >= 0 ? "text-success" : "text-danger"}`}>
          {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="font-mono font-bold">{formatCurrency(stock.price)}</p>
        <span className="text-xs text-primary">Trade</span>
      </div>
    </button>
  )
}

function Feature({ icon: Icon, title, text }: { 
  icon: typeof ShieldCheck
  title: string
  text: string 
}) {
  return (
    <div className="rounded-3xl border border-border bg-card/70 p-5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function MobileTradeSheet({ 
  session, 
  selectedTicker, 
  onTickerSelect, 
  onOrderSubmit, 
  onClose,
  disabled 
}: {
  session: PaperTradingSession
  selectedTicker: string
  onTickerSelect: (ticker: string) => void
  onOrderSubmit: (order: PlaceOrderRequest) => Promise<void>
  onClose: () => void
  disabled?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-card border-t border-border animate-in slide-in-from-bottom">
        {/* Handle */}
        <div className="sticky top-0 bg-card pt-3 pb-2 px-4 border-b border-border">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center justify-between mt-3">
            <h2 className="text-lg font-bold">Trade</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Trade Ticket Content */}
        <div className="p-4">
          <TradeTicket
            marketWatch={session.marketWatch}
            selectedTicker={selectedTicker}
            cashBalance={session.cashBalance}
            holdings={session.holdings}
            onOrderSubmit={async (order) => {
              await onOrderSubmit(order)
              onClose()
            }}
            onTickerSelect={onTickerSelect}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
