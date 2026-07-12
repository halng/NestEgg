import type { PlaceOrderRequest, OrderValidationResult, PaperTradingHolding } from "./types"

export function validateOrder(
  order: PlaceOrderRequest,
  cashBalance: number,
  holdings: PaperTradingHolding[],
  currentPrice: number
): OrderValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (order.shares <= 0) {
    errors.push("Shares must be greater than 0")
  }
  if (order.shares % 100 !== 0) {
    warnings.push("Vietnam market typically trades in lots of 100 shares")
  }

  if (order.orderType === "LIMIT" || order.orderType === "STOP_LIMIT") {
    if (!order.limitPrice || order.limitPrice <= 0) {
      errors.push("Limit price is required for limit orders")
    }
  }

  if (order.orderType === "STOP" || order.orderType === "STOP_LIMIT") {
    if (!order.stopPrice || order.stopPrice <= 0) {
      errors.push("Stop price is required for stop orders")
    }
  }

  if (order.orderType === "TRAILING_STOP") {
    if (!order.trailPercent || order.trailPercent <= 0 || order.trailPercent > 20) {
      errors.push("Trail percentage must be between 0.1% and 20%")
    }
  }

  if (order.side === "BUY") {
    const estimatedCost = order.shares * (order.limitPrice || currentPrice)
    if (estimatedCost > cashBalance) {
      errors.push(
        `Insufficient funds. Need ${estimatedCost.toLocaleString()} but only have ${cashBalance.toLocaleString()}`
      )
    }
    if (estimatedCost > cashBalance * 0.9) {
      warnings.push("This order will use more than 90% of your buying power")
    }
  }

  if (order.side === "SELL") {
    const holding = holdings.find((h) => h.ticker === order.ticker)
    const availableShares = holding?.shares || 0
    if (order.shares > availableShares) {
      errors.push(`Insufficient shares. You only have ${availableShares} shares of ${order.ticker}`)
    }
  }

  if (order.limitPrice) {
    const priceDiff = Math.abs(order.limitPrice - currentPrice) / currentPrice
    if (priceDiff > 0.15) {
      warnings.push("Limit price is more than 15% away from current price")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function calculateOrderValue(
  shares: number,
  price: number,
  side: "BUY" | "SELL"
): { value: number; fees: number; total: number } {
  const value = shares * price
  const fees = Math.round(value * 0.0015)
  const total = side === "BUY" ? value + fees : value - fees
  return { value, fees, total }
}
