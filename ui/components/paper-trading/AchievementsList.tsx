"use client"

import { useState, useMemo } from "react"
import { Award, TrendingUp, BookOpen, Users } from "lucide-react"
import { AchievementBadge } from "./AchievementBadge"
import type { Achievement, AchievementCategory } from "@/lib/paper-trading/types"
import { 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  getAchievementProgress 
} from "@/lib/paper-trading/mock-achievements"

interface AchievementsListProps {
  achievements: Achievement[]
  showProgress?: boolean
}

type FilterCategory = "all" | AchievementCategory

const CATEGORY_OPTIONS: { value: FilterCategory; label: string; icon: typeof Award }[] = [
  { value: "all", label: "All", icon: Award },
  { value: "trading", label: "Trading", icon: TrendingUp },
  { value: "learning", label: "Learning", icon: BookOpen },
  { value: "social", label: "Social", icon: Users },
]

export function AchievementsList({ achievements, showProgress = true }: AchievementsListProps) {
  const [filter, setFilter] = useState<FilterCategory>("all")

  const filteredAchievements = useMemo(() => {
    if (filter === "all") return achievements
    return achievements.filter(a => a.category === filter)
  }, [achievements, filter])

  const progress = getAchievementProgress()
  
  const unlockedByCategory = useMemo(() => {
    const categories: AchievementCategory[] = ["trading", "learning", "social"]
    return categories.reduce((acc, cat) => {
      const total = achievements.filter(a => a.category === cat).length
      const unlocked = achievements.filter(a => a.category === cat && a.status === "unlocked").length
      acc[cat] = { unlocked, total }
      return acc
    }, {} as Record<AchievementCategory, { unlocked: number; total: number }>)
  }, [achievements])

  const sortedAchievements = useMemo(() => {
    return [...filteredAchievements].sort((a, b) => {
      const statusOrder = { unlocked: 0, "in-progress": 1, locked: 2 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
  }, [filteredAchievements])

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {showProgress && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievement Progress
            </h3>
            <span className="text-sm font-medium text-primary">
              {progress.unlocked}/{progress.total} ({progress.percentage}%)
            </span>
          </div>

          {/* Overall Progress Bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
            <div 
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-3 gap-2">
            {(["trading", "learning", "social"] as AchievementCategory[]).map(category => {
              const { unlocked, total } = unlockedByCategory[category]
              const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0
              return (
                <div key={category} className="text-center">
                  <p className={`text-xs font-medium ${CATEGORY_COLORS[category]}`}>
                    {CATEGORY_LABELS[category]}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {unlocked}/{total}
                  </p>
                  <div className="h-1 rounded-full bg-muted overflow-hidden mt-1">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        category === "trading" ? "bg-emerald-500" :
                        category === "learning" ? "bg-blue-500" :
                        "bg-purple-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_OPTIONS.map(option => {
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

      {/* Achievements Grid */}
      {sortedAchievements.length === 0 ? (
        <div className="rounded-2xl bg-background/60 p-8 text-center">
          <Award className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No achievements found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedAchievements.map(achievement => (
            <AchievementBadge 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
