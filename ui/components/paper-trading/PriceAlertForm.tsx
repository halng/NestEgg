"use client"

import { useState } from "react"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { PriceInput } from "./PriceInput"
import type { AlertCondition, PaperTradingMarketTicker } from "@/lib/paper-trading/types"
import { formatCurrency } from "@/lib/paper-trading/formatters"

interface PriceAlertFormProps {
  marketWatch: PaperTradingMarketTicker[]
  onCreateAlert: (alert: { ticker: string; condition: AlertCondition; targetPrice: number }) => void
  disabled?: boolean
}

const CONDITIONS: { value: AlertCondition; label: string; description: string }[] = [
  { value: 'ABOVE', label: 'Above', description: 'Alert when price rises above target' },
  { value: 'BELOW', label: 'Below', description: 'Alert when price falls below target' },
  { value: 'CROSS', label: 'Crosses', description: 'Alert when price crosses target in either direction' },
]

export function PriceAlertForm({ marketWatch, onCreateAlert, disabled }: PriceAlertFormProps) {
  const [ticker, setTicker] = useState(marketWatch[0]?.ticker || '')
  const [condition, setCondition] = useState<AlertCondition>('ABOVE')
  const [targetPrice, setTargetPrice] = useState<number | undefined>()
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedStock = marketWatch.find(s => s.ticker === ticker)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticker || !targetPrice) return
    
    onCreateAlert({ ticker, condition, targetPrice })
    
    setTargetPrice(undefined)
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <Button onClick={() => setIsExpanded(true)} className="w-full" disabled={disabled}>
        <Plus className="h-4 w-4 mr-2" />
        Create Price Alert
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">New Price Alert</h3>
        </div>
        <button 
          type="button" 
          onClick={() => setIsExpanded(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Stock</label>
        <select
          value={ticker}
          onChange={(e) => {
            setTicker(e.target.value)
            const stock = marketWatch.find(s => s.ticker === e.target.value)
            if (stock) setTargetPrice(stock.price)
          }}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          {marketWatch.map((stock) => (
            <option key={stock.ticker} value={stock.ticker}>
              {stock.ticker} - {stock.name} ({formatCurrency(stock.price)})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Condition</label>
        <div className="grid grid-cols-3 gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCondition(c.value)}
              className={`rounded-lg p-2 text-center transition border ${
                condition === c.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <p className="font-medium text-sm">{c.label}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {CONDITIONS.find(c => c.value === condition)?.description}
        </p>
      </div>

      <PriceInput
        value={targetPrice}
        onChange={setTargetPrice}
        label="Target Price"
        placeholder={selectedStock?.price.toString()}
      />

      {selectedStock && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-mono">{formatCurrency(selectedStock.price)}</span>
          </div>
          {targetPrice && (
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Difference</span>
              <span className={`font-mono ${targetPrice > selectedStock.price ? 'text-success' : 'text-danger'}`}>
                {targetPrice > selectedStock.price ? '+' : ''}{((targetPrice - selectedStock.price) / selectedStock.price * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!ticker || !targetPrice}>
        <Bell className="h-4 w-4 mr-2" />
        Create Alert
      </Button>
    </form>
  )
}
