"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { formatCurrency } from "@/lib/paper-trading/formatters"

interface TrailingStopPreviewProps {
  currentPrice: number
  trailPercent: number
  side: 'BUY' | 'SELL'
}

export function TrailingStopPreview({ currentPrice, trailPercent, side }: TrailingStopPreviewProps) {
  const [animatedPrice, setAnimatedPrice] = useState(currentPrice)
  const [highestPrice, setHighestPrice] = useState(currentPrice)
  const [isAnimating, setIsAnimating] = useState(false)

  const stopPrice = highestPrice * (1 - trailPercent / 100)
  const wouldTrigger = animatedPrice <= stopPrice

  useEffect(() => {
    if (!isAnimating) return
    
    const interval = setInterval(() => {
      setAnimatedPrice(prev => {
        const change = (Math.random() - 0.45) * currentPrice * 0.02
        const newPrice = prev + change
        
        if (newPrice > highestPrice) {
          setHighestPrice(newPrice)
        }
        
        return Math.max(newPrice, currentPrice * 0.85)
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isAnimating, currentPrice, highestPrice])

  const resetDemo = () => {
    setAnimatedPrice(currentPrice)
    setHighestPrice(currentPrice)
    setIsAnimating(false)
  }

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Trailing Stop Preview</span>
        </div>
        <button
          onClick={() => isAnimating ? resetDemo() : setIsAnimating(true)}
          className="text-xs text-primary hover:underline"
        >
          {isAnimating ? 'Reset' : 'See Demo'}
        </button>
      </div>

      <div className="relative h-24 rounded-lg bg-muted/50 overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-around px-2 pb-2">
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 rounded-t transition-all duration-300 ${wouldTrigger ? 'bg-danger' : 'bg-primary'}`}
              style={{ height: `${(animatedPrice / (highestPrice * 1.1)) * 80}%` }}
            />
            <span className="text-[10px] text-muted-foreground mt-1">Current</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div 
              className="w-8 bg-success/50 rounded-t transition-all duration-300"
              style={{ height: `${(highestPrice / (highestPrice * 1.1)) * 80}%` }}
            />
            <span className="text-[10px] text-muted-foreground mt-1">High</span>
          </div>

          <div className="flex flex-col items-center">
            <div 
              className="w-8 bg-danger/50 rounded-t transition-all duration-300"
              style={{ height: `${(stopPrice / (highestPrice * 1.1)) * 80}%` }}
            />
            <span className="text-[10px] text-muted-foreground mt-1">Stop</span>
          </div>
        </div>

        {wouldTrigger && (
          <div className="absolute inset-0 flex items-center justify-center bg-danger/20">
            <span className="text-danger font-bold text-sm animate-pulse">TRIGGERED!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Current</p>
          <p className={`font-mono font-semibold ${wouldTrigger ? 'text-danger' : ''}`}>
            {formatCurrency(Math.round(animatedPrice))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Highest</p>
          <p className="font-mono font-semibold text-success">
            {formatCurrency(Math.round(highestPrice))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Stop @ -{trailPercent}%</p>
          <p className="font-mono font-semibold text-danger">
            {formatCurrency(Math.round(stopPrice))}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The trailing stop follows the highest price by {trailPercent}%. 
        If price drops {trailPercent}% from the high, your position is sold automatically.
      </p>
    </div>
  )
}
