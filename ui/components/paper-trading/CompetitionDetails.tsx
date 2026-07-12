"use client"

import { X, Calendar, Users, Trophy, Clock, Gift, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { LeaderboardTable } from "./LeaderboardTable"
import type { Competition } from "@/lib/paper-trading/types"
import { formatDate, formatDateTime } from "@/lib/paper-trading/formatters"

interface CompetitionDetailsProps {
  competition: Competition
  onClose: () => void
  onJoin: (id: string) => void
  onLeave: (id: string) => void
}

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const, icon: CheckCircle },
  upcoming: { label: "Upcoming", variant: "default" as const, icon: Clock },
  ended: { label: "Ended", variant: "secondary" as const, icon: Calendar },
}

export function CompetitionDetails({ competition, onClose, onJoin, onLeave }: CompetitionDetailsProps) {
  const statusConfig = STATUS_CONFIG[competition.status]
  const StatusIcon = statusConfig.icon

  const participantText = competition.maxParticipants
    ? `${competition.participants.toLocaleString()} / ${competition.maxParticipants.toLocaleString()}`
    : competition.participants.toLocaleString()

  const isFull = competition.maxParticipants 
    ? competition.participants >= competition.maxParticipants 
    : false

  const now = new Date()
  const startDate = new Date(competition.startDate)
  const endDate = new Date(competition.endDate)
  
  const getTimeRemaining = () => {
    if (competition.status === "ended") return "Ended"
    const target = competition.status === "upcoming" ? startDate : endDate
    const diff = target.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h ${competition.status === "upcoming" ? "until start" : "remaining"}`
    return `${hours}h ${competition.status === "upcoming" ? "until start" : "remaining"}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card p-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{competition.name}</h2>
              <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              {competition.isJoined && (
                <Badge variant="outline" className="text-primary border-primary">
                  Joined
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{getTimeRemaining()}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-muted-foreground">{competition.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">Start Date</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{formatDateTime(competition.startDate)}</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">End Date</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{formatDateTime(competition.endDate)}</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Participants</span>
              </div>
              <p className="mt-1 text-sm font-semibold">{participantText}</p>
            </div>
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <div className="flex items-center gap-2 text-yellow-500">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium">Prize Pool</span>
              </div>
              <p className="mt-1 text-sm font-bold text-yellow-500">{competition.prizePool}</p>
            </div>
          </div>

          {/* Prizes */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Prizes
            </h3>
            <div className="space-y-2">
              {competition.prizes.map((prize, idx) => (
                <div 
                  key={prize.position}
                  className={`flex items-center justify-between rounded-xl p-3 ${
                    idx === 0 ? "bg-yellow-500/10 border border-yellow-500/30" :
                    idx === 1 ? "bg-slate-400/10 border border-slate-400/30" :
                    idx === 2 ? "bg-amber-600/10 border border-amber-600/30" :
                    "bg-muted/30"
                  }`}
                >
                  <span className={`font-semibold ${
                    idx === 0 ? "text-yellow-500" :
                    idx === 1 ? "text-slate-400" :
                    idx === 2 ? "text-amber-600" :
                    ""
                  }`}>
                    #{prize.position}
                  </span>
                  <span className="text-sm">{prize.prize}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Competition Leaderboard */}
          {competition.leaderboard && competition.leaderboard.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Competition Standings
              </h3>
              <LeaderboardTable entries={competition.leaderboard} />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap pt-2">
            {competition.status === "active" && !competition.isJoined && !isFull && (
              <Button onClick={() => onJoin(competition.id)}>
                Join Competition
              </Button>
            )}
            
            {competition.status === "upcoming" && !competition.isJoined && !isFull && (
              <Button onClick={() => onJoin(competition.id)}>
                Register Now
              </Button>
            )}
            
            {competition.isJoined && competition.status !== "ended" && (
              <Button 
                variant="outline"
                onClick={() => onLeave(competition.id)}
                className="text-danger hover:bg-danger/10"
              >
                Leave Competition
              </Button>
            )}

            {isFull && !competition.isJoined && (
              <p className="text-sm text-muted-foreground self-center">
                This competition is full
              </p>
            )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
