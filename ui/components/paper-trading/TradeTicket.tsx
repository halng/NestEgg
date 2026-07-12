"use client"

import { useState, useMemo } from "react"
import { Bot, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { OrderTypeSelector } from "./OrderTypeSelector"
import { QuantityInput } from "./QuantityInput"
import { PriceInput } from "./PriceInput"
import { TimeInForceSelect } from "./TimeInForceSelect"
import { OrderConfirmDialog } from "./OrderConfirmDialog"
import { TrailingStopPreview } from "./TrailingStopPreview"
import {
  OrderType,
  TimeInForce,
  PlaceOrderRequest,
  PaperTradingMarketTicker,
  PaperTradingHolding,
} from "@/lib/paper-trading/types"
import { validateOrder, calculateOrderValue } from "@/lib/paper-trading/validators"
import { formatCurrency, formatNumber } from "@/lib/paper-trading/formatters"

interface TradeTicketProps {
  marketWatch: PaperTradingMarketTicker[]
  selectedTicker: string | null
  cashBalance: number
  holdings: PaperTradingHolding[]
  onOrderSubmit: (order: PlaceOrderRequest) => Promise<void>
  onTickerSelect: (ticker: string) => void
  disabled?: boolean
}

export function TradeTicket({
  marketWatch,
  selectedTicker,
  cashBalance,
  holdings,
  onOrderSubmit,
  onTickerSelect,
  disabled,
}: TradeTicketProps) {
  // Form state
  const [orderType, setOrderType] = useState<OrderType>("MARKET")
  const [shares, setShares] = useState(100)
  const [limitPrice, setLimitPrice] = useState<number | undefined>()
  const [stopPrice, setStopPrice] = useState<number | undefined>()
  const [timeInForce, setTimeInForce] = useState<TimeInForce>("DAY")
  const [trailPercent, setTrailPercent] = useState<number>(5)

  // UI state
  const [confirmSide, setConfirmSide] = useState<"BUY" | "SELL" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get selected stock details
  const selectedStock = useMemo(
    () => marketWatch.find((s) => s.ticker === selectedTicker),
    [marketWatch, selectedTicker]
  )

  // Get current holding for selected ticker
  const currentHolding = useMemo(
    () => holdings.find((h) => h.ticker === selectedTicker),
    [holdings, selectedTicker]
  )

  // Calculate order value
  const orderValue = useMemo(() => {
    if (!selectedStock) return { value: 0, fees: 0, total: 0 }
    const price = orderType === "MARKET" ? selectedStock.price : (limitPrice || selectedStock.price)
    return calculateOrderValue(shares, price, confirmSide || "BUY")
  }, [selectedStock, orderType, limitPrice, shares, confirmSide])

  // Build order request
  const buildOrderRequest = (side: "BUY" | "SELL"): PlaceOrderRequest => ({
    ticker: selectedTicker!,
    side,
    orderType,
    shares,
    limitPrice: orderType !== "MARKET" ? limitPrice : undefined,
    stopPrice: orderType === "STOP" || orderType === "STOP_LIMIT" ? stopPrice : undefined,
    trailPercent: orderType === "TRAILING_STOP" ? trailPercent : undefined,
    timeInForce,
  })

  // Validation
  const validation = useMemo(() => {
    if (!selectedStock || !confirmSide) {
      return { isValid: true, errors: [], warnings: [] }
    }
    return validateOrder(buildOrderRequest(confirmSide), cashBalance, holdings, selectedStock.price)
  }, [selectedStock, confirmSide, orderType, shares, limitPrice, stopPrice, cashBalance, holdings])

  // Handle order type change - set default limit price
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type)
    if (type !== "MARKET" && selectedStock && !limitPrice) {
      setLimitPrice(selectedStock.price)
    }
    if ((type === "STOP" || type === "STOP_LIMIT") && selectedStock && !stopPrice) {
      setStopPrice(Math.round(selectedStock.price * 0.95))
    }
  }

  // Handle trade button click
  const handleTradeClick = (side: "BUY" | "SELL") => {
    setConfirmSide(side)
  }

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    if (!confirmSide || !selectedStock) return

    setIsSubmitting(true)
    try {
      await onOrderSubmit(buildOrderRequest(confirmSide))
      // Reset form on success
      setShares(100)
      if (orderType !== "MARKET") {
        setLimitPrice(selectedStock.price)
      }
      setConfirmSide(null)
    } catch (error) {
      console.error("Order failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show needs limit/stop price/trailing stop
  const showLimitPrice = orderType === "LIMIT" || orderType === "STOP_LIMIT"
  const showStopPrice = orderType === "STOP" || orderType === "STOP_LIMIT"
  const showTrailingStop = orderType === "TRAILING_STOP"

  return (
    <>
      <div className="rounded-3xl border border-border bg-card/70 p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Trade Ticket</h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {orderType === "MARKET" ? "Market Order" : orderType.replace("_", "-")}
          </span>
        </div>

        <div className="space-y-4">
          {/* Ticker Selection */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Select Stock</label>
            <select
              value={selectedTicker || ""}
              onChange={(e) => onTickerSelect(e.target.value)}
              disabled={disabled}
              aria-label="Select stock"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              {marketWatch.map((stock) => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} · {stock.name || "Listed company"}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Info */}
          {selectedStock && (
            <div className="rounded-xl bg-background/60 p-3 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{selectedStock.ticker}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedStock.exchange} · {selectedStock.sector}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{formatCurrency(selectedStock.price)}</p>
                  <p
                    className={`text-sm flex items-center gap-1 justify-end ${
                      selectedStock.changePercent >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {selectedStock.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {selectedStock.changePercent >= 0 ? "+" : ""}
                    {selectedStock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              {currentHolding && (
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  You own{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(currentHolding.shares)}
                  </span>{" "}
                  shares · P/L:{" "}
                  <span className={currentHolding.unrealizedPnl >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(currentHolding.unrealizedPnl)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Order Type */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Order Type</label>
            <OrderTypeSelector
              value={orderType}
              onChange={handleOrderTypeChange}
              disabled={disabled}
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Shares</label>
            <QuantityInput value={shares} onChange={setShares} step={100} min={1} disabled={disabled} />
          </div>

          {/* Limit Price (conditional) */}
          {showLimitPrice && (
            <PriceInput
              value={limitPrice}
              onChange={setLimitPrice}
              label="Limit Price"
              placeholder={selectedStock?.price.toString()}
              disabled={disabled}
            />
          )}

          {/* Stop Price (conditional) */}
          {showStopPrice && (
            <PriceInput
              value={stopPrice}
              onChange={setStopPrice}
              label="Stop Price"
              placeholder={selectedStock ? Math.round(selectedStock.price * 0.95).toString() : "0"}
              disabled={disabled}
            />
          )}

          {/* Trailing Stop (conditional) */}
          {showTrailingStop && (
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Trail Percentage</label>
                  <span className="text-sm font-semibold">{trailPercent}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={trailPercent}
                  onChange={(e) => setTrailPercent(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>
              {selectedStock && (
                <TrailingStopPreview
                  currentPrice={selectedStock.price}
                  trailPercent={trailPercent}
                  side="SELL"
                />
              )}
            </>
          )}

          {/* Time in Force (for non-market orders) */}
          {orderType !== "MARKET" && (
            <TimeInForceSelect value={timeInForce} onChange={setTimeInForce} disabled={disabled} />
          )}

          {/* Estimated Value */}
          <div className="rounded-xl bg-background/60 p-3 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Value</span>
              <span className="font-mono font-semibold">{formatCurrency(orderValue.value)}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">Available Cash</span>
              <span className="font-mono">{formatCurrency(cashBalance)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="success"
              onClick={() => handleTradeClick("BUY")}
              disabled={disabled || !selectedStock}
              className="h-12"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </Button>
            <Button
              variant="danger"
              onClick={() => handleTradeClick("SELL")}
              disabled={disabled || !selectedStock || !currentHolding}
              className="h-12"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </Button>
          </div>

          {/* What-if helper */}
          <Button variant="outline" onClick={() => {}} disabled={!selectedStock} className="w-full">
            <Bot className="h-4 w-4 mr-2" />
            What-if Analysis
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmSide && selectedStock && (
        <OrderConfirmDialog
          isOpen={true}
          onClose={() => setConfirmSide(null)}
          onConfirm={handleConfirmOrder}
          order={buildOrderRequest(confirmSide)}
          stockName={selectedStock.name || selectedStock.ticker}
          currentPrice={selectedStock.price}
          validation={validation}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}
