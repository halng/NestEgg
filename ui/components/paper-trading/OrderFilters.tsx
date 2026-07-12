"use client"

import { Search, X } from "lucide-react"
import { OrderSide, OrderStatus, OrderType } from "@/lib/paper-trading/types"

export interface OrderFiltersState {
  search: string
  side: OrderSide | "ALL"
  status: OrderStatus | "ALL"
  orderType: OrderType | "ALL"
  dateFrom: string
  dateTo: string
}

interface OrderFiltersProps {
  filters: OrderFiltersState
  onChange: (filters: OrderFiltersState) => void
  onReset: () => void
}

export const defaultFilters: OrderFiltersState = {
  search: "",
  side: "ALL",
  status: "ALL",
  orderType: "ALL",
  dateFrom: "",
  dateTo: "",
}

export function OrderFilters({ filters, onChange, onReset }: OrderFiltersProps) {
  const hasActiveFilters = 
    filters.search !== "" ||
    filters.side !== "ALL" ||
    filters.status !== "ALL" ||
    filters.orderType !== "ALL" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""

  const updateFilter = <K extends keyof OrderFiltersState>(key: K, value: OrderFiltersState[K]) => {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search by ticker..."
          className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.side}
          onChange={(e) => updateFilter("side", e.target.value as OrderSide | "ALL")}
          className="h-9 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="ALL">All Sides</option>
          <option value="BUY">Buy</option>
          <option value="SELL">Sell</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => updateFilter("status", e.target.value as OrderStatus | "ALL")}
          className="h-9 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="ALL">All Status</option>
          <option value="FILLED">Filled</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REJECTED">Rejected</option>
          <option value="PARTIAL">Partial</option>
        </select>

        <select
          value={filters.orderType}
          onChange={(e) => updateFilter("orderType", e.target.value as OrderType | "ALL")}
          className="h-9 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="ALL">All Types</option>
          <option value="MARKET">Market</option>
          <option value="LIMIT">Limit</option>
          <option value="STOP">Stop</option>
          <option value="STOP_LIMIT">Stop-Limit</option>
        </select>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="h-9 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="h-9 rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
