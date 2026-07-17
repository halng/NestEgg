"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, Flame, Clock, History } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { CompetitionCard } from "@/components/paper-trading/CompetitionCard"
import { CompetitionDetails } from "@/components/paper-trading/CompetitionDetails"
import { 
  mockCompetitions, 
  getActiveCompetitions, 
  getUpcomingCompetitions, 
  getEndedCompetitions 
} from "@/lib/paper-trading/mock-social"
import type { Competition, CompetitionStatus } from "@/lib/paper-trading/types"

type FilterStatus = "all" | CompetitionStatus

const FILTER_OPTIONS: { value: FilterStatus; label: string; icon: typeof Trophy }[] = [
  { value: "all", label: "All", icon: Trophy },
  { value: "active", label: "Active", icon: Flame },
  { value: "upcoming", label: "Upcoming", icon: Clock },
  { value: "ended", label: "Ended", icon: History },
]

export default function CompetitionsPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view competitions" fallbackDescription="Competitions require authentication.">
      <CompetitionsContent />
    </RequireAuth>
  )
}

function CompetitionsContent() {
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions)
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)

  const filteredCompetitions = filter === "all" 
    ? competitions 
    : competitions.filter(c => c.status === filter)

  const activeCount = getActiveCompetitions().length
  const upcomingCount = getUpcomingCompetitions().length
  const joinedCount = competitions.filter(c => c.isJoined).length

  const handleJoin = (id: string) => {
    setCompetitions(prev => prev.map(c => 
      c.id === id 
        ? { ...c, isJoined: true, participants: c.participants + 1 } 
        : c
    ))
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(prev => prev ? { ...prev, isJoined: true, participants: prev.participants + 1 } : null)
    }
  }

  const handleLeave = (id: string) => {
    setCompetitions(prev => prev.map(c => 
      c.id === id 
        ? { ...c, isJoined: false, participants: c.participants - 1 } 
        : c
    ))
    if (selectedCompetition?.id === id) {
      setSelectedCompetition(prev => prev ? { ...prev, isJoined: false, participants: prev.participants - 1 } : null)
    }
  }

  const handleViewDetails = (competition: Competition) => {
    setSelectedCompetition(competition)
  }

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
                Trading Competitions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Compete for prizes and glory
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <Flame className="mx-auto h-5 w-5 text-success" />
            <p className="mt-2 text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-2xl font-bold">{upcomingCount}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <Trophy className="mx-auto h-5 w-5 text-yellow-500" />
            <p className="mt-2 text-2xl font-bold">{joinedCount}</p>
            <p className="text-xs text-muted-foreground">Joined</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(option => {
            const Icon = option.icon
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === option.value
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

        {/* Competitions List */}
        {filteredCompetitions.length === 0 ? (
          <div className="rounded-2xl bg-background/60 p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No competitions found</p>
            <p className="text-sm text-muted-foreground/70">
              Check back later for new competitions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompetitions.map(competition => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        <section className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
          <h3 className="font-semibold text-primary mb-2">Competition Rules</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Each competition starts with a fresh $100,000 virtual portfolio</li>
            <li>Rankings are based on Return on Investment (ROI)</li>
            <li>You can join multiple competitions simultaneously</li>
            <li>Prizes are awarded after competition ends and results are verified</li>
          </ul>
        </section>
      </div>

      {/* Competition Details Modal */}
      {selectedCompetition && (
        <CompetitionDetails
          competition={selectedCompetition}
          onClose={() => setSelectedCompetition(null)}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />
      )}
    </main>
  )
}
