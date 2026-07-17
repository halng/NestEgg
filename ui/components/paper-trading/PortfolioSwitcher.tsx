"use client"

import { useState, useRef, useEffect } from "react"
import {
  Briefcase,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/paper-trading/formatters"
import type { Portfolio, PortfolioSummary } from "@/lib/paper-trading/mock-portfolios"
import { PORTFOLIO_STRATEGIES } from "@/lib/paper-trading/mock-portfolios"

interface PortfolioSwitcherProps {
  portfolios: Portfolio[]
  activePortfolio: Portfolio | null
  onSwitch: (portfolioId: string) => void
  onCreateNew: () => void
  onDelete: (portfolioId: string) => void
  onCompare?: () => void
}

export function PortfolioSwitcher({
  portfolios,
  activePortfolio,
  onSwitch,
  onCreateNew,
  onDelete,
  onCompare,
}: PortfolioSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setDeleteConfirm(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getStrategyIcon = (strategy?: string) => {
    const found = PORTFOLIO_STRATEGIES.find(s => s.value === strategy)
    return found?.icon || "📁"
  }

  const handleDelete = (e: React.MouseEvent, portfolioId: string) => {
    e.stopPropagation()
    
    if (deleteConfirm === portfolioId) {
      onDelete(portfolioId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(portfolioId)
    }
  }

  const handleSelect = (portfolioId: string) => {
    onSwitch(portfolioId)
    setIsOpen(false)
    setDeleteConfirm(null)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Portfolio Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition w-full min-w-[280px]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
          {activePortfolio ? getStrategyIcon(activePortfolio.strategy) : <Briefcase className="h-5 w-5 text-primary" />}
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {activePortfolio?.name || "Select Portfolio"}
            </span>
            <span className="flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
              Active
            </span>
          </div>
          {activePortfolio && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(activePortfolio.totalValue)}
              </span>
              <span className={activePortfolio.roi >= 0 ? "text-success" : "text-danger"}>
                {formatPercent(activePortfolio.roi)}
              </span>
            </div>
          )}
        </div>

        <ChevronDown className={`h-5 w-5 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Portfolio List */}
          <div className="max-h-[320px] overflow-y-auto">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                onClick={() => handleSelect(portfolio.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition border-b border-border last:border-0 ${
                  portfolio.isActive ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">
                  {getStrategyIcon(portfolio.strategy)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{portfolio.name}</span>
                    {portfolio.isActive && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(portfolio.totalValue)}
                    </span>
                    <span className={`flex items-center gap-0.5 ${
                      portfolio.roi >= 0 ? "text-success" : "text-danger"
                    }`}>
                      {portfolio.roi >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatPercent(portfolio.roi)}
                    </span>
                  </div>
                </div>

                {/* Delete button - only show if not active and more than 1 portfolio */}
                {!portfolio.isActive && portfolios.length > 1 && (
                  <button
                    onClick={(e) => handleDelete(e, portfolio.id)}
                    className={`p-2 rounded-lg transition ${
                      deleteConfirm === portfolio.id
                        ? "bg-danger text-danger-foreground"
                        : "hover:bg-danger/10 text-muted-foreground hover:text-danger"
                    }`}
                    title={deleteConfirm === portfolio.id ? "Click again to confirm" : "Delete portfolio"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-border p-2 flex gap-2">
            <button
              onClick={() => {
                onCreateNew()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 flex-1 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
            >
              <Plus className="h-4 w-4" />
              New Portfolio
            </button>

            {onCompare && portfolios.length > 1 && (
              <button
                onClick={() => {
                  onCompare()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition"
              >
                <BarChart3 className="h-4 w-4" />
                Compare
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Compact summary card for portfolio comparison
interface PortfolioCompareCardProps {
  portfolio: Portfolio
  isSelected?: boolean
  onClick?: () => void
}

export function PortfolioCompareCard({ portfolio, isSelected, onClick }: PortfolioCompareCardProps) {
  const strategyMeta = PORTFOLIO_STRATEGIES.find(s => s.value === portfolio.strategy)
  
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 transition cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{strategyMeta?.icon || "📁"}</span>
          <div>
            <h4 className="font-semibold">{portfolio.name}</h4>
            <p className="text-xs text-muted-foreground">{strategyMeta?.label || "Custom"}</p>
          </div>
        </div>
        {portfolio.isActive && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Active
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Value</span>
          <span className="font-mono font-medium">{formatCurrency(portfolio.totalValue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ROI</span>
          <span className={`font-mono font-medium ${portfolio.roi >= 0 ? "text-success" : "text-danger"}`}>
            {formatPercent(portfolio.roi)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Holdings</span>
          <span className="font-mono">{portfolio.holdings.length} stocks</span>
        </div>
      </div>
    </div>
  )
}
