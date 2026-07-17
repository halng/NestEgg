"use client"

import { useState, useMemo } from "react"
import { ChevronUp, ChevronDown, FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Order, OrderStatus } from "@/lib/paper-trading/types"
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/paper-trading/formatters"
import { ORDER_TYPES } from "@/lib/paper-trading/constants"

interface OrderHistoryTableProps {
  orders: Order[]
  onViewDetails?: (order: Order) => void
}

type SortField = "createdAt" | "ticker" | "side" | "total" | "status"
type SortDirection = "asc" | "desc"

const statusConfig: Record<OrderStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  FILLED: { icon: CheckCircle, color: "text-success", label: "Filled" },
  PENDING: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  PARTIAL: { icon: Clock, color: "text-blue-500", label: "Partial" },
  CANCELLED: { icon: XCircle, color: "text-muted-foreground", label: "Cancelled" },
  REJECTED: { icon: AlertCircle, color: "text-danger", label: "Rejected" },
}

export function OrderHistoryTable({ orders, onViewDetails }: OrderHistoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "ticker":
          comparison = a.ticker.localeCompare(b.ticker)
          break
        case "side":
          comparison = a.side.localeCompare(b.side)
          break
        case "total":
          comparison = (a.total || 0) - (b.total || 0)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [orders, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="p-3 cursor-pointer hover:bg-muted/30 transition select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" 
            ? <ChevronUp className="h-3 w-3" />
            : <ChevronDown className="h-3 w-3" />
        )}
      </div>
    </th>
  )

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-background/60 p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No orders found</p>
        <p className="text-sm text-muted-foreground/70">
          Your order history will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <tr>
            <SortHeader field="createdAt">Date</SortHeader>
            <SortHeader field="ticker">Ticker</SortHeader>
            <SortHeader field="side">Side</SortHeader>
            <th className="p-3">Type</th>
            <th className="p-3">Shares</th>
            <th className="p-3">Price</th>
            <SortHeader field="total">Total</SortHeader>
            <SortHeader field="status">Status</SortHeader>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => {
            const orderTypeLabel = ORDER_TYPES.find(t => t.value === order.orderType)?.label || order.orderType
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <tr 
                key={order.id} 
                className="border-b border-border hover:bg-muted/30 transition cursor-pointer"
                onClick={() => onViewDetails?.(order)}
              >
                <td className="p-3 text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </td>
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
                <td className="p-3 font-mono">
                  {order.filledShares > 0 && order.filledShares !== order.requestedShares ? (
                    <span>
                      {formatNumber(order.filledShares)}/{formatNumber(order.requestedShares)}
                    </span>
                  ) : (
                    formatNumber(order.requestedShares)
                  )}
                </td>
                <td className="p-3 font-mono">
                  {order.executedPrice 
                    ? formatCurrency(order.executedPrice)
                    : order.limitPrice 
                      ? formatCurrency(order.limitPrice)
                      : "-"
                  }
                </td>
                <td className="p-3 font-mono font-semibold">
                  {order.total ? formatCurrency(order.total) : "-"}
                </td>
                <td className="p-3">
                  <span className={`flex items-center gap-1.5 ${status.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
