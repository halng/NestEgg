"use client"

import { Trophy, Medal, Award, User } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/paper-trading/types"
import { formatCurrency, formatPercent } from "@/lib/paper-trading/formatters"

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  showRankChange?: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
        <Trophy className="h-4 w-4 text-yellow-500" />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/20">
        <Medal className="h-4 w-4 text-slate-400" />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/20">
        <Award className="h-4 w-4 text-amber-600" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center text-sm font-medium text-muted-foreground">
      {rank}
    </div>
  )
}

function UserAvatar({ username, avatar }: { username: string; avatar?: string }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className="h-8 w-8 rounded-full bg-muted"
      />
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <User className="h-4 w-4" />
    </div>
  )
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">No leaderboard data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/30 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4 sm:col-span-3">Trader</div>
        <div className="col-span-3 sm:col-span-3 text-right">ROI</div>
        <div className="col-span-4 sm:col-span-3 text-right hidden sm:block">Portfolio</div>
        <div className="col-span-4 sm:col-span-2 text-right">Trades</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.username}`}
            className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition ${
              entry.isCurrentUser
                ? "bg-primary/10 border-l-2 border-l-primary"
                : "hover:bg-muted/30"
            } ${entry.rank <= 3 ? "font-medium" : ""}`}
          >
            {/* Rank */}
            <div className="col-span-1">
              <RankBadge rank={entry.rank} />
            </div>

            {/* User */}
            <div className="col-span-4 sm:col-span-3 flex items-center gap-2 min-w-0">
              <UserAvatar username={entry.username} avatar={entry.avatar} />
              <span className={`truncate ${entry.isCurrentUser ? "text-primary font-semibold" : ""}`}>
                {entry.username}
                {entry.isCurrentUser && <span className="text-xs ml-1">(You)</span>}
              </span>
            </div>

            {/* ROI */}
            <div className="col-span-3 sm:col-span-3 text-right">
              <span className={entry.roi >= 0 ? "text-success" : "text-danger"}>
                {formatPercent(entry.roi)}
              </span>
            </div>

            {/* Portfolio Value */}
            <div className="col-span-4 sm:col-span-3 text-right hidden sm:block text-muted-foreground">
              {formatCurrency(entry.portfolioValue)}
            </div>

            {/* Trades */}
            <div className="col-span-4 sm:col-span-2 text-right text-muted-foreground">
              {entry.trades}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
