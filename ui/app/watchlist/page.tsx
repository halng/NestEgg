"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { 
  Plus, BellRing, ArrowUp, ArrowDown, Minus, ShoppingCart, Package,
  TrendingUp, TrendingDown, Star, ChevronDown
} from "lucide-react"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { QuickTradeDialog } from "@/components/paper-trading/QuickTradeDialog"
import { mockStocks, type Stock } from "@/lib/mock-data"
import { mockHoldings, mockSession } from "@/lib/paper-trading/mock-data"
import { simulatePlaceOrder } from "@/lib/paper-trading/mock-orders"
import type { PlaceOrderRequest, PaperTradingHolding } from "@/lib/paper-trading/types"
import { formatCurrency, formatNumber } from "@/lib/paper-trading/formatters"
import Link from "next/link"

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false"

export default function WatchlistPage() {
  const watchlist = mockStocks.slice(0, 8)
  
  const [holdings, setHoldings] = useState<PaperTradingHolding[]>(
    USE_MOCK_DATA ? mockHoldings : []
  )
  const [cashBalance, setCashBalance] = useState(
    USE_MOCK_DATA ? mockSession.cashBalance : 100_000_000
  )
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const holdingsMap = useMemo(() => {
    return new Map(holdings.map(h => [h.ticker, h]))
  }, [holdings])

  const totalWatchlistValue = useMemo(() => {
    return watchlist.reduce((sum, stock) => {
      const holding = holdingsMap.get(stock.ticker)
      return sum + (holding ? holding.marketValue : 0)
    }, 0)
  }, [watchlist, holdingsMap])

  const topPerformer = useMemo(() => {
    return watchlist.reduce((top, stock) => 
      stock.changePercent > (top?.changePercent ?? -Infinity) ? stock : top
    , watchlist[0])
  }, [watchlist])

  const heldCount = useMemo(() => {
    return watchlist.filter(s => holdingsMap.has(s.ticker)).length
  }, [watchlist, holdingsMap])

  const handleOrderSubmit = async (order: PlaceOrderRequest) => {
    if (USE_MOCK_DATA) {
      const result = simulatePlaceOrder(order)
      if (result.status === "FILLED") {
        const stock = watchlist.find(s => s.ticker === order.ticker)
        if (!stock) return

        const executedPrice = result.executedPrice ?? stock.price
        const filledShares = result.filledShares

        if (order.side === "BUY") {
          setCashBalance(prev => prev - (executedPrice * filledShares * 1.0015))
          setHoldings(prev => {
            const existing = prev.find(h => h.ticker === order.ticker)
            if (existing) {
              const newShares = existing.shares + filledShares
              const newAvgCost = (existing.averageCost * existing.shares + executedPrice * filledShares) / newShares
              return prev.map(h => h.ticker === order.ticker ? {
                ...h,
                shares: newShares,
                averageCost: newAvgCost,
                currentPrice: stock.price,
                marketValue: newShares * stock.price,
                unrealizedPnl: (stock.price - newAvgCost) * newShares,
              } : h)
            } else {
              return [...prev, {
                ticker: order.ticker,
                shares: filledShares,
                averageCost: executedPrice,
                currentPrice: stock.price,
                marketValue: filledShares * stock.price,
                unrealizedPnl: 0,
                sector: stock.sector,
              }]
            }
          })
        } else {
          setCashBalance(prev => prev + (executedPrice * filledShares * 0.9985))
          setHoldings(prev => {
            const existing = prev.find(h => h.ticker === order.ticker)
            if (!existing) return prev
            const newShares = existing.shares - filledShares
            if (newShares <= 0) {
              return prev.filter(h => h.ticker !== order.ticker)
            }
            return prev.map(h => h.ticker === order.ticker ? {
              ...h,
              shares: newShares,
              currentPrice: stock.price,
              marketValue: newShares * stock.price,
              unrealizedPnl: (stock.price - h.averageCost) * newShares,
            } : h)
          })
        }
        setMessage(`${order.side} order filled: ${filledShares} ${order.ticker} @ ${formatCurrency(executedPrice)}`)
      }
    }
  }

  const statusColor = (stock: Stock) => {
    if (stock.status === "ceiling") return "text-ceiling font-semibold"
    if (stock.status === "floor") return "text-floor font-semibold"
    if (stock.status === "up") return "text-success"
    if (stock.status === "down") return "text-danger"
    return "text-muted-foreground"
  }

  return (
    <RequireAuth permission="viewWatchlist">
      <div className="p-4 md:p-8 bg-background min-h-full pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tracking your favorite VN Market stocks. Quick trade directly from here.
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/paper-trading/alerts">
                <Button variant="outline"><BellRing className="w-4 h-4 mr-2" /> Alerts</Button>
              </Link>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Ticker</Button>
            </div>
          </div>

          {/* Message Toast */}
          {message && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
              <div className="bg-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <span>{message}</span>
                <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">×</button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Holdings Value</p>
                <h3 className="text-xl font-bold text-foreground">{formatCurrency(totalWatchlistValue)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
            
            <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Cash Available</p>
                <h3 className="text-xl font-bold text-foreground">{formatCurrency(cashBalance)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-sm">
                VND
              </div>
            </div>
            
            <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Top Performer</p>
                <h3 className="text-xl font-bold text-foreground">{topPerformer?.ticker}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-ceiling/20 flex items-center justify-center text-ceiling font-bold text-sm">
                +{topPerformer?.changePercent.toFixed(1)}%
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Held Stocks</p>
                <h3 className="text-xl font-bold text-foreground">{heldCount} / {watchlist.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                <Star className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Watchlist Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-border bg-secondary/70 text-xs uppercase text-muted-foreground backdrop-blur">
                <tr>
                  <th className="min-w-[180px] px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                  <th className="hidden md:table-cell px-4 py-3 font-semibold">Signal</th>
                  <th className="hidden lg:table-cell px-4 py-3 font-semibold">Sector</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {watchlist.map((stock) => {
                  const holding = holdingsMap.get(stock.ticker)
                  const isUp = stock.status === "up" || stock.status === "ceiling"
                  const isDown = stock.status === "down" || stock.status === "floor"

                  return (
                    <tr
                      key={stock.ticker}
                      className="group transition-colors hover:bg-muted/50"
                    >
                      {/* Stock Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary ring-1 ring-primary/20">
                            {stock.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{stock.ticker}</span>
                              <Badge variant="outline" className="text-[10px]">{stock.exchange}</Badge>
                              {holding && (
                                <Badge variant="success" className="text-[10px]">
                                  <Package className="h-3 w-3 mr-1" />
                                  Held
                                </Badge>
                              )}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{stock.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className={"px-4 py-3 font-mono " + statusColor(stock)}>
                        {formatCurrency(stock.price)}
                      </td>

                      {/* Change */}
                      <td className="px-4 py-3">
                        <div className={"flex items-center gap-1 " + statusColor(stock)}>
                          {isUp ? <ArrowUp className="h-4 w-4" /> : isDown ? <ArrowDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                          <span>{Math.abs(stock.changePercent).toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* Signal */}
                      <td className="hidden md:table-cell px-4 py-3">
                        <Badge 
                          variant={stock.signal === "Breakout" ? "success" : stock.signal === "Watch" ? "secondary" : "outline"}
                          className="rounded-full"
                        >
                          {stock.signal}
                        </Badge>
                      </td>

                      {/* Sector */}
                      <td className="hidden lg:table-cell px-4 py-3 text-muted-foreground text-xs">
                        {stock.sector}
                      </td>

                      {/* Position */}
                      <td className="px-4 py-3">
                        {holding ? (
                          <div className="text-sm">
                            <div className="font-semibold">{formatNumber(holding.shares)} shares</div>
                            <div className={`text-xs ${holding.unrealizedPnl >= 0 ? "text-success" : "text-danger"}`}>
                              {holding.unrealizedPnl >= 0 ? "+" : ""}{formatCurrency(holding.unrealizedPnl)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Trade Button */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => setSelectedStock(stock)}
                          className="rounded-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Trade
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paper Trading Link */}
          <div className="text-center pt-4">
            <Link href="/paper-trading">
              <Button variant="outline" className="rounded-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Go to Paper Trading Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Trade Dialog */}
      {selectedStock && (
        <QuickTradeDialog
          stock={{
            ticker: selectedStock.ticker,
            name: selectedStock.name,
            price: selectedStock.price,
            changePercent: selectedStock.changePercent,
            sector: selectedStock.sector,
            exchange: selectedStock.exchange,
          }}
          cashBalance={cashBalance}
          holdings={holdings}
          onClose={() => setSelectedStock(null)}
          onOrderSubmit={handleOrderSubmit}
        />
      )}
    </RequireAuth>
  )
}
