"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Settings2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Input } from "@/components/ui/Input"
import type { IndicatorConfig, IndicatorType } from "@/lib/paper-trading/types"
import { DEFAULT_INDICATORS, INDICATOR_INFO } from "@/lib/paper-trading/indicators"

interface TechnicalIndicatorsProps {
  indicators: IndicatorConfig[]
  onIndicatorChange: (indicators: IndicatorConfig[]) => void
}

export function TechnicalIndicators({ 
  indicators = DEFAULT_INDICATORS, 
  onIndicatorChange 
}: TechnicalIndicatorsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleToggleIndicator = (id: string) => {
    const updated = indicators.map(ind => 
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    )
    onIndicatorChange(updated)
  }

  const handlePeriodChange = (id: string, period: number) => {
    const updated = indicators.map(ind => 
      ind.id === id ? { ...ind, period: Math.max(1, period) } : ind
    )
    onIndicatorChange(updated)
  }

  const handleMACDChange = (
    id: string, 
    field: 'fastPeriod' | 'slowPeriod' | 'signalPeriod', 
    value: number
  ) => {
    const updated = indicators.map(ind => 
      ind.id === id ? { ...ind, [field]: Math.max(1, value) } : ind
    )
    onIndicatorChange(updated)
  }

  const handleStdDevChange = (id: string, stdDev: number) => {
    const updated = indicators.map(ind => 
      ind.id === id ? { ...ind, stdDev: Math.max(0.5, stdDev) } : ind
    )
    onIndicatorChange(updated)
  }

  const enabledCount = indicators.filter(i => i.enabled).length

  const groupedIndicators = indicators.reduce((acc, ind) => {
    if (!acc[ind.type]) {
      acc[ind.type] = []
    }
    acc[ind.type].push(ind)
    return acc
  }, {} as Record<IndicatorType, IndicatorConfig[]>)

  const renderIndicatorSettings = (indicator: IndicatorConfig) => {
    if (editingId !== indicator.id) return null

    return (
      <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
        {indicator.type === 'MACD' ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Fast</label>
              <Input
                type="number"
                value={indicator.fastPeriod || 12}
                onChange={(e) => handleMACDChange(indicator.id, 'fastPeriod', parseInt(e.target.value) || 12)}
                className="h-7 text-xs"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Slow</label>
              <Input
                type="number"
                value={indicator.slowPeriod || 26}
                onChange={(e) => handleMACDChange(indicator.id, 'slowPeriod', parseInt(e.target.value) || 26)}
                className="h-7 text-xs"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Signal</label>
              <Input
                type="number"
                value={indicator.signalPeriod || 9}
                onChange={(e) => handleMACDChange(indicator.id, 'signalPeriod', parseInt(e.target.value) || 9)}
                className="h-7 text-xs"
                min={1}
              />
            </div>
          </div>
        ) : indicator.type === 'BOLLINGER' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Period</label>
              <Input
                type="number"
                value={indicator.period}
                onChange={(e) => handlePeriodChange(indicator.id, parseInt(e.target.value) || 20)}
                className="h-7 text-xs"
                min={1}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Std Dev</label>
              <Input
                type="number"
                value={indicator.stdDev || 2}
                onChange={(e) => handleStdDevChange(indicator.id, parseFloat(e.target.value) || 2)}
                className="h-7 text-xs"
                min={0.5}
                step={0.5}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs text-muted-foreground">Period</label>
            <Input
              type="number"
              value={indicator.period}
              onChange={(e) => handlePeriodChange(indicator.id, parseInt(e.target.value) || indicator.period)}
              className="h-7 text-xs w-20"
              min={1}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition rounded-t-2xl"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-semibold">Technical Indicators</span>
          {enabledCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {enabledCount} active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Color Legend */}
          {enabledCount > 0 && (
            <div className="flex flex-wrap gap-3 p-3 rounded-xl bg-muted/30">
              {indicators.filter(i => i.enabled).map(ind => (
                <div key={ind.id} className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: ind.color }}
                  />
                  <span className="text-xs font-medium">
                    {ind.type} {ind.type !== 'MACD' && ind.type !== 'BOLLINGER' && ind.period}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Indicator Groups */}
          {Object.entries(groupedIndicators).map(([type, inds]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                {INDICATOR_INFO[type]?.name || type}
                <span className="text-xs font-normal">
                  {INDICATOR_INFO[type]?.description}
                </span>
              </h4>
              
              <div className="space-y-1">
                {inds.map(indicator => (
                  <div 
                    key={indicator.id}
                    className={`rounded-xl border p-3 transition ${
                      indicator.enabled 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <Checkbox
                          checked={indicator.enabled}
                          onChange={() => handleToggleIndicator(indicator.id)}
                        />
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: indicator.color }}
                          />
                          <span className="text-sm font-medium">
                            {indicator.type === 'MACD' || indicator.type === 'BOLLINGER' 
                              ? indicator.type 
                              : `${indicator.type} ${indicator.period}`
                            }
                          </span>
                        </div>
                      </label>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(editingId === indicator.id ? null : indicator.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Settings2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {renderIndicatorSettings(indicator)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
