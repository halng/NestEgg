"use client"

import { 
  Rocket, 
  PieChart, 
  TrendingUp, 
  Shield, 
  Zap, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Share2, 
  Trophy,
  Lock,
  LucideIcon
} from "lucide-react"
import type { Achievement } from "@/lib/paper-trading/types"
import { 
  CATEGORY_COLORS, 
  CATEGORY_BG_COLORS,
  CATEGORY_LABELS 
} from "@/lib/paper-trading/mock-achievements"
import { formatRelativeTime } from "@/lib/paper-trading/formatters"

const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  PieChart,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  BookOpen,
  GraduationCap,
  Share2,
  Trophy,
}

interface AchievementBadgeProps {
  achievement: Achievement
  size?: "sm" | "md" | "lg"
  showDetails?: boolean
}

export function AchievementBadge({ 
  achievement, 
  size = "md",
  showDetails = true 
}: AchievementBadgeProps) {
  const Icon = ICON_MAP[achievement.icon] || Trophy
  const categoryColor = CATEGORY_COLORS[achievement.category]
  const categoryBgColor = CATEGORY_BG_COLORS[achievement.category]
  const isUnlocked = achievement.status === "unlocked"
  const isInProgress = achievement.status === "in-progress"
  const isLocked = achievement.status === "locked"

  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  }

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const progressPercent = achievement.maxProgress && achievement.progress
    ? Math.round((achievement.progress / achievement.maxProgress) * 100)
    : 0

  return (
    <div 
      className={`rounded-2xl border transition ${
        isUnlocked 
          ? `border-primary/30 ${categoryBgColor}` 
          : isInProgress
            ? "border-border bg-card"
            : "border-border bg-muted/30 opacity-60"
      } ${sizeClasses[size]}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 rounded-xl p-2 ${
          isUnlocked 
            ? categoryBgColor 
            : isInProgress
              ? "bg-muted"
              : "bg-muted/50"
        }`}>
          {isLocked ? (
            <Lock className={`${iconSizes[size]} text-muted-foreground`} />
          ) : (
            <Icon className={`${iconSizes[size]} ${isUnlocked ? categoryColor : "text-muted-foreground"}`} />
          )}
        </div>

        {/* Content */}
        {showDetails && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-semibold truncate ${isLocked ? "text-muted-foreground" : ""}`}>
                {achievement.name}
              </h4>
              {isUnlocked && (
                <span className={`text-xs font-medium ${categoryColor}`}>
                  {CATEGORY_LABELS[achievement.category]}
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${isLocked ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
              {achievement.description}
            </p>

            {/* Progress Bar */}
            {isInProgress && achievement.maxProgress && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={categoryColor}>
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      achievement.category === "trading" ? "bg-emerald-500" :
                      achievement.category === "learning" ? "bg-blue-500" :
                      "bg-purple-500"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Unlocked Date */}
            {isUnlocked && achievement.unlockedAt && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Unlocked {formatRelativeTime(achievement.unlockedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
