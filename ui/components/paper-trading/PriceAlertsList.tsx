"use client"

import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { PriceAlert, PaperTradingMarketTicker } from "@/lib/paper-trading/types"
import { formatCurrency, formatRelativeTime } from "@/lib/paper-trading/formatters"

interface PriceAlertsListProps {
  alerts: PriceAlert[]
  marketWatch: PaperTradingMarketTicker[]
  onDelete: (alertId: string) => void
  onToggle: (alertId: string) => void
}

const conditionIcons = {
  ABOVE: TrendingUp,
  BELOW: TrendingDown,
  CROSS: ArrowLeftRight,
}

const conditionLabels = {
  ABOVE: 'rises above',
  BELOW: 'falls below',
  CROSS: 'crosses',
}

export function PriceAlertsList({ alerts, marketWatch, onDelete, onToggle }: PriceAlertsListProps) {
  const activeAlerts = alerts.filter(a => a.isActive)
  const triggeredAlerts = alerts.filter(a => !a.isActive)

  const getStock = (ticker: string) => marketWatch.find(s => s.ticker === ticker)

  const AlertCard = ({ alert }: { alert: PriceAlert }) => {
    const stock = getStock(alert.ticker)
    const Icon = conditionIcons[alert.condition]
    const currentPrice = stock?.price || 0
    const distancePercent = currentPrice ? ((alert.targetPrice - currentPrice) / currentPrice * 100) : 0
    
    const wouldTrigger = alert.isActive && (
      (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) ||
      (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice)
    )

    return (
      <div className={`rounded-xl border p-4 transition ${
        wouldTrigger 
          ? 'border-primary bg-primary/10 animate-pulse' 
          : alert.isActive 
            ? 'border-border bg-card' 
            : 'border-border/50 bg-muted/30'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${alert.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
              {alert.isActive ? (
                <Bell className={`h-5 w-5 ${wouldTrigger ? 'text-primary' : 'text-muted-foreground'}`} />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-bold">{alert.ticker}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {conditionLabels[alert.condition]} {formatCurrency(alert.targetPrice)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(alert.id)}
              title={alert.isActive ? 'Disable alert' : 'Enable alert'}
            >
              {alert.isActive ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(alert.id)}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {stock && alert.isActive && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Current: </span>
              <span className="font-mono">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Distance: </span>
              <span className={`font-mono ${distancePercent > 0 ? 'text-success' : 'text-danger'}`}>
                {distancePercent > 0 ? '+' : ''}{distancePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {!alert.isActive && alert.triggeredAt && (
          <div className="mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
            Triggered {formatRelativeTime(alert.triggeredAt)}
          </div>
        )}

        <p className="mt-2 text-xs text-muted-foreground">
          Created {formatRelativeTime(alert.createdAt)}
        </p>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl bg-background/60 p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No price alerts</p>
        <p className="text-sm text-muted-foreground/70">
          Create an alert to get notified when a stock hits your target price
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Active Alerts ({activeAlerts.length})
          </h3>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Triggered ({triggeredAlerts.length})
          </h3>
          <div className="space-y-3">
            {triggeredAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
