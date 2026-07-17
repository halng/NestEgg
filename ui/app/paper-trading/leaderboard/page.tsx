"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, Calendar, Clock, Infinity } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { LeaderboardTable } from "@/components/paper-trading/LeaderboardTable"
import { getLeaderboardByPeriod } from "@/lib/paper-trading/mock-social"
import type { LeaderboardPeriod } from "@/lib/paper-trading/types"

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string; icon: typeof Calendar }[] = [
  { value: "week", label: "This Week", icon: Calendar },
  { value: "month", label: "This Month", icon: Clock },
  { value: "all-time", label: "All Time", icon: Infinity },
]

export default function LeaderboardPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view leaderboard" fallbackDescription="Leaderboard requires authentication.">
      <LeaderboardContent />
    </RequireAuth>
  )
}

function LeaderboardContent() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week")
  const entries = getLeaderboardByPeriod(period)
  const currentUserEntry = entries.find(e => e.isCurrentUser)

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
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
                <Trophy className="h-6 w-6 text-yellow-500" />
                Leaderboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compete with other paper traders
              </p>
            </div>
          </div>
        </div>

        {/* Current User Stats */}
        {currentUserEntry && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Current Rank</p>
                <p className="text-3xl font-bold text-primary">#{currentUserEntry.rank}</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className={`text-lg font-semibold ${currentUserEntry.roi >= 0 ? "text-success" : "text-danger"}`}>
                    {currentUserEntry.roi >= 0 ? "+" : ""}{currentUserEntry.roi.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Trades</p>
                  <p className="text-lg font-semibold">{currentUserEntry.trades}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Period Filter */}
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  period === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            )
          })}
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable entries={entries} />

        {/* Info Section */}
        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-semibold mb-2">How Rankings Work</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Rankings are based on Return on Investment (ROI) percentage</li>
            <li>All traders start with a $100,000 virtual portfolio</li>
            <li>Leaderboards update hourly during market hours</li>
            <li>Join competitions to compete for special prizes!</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
