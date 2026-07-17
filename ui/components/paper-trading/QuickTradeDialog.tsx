"use client"

import { useState, useEffect, useMemo } from "react"
import { X, TrendingUp, TrendingDown, Package } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { OrderTypeSelector } from "./OrderTypeSelector"
import { QuantityInput } from "./QuantityInput"
import { PriceInput } from "./PriceInput"
import { TimeInForceSelect } from "./TimeInForceSelect"
import { OrderConfirmDialog } from "./OrderConfirmDialog"
import {
  OrderType,
  TimeInForce,
  PlaceOrderRequest,
  PaperTradingHolding,
} from "@/lib/paper-trading/types"
import { validateOrder, calculateOrderValue } from "@/lib/paper-trading/validators"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/paper-trading/formatters"

interface StockInfo {
  ticker: string
  name: string
  price: number
  changePercent: number
  sector?: string
  exchange?: string
}

interface QuickTradeDialogProps {
  stock: StockInfo | null
  cashBalance: number
  holdings: PaperTradingHolding[]
  onClose: () => void
  onOrderSubmit: (order: PlaceOrderRequest) => Promise<void>
}

export function QuickTradeDialog({
  stock,
  cashBalance,
  holdings,
  onClose,
  onOrderSubmit,
}: QuickTradeDialogProps) {
  const [orderType, setOrderType] = useState<OrderType>("MARKET")
  const [shares, setShares] = useState(100)
  const [limitPrice, setLimitPrice] = useState<number | undefined>()
  const [stopPrice, setStopPrice] = useState<number | undefined>()
  const [timeInForce, setTimeInForce] = useState<TimeInForce>("DAY")
  const [confirmSide, setConfirmSide] = useState<"BUY" | "SELL" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (stock) {
      setLimitPrice(stock.price)
      setStopPrice(Math.round(stock.price * 0.95))
    }
  }, [stock])

  const currentHolding = useMemo(
    () => holdings.find((h) => h.ticker === stock?.ticker),
    [holdings, stock?.ticker]
  )

  const orderValue = useMemo(() => {
    if (!stock) return { value: 0, fees: 0, total: 0 }
    const price = orderType === "MARKET" ? stock.price : (limitPrice || stock.price)
    return calculateOrderValue(shares, price, confirmSide || "BUY")
  }, [stock, orderType, limitPrice, shares, confirmSide])

  if (!stock) return null

  const buildOrderRequest = (side: "BUY" | "SELL"): PlaceOrderRequest => ({
    ticker: stock.ticker,
    side,
    orderType,
    shares,
    limitPrice: orderType !== "MARKET" ? limitPrice : undefined,
    stopPrice: orderType === "STOP" || orderType === "STOP_LIMIT" ? stopPrice : undefined,
    timeInForce,
  })

  const validation = validateOrder(
    buildOrderRequest(confirmSide || "BUY"),
    cashBalance,
    holdings,
    stock.price
  )

  const handleSubmit = async () => {
    if (!confirmSide) return
    setIsSubmitting(true)
    try {
      await onOrderSubmit(buildOrderRequest(confirmSide))
      onClose()
    } finally {
      setIsSubmitting(false)
      setConfirmSide(null)
    }
  }

  const showLimitPrice = orderType !== "MARKET"
  const showStopPrice = orderType === "STOP" || orderType === "STOP_LIMIT"

  const isUp = stock.changePercent > 0
  const isDown = stock.changePercent < 0

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary text-lg">
                  {stock.ticker.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{stock.ticker}</h2>
                    {stock.exchange && (
                      <Badge variant="outline" className="text-xs">{stock.exchange}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price Display */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold">{formatCurrency(stock.price)}</span>
              <span className={`flex items-center gap-1 text-sm font-medium ${
                isUp ? "text-success" : isDown ? "text-danger" : "text-muted-foreground"
              }`}>
                {isUp ? <TrendingUp className="h-4 w-4" /> : isDown ? <TrendingDown className="h-4 w-4" /> : null}
                {formatPercent(stock.changePercent)}
              </span>
            </div>

            {/* Current Holding Badge */}
            {currentHolding && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  <span className="font-semibold">{formatNumber(currentHolding.shares)}</span> shares held
                  <span className="text-muted-foreground"> · Avg {formatCurrency(currentHolding.averageCost)}</span>
                  <span className={currentHolding.unrealizedPnl >= 0 ? "text-success" : "text-danger"}>
                    {" · "}{currentHolding.unrealizedPnl >= 0 ? "+" : ""}{formatCurrency(currentHolding.unrealizedPnl)}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Order Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Order Type</label>
              <OrderTypeSelector value={orderType} onChange={setOrderType} />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Quantity</label>
              <QuantityInput
                value={shares}
                onChange={setShares}
                step={100}
                min={1}
              />
              {currentHolding && (
                <p className="text-xs text-muted-foreground">
                  Max for sell: {formatNumber(currentHolding.shares)} shares
                </p>
              )}
            </div>

            {/* Limit Price */}
            {showLimitPrice && (
              <PriceInput
                value={limitPrice}
                onChange={setLimitPrice}
                label="Limit Price"
              />
            )}

            {/* Stop Price */}
            {showStopPrice && (
              <PriceInput
                value={stopPrice}
                onChange={setStopPrice}
                label="Stop Price"
              />
            )}

            {/* Time in Force */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Time in Force</label>
              <TimeInForceSelect value={timeInForce} onChange={setTimeInForce} />
            </div>

            {/* Order Summary */}
            <div className="rounded-xl bg-background/60 border border-border p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Value</span>
                <span className="font-mono">{formatCurrency(orderValue.value)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Est. Fees</span>
                <span className="font-mono">{formatCurrency(orderValue.fees)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-1 border-t border-border font-semibold">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(orderValue.total)}</span>
              </div>
              <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                <span>Available Cash</span>
                <span className="font-mono">{formatCurrency(cashBalance)}</span>
              </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-3">
                <ul className="text-sm text-danger space-y-1">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer - Buy/Sell Buttons */}
          <div className="sticky bottom-0 bg-card border-t border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setConfirmSide("BUY")}
                className="bg-success hover:bg-success/90 text-white py-6"
                disabled={!validation.isValid}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Buy
              </Button>
              <Button
                onClick={() => setConfirmSide("SELL")}
                className="bg-danger hover:bg-danger/90 text-white py-6"
                disabled={!validation.isValid || !currentHolding}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Sell
              </Button>
            </div>
            {!currentHolding && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                You don't hold any shares of {stock.ticker} to sell
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <OrderConfirmDialog
        isOpen={confirmSide !== null}
        onClose={() => setConfirmSide(null)}
        onConfirm={handleSubmit}
        order={buildOrderRequest(confirmSide || "BUY")}
        stockName={stock.name}
        currentPrice={stock.price}
        validation={validation}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
