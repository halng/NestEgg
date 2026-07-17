"use client"

import { useState } from "react"
import { ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { PriceAlertForm } from "@/components/paper-trading/PriceAlertForm"
import { PriceAlertsList } from "@/components/paper-trading/PriceAlertsList"
import { mockPriceAlerts, generateAlertId } from "@/lib/paper-trading/mock-alerts"
import { mockMarketWatch } from "@/lib/paper-trading/mock-data"
import type { PriceAlert, AlertCondition } from "@/lib/paper-trading/types"

export default function AlertsPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to manage alerts" fallbackDescription="Price alerts require authentication.">
      <AlertsContent />
    </RequireAuth>
  )
}

function AlertsContent() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockPriceAlerts)

  const handleCreateAlert = (newAlert: { ticker: string; condition: AlertCondition; targetPrice: number }) => {
    const alert: PriceAlert = {
      id: generateAlertId(),
      ...newAlert,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    setAlerts(prev => [alert, ...prev])
  }

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handleToggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isActive: !a.isActive } : a
    ))
  }

  const activeCount = alerts.filter(a => a.isActive).length

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/paper-trading">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Price Alerts
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeCount} active alert{activeCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <section>
          <PriceAlertForm
            marketWatch={mockMarketWatch}
            onCreateAlert={handleCreateAlert}
          />
        </section>

        <section className="rounded-3xl border border-border bg-card/70 p-4">
          <PriceAlertsList
            alerts={alerts}
            marketWatch={mockMarketWatch}
            onDelete={handleDeleteAlert}
            onToggle={handleToggleAlert}
          />
        </section>

        <section className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Price alerts are simulated in paper trading mode. 
            In a live environment, you would receive push notifications when your target prices are reached.
          </p>
        </section>
      </div>
    </main>
  )
}
