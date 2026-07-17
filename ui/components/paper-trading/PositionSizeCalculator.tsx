"use client"

import { useState, useMemo } from "react"
import { Calculator, AlertTriangle, Info } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/paper-trading/formatters"

interface PositionSizeCalculatorProps {
  portfolioValue: number
  cashBalance: number
}

export function PositionSizeCalculator({ portfolioValue, cashBalance }: PositionSizeCalculatorProps) {
  const [riskPercent, setRiskPercent] = useState(2)
  const [entryPrice, setEntryPrice] = useState<number>(100000)
  const [stopLossPrice, setStopLossPrice] = useState<number>(95000)
  const [isExpanded, setIsExpanded] = useState(false)

  const calculation = useMemo(() => {
    const riskAmount = portfolioValue * (riskPercent / 100)
    const stopLossDistance = entryPrice - stopLossPrice
    const stopLossPercent = (stopLossDistance / entryPrice) * 100
    
    if (stopLossDistance <= 0) {
      return {
        isValid: false,
        error: 'Stop loss must be below entry price',
        riskAmount,
        shares: 0,
        positionValue: 0,
        positionPercent: 0,
        stopLossPercent: 0,
      }
    }

    const shares = Math.floor(riskAmount / stopLossDistance)
    const positionValue = shares * entryPrice
    const positionPercent = (positionValue / portfolioValue) * 100
    
    const roundedShares = Math.floor(shares / 100) * 100

    return {
      isValid: true,
      riskAmount,
      shares: roundedShares,
      exactShares: shares,
      positionValue: roundedShares * entryPrice,
      positionPercent: (roundedShares * entryPrice / portfolioValue) * 100,
      stopLossPercent,
      exceedsCash: roundedShares * entryPrice > cashBalance,
    }
  }, [portfolioValue, cashBalance, riskPercent, entryPrice, stopLossPrice])

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/50 transition"
      >
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Position Size Calculator</p>
            <p className="text-sm text-muted-foreground">Calculate optimal position size based on risk</p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Position Size Calculator</h3>
        </div>
        <button 
          onClick={() => setIsExpanded(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Collapse
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label className="text-muted-foreground">Risk per trade</label>
          <span className="font-semibold">{riskPercent}% ({formatCurrency(calculation.riskAmount)})</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.5}
          value={riskPercent}
          onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Conservative (0.5%)</span>
          <span>Aggressive (5%)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Entry Price</label>
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 font-mono text-foreground outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Stop Loss Price</label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(Number(e.target.value))}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 font-mono text-foreground outline-none focus:border-primary"
          />
        </div>
      </div>

      {calculation.isValid ? (
        <div className="rounded-lg bg-background/60 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Recommended Shares</p>
              <p className="text-xl font-bold text-primary">{formatNumber(calculation.shares)}</p>
              {calculation.shares !== calculation.exactShares && (
                <p className="text-xs text-muted-foreground">
                  (Rounded from {formatNumber(calculation.exactShares)} to lot of 100)
                </p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Position Value</p>
              <p className="text-xl font-bold">{formatCurrency(calculation.positionValue)}</p>
              <p className="text-xs text-muted-foreground">
                {calculation.positionPercent.toFixed(1)}% of portfolio
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Stop Loss Distance</p>
              <p className="font-mono text-danger">-{calculation.stopLossPercent.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Loss if Stopped</p>
              <p className="font-mono text-danger">{formatCurrency(calculation.riskAmount)}</p>
            </div>
          </div>

          {calculation.exceedsCash && (
            <div className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Insufficient cash</p>
                <p>Position requires {formatCurrency(calculation.positionValue)} but you only have {formatCurrency(cashBalance)} available.</p>
              </div>
            </div>
          )}

          {calculation.positionPercent > 25 && !calculation.exceedsCash && (
            <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>This position would be {calculation.positionPercent.toFixed(1)}% of your portfolio. Consider diversifying.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4" />
          <p>{calculation.error}</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          The calculator determines position size so that if your stop loss is hit, 
          you lose at most {riskPercent}% of your portfolio value.
        </p>
      </div>
    </div>
  )
}
