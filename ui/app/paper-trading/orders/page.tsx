"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, Download, History } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { OrderHistoryTable } from "@/components/paper-trading/OrderHistoryTable"
import { OrderFilters, OrderFiltersState, defaultFilters } from "@/components/paper-trading/OrderFilters"
import { mockOrderHistory, mockPendingOrders } from "@/lib/paper-trading/mock-orders"
import { Order } from "@/lib/paper-trading/types"

export default function OrderHistoryPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view orders" fallbackDescription="Order history requires authentication.">
      <OrderHistoryContent />
    </RequireAuth>
  )
}

function OrderHistoryContent() {
  const [filters, setFilters] = useState<OrderFiltersState>(defaultFilters)
  
  const allOrders = useMemo(() => {
    return [...mockPendingOrders, ...mockOrderHistory]
  }, [])

  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      if (filters.search && !order.ticker.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      if (filters.side !== "ALL" && order.side !== filters.side) {
        return false
      }
      
      if (filters.status !== "ALL" && order.status !== filters.status) {
        return false
      }
      
      if (filters.orderType !== "ALL" && order.orderType !== filters.orderType) {
        return false
      }
      
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt)
        const fromDate = new Date(filters.dateFrom)
        if (orderDate < fromDate) return false
      }
      
      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (orderDate > toDate) return false
      }
      
      return true
    })
  }, [allOrders, filters])

  const handleExport = () => {
    const headers = ["Date", "Ticker", "Side", "Type", "Shares", "Price", "Total", "Status"]
    const rows = filteredOrders.map(order => [
      order.createdAt,
      order.ticker,
      order.side,
      order.orderType,
      order.requestedShares,
      order.executedPrice || order.limitPrice || "",
      order.total || "",
      order.status,
    ])
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `order-history-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleViewDetails = (order: Order) => {
    console.log("View order details:", order)
  }

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/paper-trading">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Order History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredOrders.length} orders found
              </p>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <OrderFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <OrderHistoryTable
            orders={filteredOrders}
            onViewDetails={handleViewDetails}
          />
        </div>

        {filteredOrders.length > 20 && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(20, filteredOrders.length)} of {filteredOrders.length} orders
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
