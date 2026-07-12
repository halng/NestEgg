"use client"

import { useState } from "react"
import { DollarSign, Clock, CheckCircle } from "lucide-react"
import type { Dividend, DividendCalendarEntry } from "@/lib/paper-trading/mock-dividends"
import { formatCurrency, formatDate } from "@/lib/paper-trading/formatters"

interface DividendCalendarProps {
  upcomingDividends: Dividend[]
  receivedDividends: Dividend[]
  calendar: DividendCalendarEntry[]
}

export function DividendCalendar({ 
  upcomingDividends, 
  receivedDividends,
  calendar 
}: DividendCalendarProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'calendar'>('upcoming')

  const totalUpcoming = upcomingDividends.reduce((sum, d) => sum + d.totalAmount, 0)
  const totalReceived = receivedDividends.reduce((sum, d) => sum + d.totalAmount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dividends</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Upcoming</span>
          </div>
          <p className="text-lg font-bold text-success">{formatCurrency(totalUpcoming)}</p>
          <p className="text-xs text-muted-foreground">{upcomingDividends.length} payments</p>
        </div>
        <div className="rounded-xl border border-border bg-background/60 p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Received</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(totalReceived)}</p>
          <p className="text-xs text-muted-foreground">{receivedDividends.length} payments</p>
        </div>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1">
        {(['upcoming', 'history', 'calendar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {activeTab === 'upcoming' && (
          upcomingDividends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming dividends from your holdings
            </p>
          ) : (
            upcomingDividends.map(div => (
              <DividendCard key={div.id} dividend={div} />
            ))
          )
        )}

        {activeTab === 'history' && (
          receivedDividends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No dividend history yet
            </p>
          ) : (
            receivedDividends.map(div => (
              <DividendCard key={div.id} dividend={div} />
            ))
          )
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-2">
            {calendar.map(entry => (
              <div 
                key={entry.ticker}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{entry.ticker}</p>
                    <p className="text-xs text-muted-foreground">{entry.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">{formatCurrency(entry.amountPerShare)}/share</p>
                    <p className="text-xs text-success">{entry.yield.toFixed(1)}% yield</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>Ex-Date: {formatDate(entry.exDate)}</span>
                  <span>Pay Date: {formatDate(entry.payDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DividendCard({ dividend }: { dividend: Dividend }) {
  const isPaid = dividend.status === 'paid'
  
  return (
    <div className={`rounded-lg border p-3 ${
      isPaid ? 'border-border bg-background/60' : 'border-success/30 bg-success/5'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPaid ? (
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Clock className="h-4 w-4 text-success" />
          )}
          <span className="font-semibold">{dividend.ticker}</span>
          <span className="text-xs text-muted-foreground">
            {dividend.shares} shares
          </span>
        </div>
        <span className={`font-mono font-semibold ${isPaid ? '' : 'text-success'}`}>
          +{formatCurrency(dividend.totalAmount)}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(dividend.amountPerShare)}/share</span>
        <span>{isPaid ? 'Paid' : 'Pay date'}: {formatDate(dividend.payDate)}</span>
      </div>
    </div>
  )
}
