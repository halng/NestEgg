"use client"

import { useEffect, useCallback } from "react"
import { X, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PlaceOrderRequest, OrderValidationResult } from "@/lib/paper-trading/types"
import { formatCurrency, formatNumber } from "@/lib/paper-trading/formatters"
import { ORDER_TYPES } from "@/lib/paper-trading/constants"

interface OrderConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  order: PlaceOrderRequest
  stockName: string
  currentPrice: number
  validation: OrderValidationResult
  isSubmitting?: boolean
}

export function OrderConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  order,
  stockName,
  currentPrice,
  validation,
  isSubmitting,
}: OrderConfirmDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "Enter" && validation.isValid && !isSubmitting) onConfirm()
    },
    [onClose, onConfirm, validation.isValid, isSubmitting]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const orderTypeLabel = ORDER_TYPES.find((t) => t.value === order.orderType)?.label || order.orderType
  const estimatedPrice = order.limitPrice || currentPrice
  const estimatedTotal = order.shares * estimatedPrice
  const fees = Math.round(estimatedTotal * 0.0015)
  const totalWithFees = order.side === "BUY" ? estimatedTotal + fees : estimatedTotal - fees

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 id="confirm-dialog-title" className="text-xl font-bold">
            Confirm Order
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div
            className={`rounded-xl p-4 ${
              order.side === "BUY"
                ? "bg-success/10 border border-success/30"
                : "bg-danger/10 border border-danger/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-lg font-bold ${
                    order.side === "BUY" ? "text-success" : "text-danger"
                  }`}
                >
                  {order.side} {order.ticker}
                </p>
                <p className="text-sm text-muted-foreground">{stockName}</p>
              </div>
              <span className="rounded-full bg-background/60 px-3 py-1 text-xs font-semibold">
                {orderTypeLabel}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shares</span>
              <span className="font-mono font-semibold">{formatNumber(order.shares)}</span>
            </div>

            {order.orderType !== "MARKET" && order.limitPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Limit Price</span>
                <span className="font-mono">{formatCurrency(order.limitPrice)}</span>
              </div>
            )}

            {(order.orderType === "STOP" || order.orderType === "STOP_LIMIT") && order.stopPrice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Price</span>
                <span className="font-mono">{formatCurrency(order.stopPrice)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {order.orderType === "MARKET" ? "Current Price" : "Est. Price"}
              </span>
              <span className="font-mono">{formatCurrency(estimatedPrice)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Value</span>
              <span className="font-mono">{formatCurrency(estimatedTotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Fees (0.15%)</span>
              <span className="font-mono">{formatCurrency(fees)}</span>
            </div>

            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-mono font-bold text-lg">{formatCurrency(totalWithFees)}</span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Time in Force</span>
              <span>{order.timeInForce}</span>
            </div>
          </div>

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div
              className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3"
              role="alert"
            >
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  {validation.warnings.map((warning, i) => (
                    <p key={i}>{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 p-3" role="alert">
              <div className="flex gap-2">
                <X className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <div className="text-sm text-danger">
                  {validation.errors.map((error, i) => (
                    <p key={i}>{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={order.side === "BUY" ? "success" : "danger"}
            onClick={onConfirm}
            className="flex-1"
            disabled={!validation.isValid || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirm {order.side}
              </span>
            )}
          </Button>
        </div>

        {/* Keyboard hints */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to confirm ·{" "}
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to cancel
        </p>
      </div>
    </div>
  )
}
