"use client"

import { useState } from "react"
import { Edit2, X, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Order } from "@/lib/paper-trading/types"
import { formatCurrency, formatNumber, formatRelativeTime } from "@/lib/paper-trading/formatters"
import { ORDER_TYPES } from "@/lib/paper-trading/constants"

interface PendingOrdersTableProps {
  orders: Order[]
  onModify: (order: Order) => void
  onCancel: (orderId: string) => void
  isLoading?: boolean
}

export function PendingOrdersTable({ orders, onModify, onCancel, isLoading }: PendingOrdersTableProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const handleCancel = async (orderId: string) => {
    setCancelingId(orderId)
    try {
      await onCancel(orderId)
    } finally {
      setCancelingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-background/60 p-8 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No pending orders</p>
        <p className="text-sm text-muted-foreground/70">
          Limit and stop orders will appear here until filled
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <th className="p-3">Ticker</th>
            <th className="p-3">Side</th>
            <th className="p-3">Type</th>
            <th className="p-3">Shares</th>
            <th className="p-3">Price</th>
            <th className="p-3">Created</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const orderTypeLabel = ORDER_TYPES.find(t => t.value === order.orderType)?.label || order.orderType
            const displayPrice = order.limitPrice || order.stopPrice

            return (
              <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition">
                <td className="p-3 font-bold">{order.ticker}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.side === "BUY" 
                      ? "bg-success/10 text-success" 
                      : "bg-danger/10 text-danger"
                  }`}>
                    {order.side}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-muted text-xs">
                    {orderTypeLabel}
                  </span>
                </td>
                <td className="p-3 font-mono">{formatNumber(order.requestedShares)}</td>
                <td className="p-3 font-mono">
                  {displayPrice ? formatCurrency(displayPrice) : '-'}
                  {order.stopPrice && order.limitPrice && (
                    <span className="text-xs text-muted-foreground block">
                      Stop: {formatCurrency(order.stopPrice)}
                    </span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">
                  {formatRelativeTime(order.createdAt)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onModify(order)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelingId === order.id}
                      className="text-danger hover:bg-danger/10"
                    >
                      {cancelingId === order.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
