import type { PortfolioSnapshot, PerformanceMetrics, SectorAllocation } from "./types"
import { SECTOR_COLORS } from "./constants"

export function generatePortfolioHistory(days: number): PortfolioSnapshot[] {
  const history: PortfolioSnapshot[] = []
  let value = 100_000_000
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const dailyChange = (Math.random() - 0.48) * value * 0.015
    value = Math.max(value + dailyChange, value * 0.7)

    const cashRatio = 0.25 + Math.random() * 0.15

    history.push({
      date: date.toISOString().split("T")[0],
      portfolioValue: Math.round(value),
      cashBalance: Math.round(value * cashRatio),
      holdingsValue: Math.round(value * (1 - cashRatio)),
      dailyPnl: Math.round(dailyChange),
    })
  }
  return history
}

export const mockPortfolioHistory = {
  "1D": generatePortfolioHistory(1),
  "1W": generatePortfolioHistory(7),
  "1M": generatePortfolioHistory(30),
  "3M": generatePortfolioHistory(90),
  "6M": generatePortfolioHistory(180),
  "1Y": generatePortfolioHistory(365),
  ALL: generatePortfolioHistory(365),
}

export const mockPerformanceMetrics: PerformanceMetrics = {
  totalReturn: 930_000,
  totalReturnPercent: 0.93,
  dailyReturn: 0.12,
  weeklyReturn: 0.85,
  monthlyReturn: 2.1,
  maxDrawdown: -5.2,
  volatility: 12.5,
  sharpeRatio: 1.15,
  totalTrades: 12,
  winningTrades: 8,
  losingTrades: 4,
  winRate: 66.67,
  avgWinAmount: 425_000,
  avgLossAmount: 180_000,
  profitFactor: 2.36,
}

export function calculateSectorAllocation(
  holdings: { sector: string | null; marketValue: number }[]
): SectorAllocation[] {
  const sectorMap = new Map<string, number>()
  let total = 0

  holdings.forEach((h) => {
    const sector = h.sector || "Other"
    sectorMap.set(sector, (sectorMap.get(sector) || 0) + h.marketValue)
    total += h.marketValue
  })

  return Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value,
      percent: total > 0 ? (value / total) * 100 : 0,
      color: SECTOR_COLORS[sector as keyof typeof SECTOR_COLORS] || SECTOR_COLORS.Other,
    }))
    .sort((a, b) => b.value - a.value)
}

export const mockSectorAllocation: SectorAllocation[] = [
  { sector: "Technology", value: 22_500_000, percent: 48.4, color: SECTOR_COLORS.Technology },
  { sector: "Banking", value: 24_030_000, percent: 51.6, color: SECTOR_COLORS.Banking },
]
