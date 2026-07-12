"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuantityInput } from "./QuantityInput"
import { PriceInput } from "./PriceInput"
import { Order } from "@/lib/paper-trading/types"
import { formatCurrency } from "@/lib/paper-trading/formatters"

interface ModifyOrderDialogProps {
  order: Order | null
  onClose: () => void
  onSave: (orderId: string, updates: { shares?: number; limitPrice?: number; stopPrice?: number }) => Promise<void>
}

export function ModifyOrderDialog({ order, onClose, onSave }: ModifyOrderDialogProps) {
  const [shares, setShares] = useState(0)
  const [limitPrice, setLimitPrice] = useState<number | undefined>()
  const [stopPrice, setStopPrice] = useState<number | undefined>()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (order) {
      setShares(order.requestedShares)
      setLimitPrice(order.limitPrice)
      setStopPrice(order.stopPrice)
    }
  }, [order])

  if (!order) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(order.id, {
        shares: shares !== order.requestedShares ? shares : undefined,
        limitPrice: limitPrice !== order.limitPrice ? limitPrice : undefined,
        stopPrice: stopPrice !== order.stopPrice ? stopPrice : undefined,
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = 
    shares !== order.requestedShares ||
    limitPrice !== order.limitPrice ||
    stopPrice !== order.stopPrice

  const showLimitPrice = order.orderType === "LIMIT" || order.orderType === "STOP_LIMIT"
  const showStopPrice = order.orderType === "STOP" || order.orderType === "STOP_LIMIT"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Modify Order</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {order.side} {order.ticker} · {order.orderType}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Shares</label>
            <QuantityInput value={shares} onChange={setShares} step={100} min={1} />
          </div>

          {showLimitPrice && (
            <PriceInput
              value={limitPrice}
              onChange={setLimitPrice}
              label="Limit Price"
            />
          )}

          {showStopPrice && (
            <PriceInput
              value={stopPrice}
              onChange={setStopPrice}
              label="Stop Price"
            />
          )}

          <div className="rounded-xl bg-background/60 p-3 border border-border text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original</span>
              <span className="font-mono">
                {formatCurrency((order.limitPrice || order.stopPrice || 0) * order.requestedShares)}
              </span>
            </div>
            {hasChanges && (
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">New</span>
                <span className="font-mono font-semibold">
                  {formatCurrency((limitPrice || stopPrice || 0) * shares)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="flex-1"
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
