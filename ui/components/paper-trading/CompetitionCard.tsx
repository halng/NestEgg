"use client"

import { Calendar, Users, Trophy, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import type { Competition } from "@/lib/paper-trading/types"
import { formatDate } from "@/lib/paper-trading/formatters"

interface CompetitionCardProps {
  competition: Competition
  onJoin: (id: string) => void
  onLeave: (id: string) => void
  onViewDetails: (competition: Competition) => void
}

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const, icon: CheckCircle },
  upcoming: { label: "Upcoming", variant: "default" as const, icon: Clock },
  ended: { label: "Ended", variant: "secondary" as const, icon: Calendar },
}

export function CompetitionCard({ competition, onJoin, onLeave, onViewDetails }: CompetitionCardProps) {
  const statusConfig = STATUS_CONFIG[competition.status]
  const StatusIcon = statusConfig.icon

  const participantText = competition.maxParticipants
    ? `${competition.participants.toLocaleString()} / ${competition.maxParticipants.toLocaleString()}`
    : competition.participants.toLocaleString()

  const isFull = competition.maxParticipants 
    ? competition.participants >= competition.maxParticipants 
    : false

  return (
    <div 
      className={`rounded-2xl border bg-card p-4 transition hover:border-primary/30 ${
        competition.isJoined ? "border-primary/50" : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{competition.name}</h3>
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
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {competition.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatDate(competition.startDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {formatDate(competition.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{participantText}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="font-semibold text-yellow-500">{competition.prizePool}</span>
        </div>
      </div>

      {/* Prizes Preview */}
      <div className="mt-4 flex flex-wrap gap-2">
        {competition.prizes.slice(0, 3).map((prize, idx) => (
          <span 
            key={prize.position} 
            className={`text-xs px-2 py-1 rounded-full ${
              idx === 0 ? "bg-yellow-500/10 text-yellow-500" :
              idx === 1 ? "bg-slate-400/10 text-slate-400" :
              "bg-amber-600/10 text-amber-600"
            }`}
          >
            #{prize.position}: {prize.prize.split(" ")[0]}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(competition)}
        >
          View Details
        </Button>
        
        {competition.status === "active" && !competition.isJoined && !isFull && (
          <Button 
            size="sm" 
            onClick={() => onJoin(competition.id)}
          >
            Join Competition
          </Button>
        )}
        
        {competition.status === "upcoming" && !competition.isJoined && !isFull && (
          <Button 
            size="sm" 
            onClick={() => onJoin(competition.id)}
          >
            Register Now
          </Button>
        )}
        
        {competition.isJoined && competition.status !== "ended" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onLeave(competition.id)}
            className="text-danger hover:bg-danger/10"
          >
            Leave
          </Button>
        )}

        {isFull && !competition.isJoined && (
          <span className="text-xs text-muted-foreground self-center">Competition full</span>
        )}
      </div>
    </div>
  )
}
