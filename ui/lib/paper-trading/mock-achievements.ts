import type { Achievement, AchievementCategory } from "./types"

export const ACHIEVEMENT_ICONS: Record<string, string> = {
  firstTrade: "Rocket",
  diversifier: "PieChart",
  profitMaster: "TrendingUp",
  riskManager: "Shield",
  dayTrader: "Zap",
  longTermInvestor: "Clock",
  journalKeeper: "BookOpen",
  quizMaster: "GraduationCap",
  socialButterfly: "Share2",
  topTen: "Trophy",
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  trading: "Trading",
  learning: "Learning",
  social: "Social",
}

export const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  trading: "text-emerald-500",
  learning: "text-blue-500",
  social: "text-purple-500",
}

export const CATEGORY_BG_COLORS: Record<AchievementCategory, string> = {
  trading: "bg-emerald-500/10",
  learning: "bg-blue-500/10",
  social: "bg-purple-500/10",
}

export const mockAchievements: Achievement[] = [
  {
    id: "first-trade",
    name: "First Trade",
    description: "Complete your first order",
    icon: "Rocket",
    category: "trading",
    status: "unlocked",
    unlockedAt: "2026-06-15T10:30:00Z",
  },
  {
    id: "diversifier",
    name: "Diversifier",
    description: "Hold 5+ different stocks in your portfolio",
    icon: "PieChart",
    category: "trading",
    status: "unlocked",
    unlockedAt: "2026-06-20T14:22:00Z",
  },
  {
    id: "profit-master",
    name: "Profit Master",
    description: "Achieve 10% portfolio gain",
    icon: "TrendingUp",
    category: "trading",
    status: "in-progress",
    progress: 7.2,
    maxProgress: 10,
  },
  {
    id: "risk-manager",
    name: "Risk Manager",
    description: "Use stop-loss orders 10 times",
    icon: "Shield",
    category: "trading",
    status: "in-progress",
    progress: 6,
    maxProgress: 10,
  },
  {
    id: "day-trader",
    name: "Day Trader",
    description: "Execute 10 trades in a single day",
    icon: "Zap",
    category: "trading",
    status: "locked",
  },
  {
    id: "long-term-investor",
    name: "Long Term Investor",
    description: "Hold a stock for 30+ days",
    icon: "Clock",
    category: "trading",
    status: "in-progress",
    progress: 18,
    maxProgress: 30,
  },
  {
    id: "journal-keeper",
    name: "Journal Keeper",
    description: "Write 10 journal entries",
    icon: "BookOpen",
    category: "learning",
    status: "in-progress",
    progress: 4,
    maxProgress: 10,
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Complete the risk assessment quiz",
    icon: "GraduationCap",
    category: "learning",
    status: "unlocked",
    unlockedAt: "2026-06-10T09:15:00Z",
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Share a trade with the community",
    icon: "Share2",
    category: "social",
    status: "locked",
  },
  {
    id: "top-ten",
    name: "Top 10",
    description: "Reach the leaderboard top 10",
    icon: "Trophy",
    category: "social",
    status: "unlocked",
    unlockedAt: "2026-07-08T16:45:00Z",
  },
]

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return mockAchievements.filter(a => a.category === category)
}

export function getUnlockedAchievements(): Achievement[] {
  return mockAchievements.filter(a => a.status === "unlocked")
}

export function getLockedAchievements(): Achievement[] {
  return mockAchievements.filter(a => a.status === "locked")
}

export function getInProgressAchievements(): Achievement[] {
  return mockAchievements.filter(a => a.status === "in-progress")
}

export function getAchievementProgress(): { unlocked: number; total: number; percentage: number } {
  const unlocked = mockAchievements.filter(a => a.status === "unlocked").length
  const total = mockAchievements.length
  return {
    unlocked,
    total,
    percentage: Math.round((unlocked / total) * 100),
  }
}
