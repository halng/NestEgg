import type { LeaderboardEntry, Competition, LeaderboardPeriod } from "./types"

export const mockLeaderboardData: Record<LeaderboardPeriod, LeaderboardEntry[]> = {
  week: [
    { rank: 1, username: "TradeMaster99", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TradeMaster99", roi: 15.8, portfolioValue: 115800, trades: 42 },
    { rank: 2, username: "BullRunner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BullRunner", roi: 12.3, portfolioValue: 112300, trades: 35 },
    { rank: 3, username: "StockSavvy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StockSavvy", roi: 10.5, portfolioValue: 110500, trades: 28 },
    { rank: 4, username: "You", roi: 8.7, portfolioValue: 108700, trades: 19, isCurrentUser: true },
    { rank: 5, username: "MarketMaven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarketMaven", roi: 7.2, portfolioValue: 107200, trades: 23 },
    { rank: 6, username: "TechTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechTrader", roi: 6.8, portfolioValue: 106800, trades: 31 },
    { rank: 7, username: "ValueHunter", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ValueHunter", roi: 5.4, portfolioValue: 105400, trades: 15 },
    { rank: 8, username: "SwingKing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SwingKing", roi: 4.9, portfolioValue: 104900, trades: 47 },
    { rank: 9, username: "DividendDiva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DividendDiva", roi: 4.1, portfolioValue: 104100, trades: 8 },
    { rank: 10, username: "GrowthGuru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GrowthGuru", roi: 3.5, portfolioValue: 103500, trades: 21 },
  ],
  month: [
    { rank: 1, username: "BullRunner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BullRunner", roi: 28.5, portfolioValue: 128500, trades: 156 },
    { rank: 2, username: "TradeMaster99", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TradeMaster99", roi: 24.2, portfolioValue: 124200, trades: 189 },
    { rank: 3, username: "MarketMaven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarketMaven", roi: 21.7, portfolioValue: 121700, trades: 98 },
    { rank: 4, username: "StockSavvy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StockSavvy", roi: 19.3, portfolioValue: 119300, trades: 112 },
    { rank: 5, username: "TechTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechTrader", roi: 16.8, portfolioValue: 116800, trades: 145 },
    { rank: 6, username: "You", roi: 14.2, portfolioValue: 114200, trades: 67, isCurrentUser: true },
    { rank: 7, username: "SwingKing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SwingKing", roi: 12.5, portfolioValue: 112500, trades: 203 },
    { rank: 8, username: "ValueHunter", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ValueHunter", roi: 10.9, portfolioValue: 110900, trades: 45 },
    { rank: 9, username: "GrowthGuru", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=GrowthGuru", roi: 8.6, portfolioValue: 108600, trades: 89 },
    { rank: 10, username: "DividendDiva", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DividendDiva", roi: 7.4, portfolioValue: 107400, trades: 32 },
  ],
  "all-time": [
    { rank: 1, username: "LegendTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LegendTrader", roi: 156.8, portfolioValue: 256800, trades: 1245 },
    { rank: 2, username: "WallStreetWiz", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=WallStreetWiz", roi: 134.2, portfolioValue: 234200, trades: 987 },
    { rank: 3, username: "BullRunner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BullRunner", roi: 98.5, portfolioValue: 198500, trades: 1567 },
    { rank: 4, username: "TradeMaster99", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TradeMaster99", roi: 87.3, portfolioValue: 187300, trades: 2134 },
    { rank: 5, username: "MarketMaven", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarketMaven", roi: 76.4, portfolioValue: 176400, trades: 756 },
    { rank: 6, username: "StockSavvy", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StockSavvy", roi: 65.2, portfolioValue: 165200, trades: 892 },
    { rank: 7, username: "TechTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechTrader", roi: 54.8, portfolioValue: 154800, trades: 1034 },
    { rank: 8, username: "SwingKing", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SwingKing", roi: 43.6, portfolioValue: 143600, trades: 1876 },
    { rank: 9, username: "ValueHunter", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ValueHunter", roi: 38.9, portfolioValue: 138900, trades: 324 },
    { rank: 10, username: "You", roi: 32.5, portfolioValue: 132500, trades: 287, isCurrentUser: true },
  ],
}

export const mockCompetitions: Competition[] = [
  {
    id: "comp-001",
    name: "Summer Trading Challenge",
    description: "Compete against fellow traders in our summer championship. Start with $100,000 virtual cash and maximize your returns over 4 weeks.",
    status: "active",
    startDate: "2026-07-01T00:00:00Z",
    endDate: "2026-07-31T23:59:59Z",
    participants: 1247,
    maxParticipants: 2000,
    prizePool: "$5,000",
    prizes: [
      { position: 1, prize: "$2,500 + Gold Trophy" },
      { position: 2, prize: "$1,500 + Silver Trophy" },
      { position: 3, prize: "$1,000 + Bronze Trophy" },
    ],
    isJoined: true,
    leaderboard: [
      { rank: 1, username: "SummerBull", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SummerBull", roi: 23.4, portfolioValue: 123400, trades: 89 },
      { rank: 2, username: "HeatWave", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HeatWave", roi: 19.8, portfolioValue: 119800, trades: 67 },
      { rank: 3, username: "BeachTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BeachTrader", roi: 17.2, portfolioValue: 117200, trades: 54 },
      { rank: 4, username: "You", roi: 14.5, portfolioValue: 114500, trades: 42, isCurrentUser: true },
      { rank: 5, username: "SunnyInvestor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SunnyInvestor", roi: 12.1, portfolioValue: 112100, trades: 38 },
    ],
  },
  {
    id: "comp-002",
    name: "Tech Stocks Tournament",
    description: "Focus on technology sector stocks only. Trade FAANG, semiconductors, and emerging tech companies.",
    status: "active",
    startDate: "2026-07-05T00:00:00Z",
    endDate: "2026-08-05T23:59:59Z",
    participants: 856,
    maxParticipants: 1000,
    prizePool: "$3,000",
    prizes: [
      { position: 1, prize: "$1,500 + Tech Badge" },
      { position: 2, prize: "$1,000" },
      { position: 3, prize: "$500" },
    ],
    isJoined: false,
  },
  {
    id: "comp-003",
    name: "August Market Masters",
    description: "Our flagship monthly competition. Trade any asset class and prove your skills across all market conditions.",
    status: "upcoming",
    startDate: "2026-08-01T00:00:00Z",
    endDate: "2026-08-31T23:59:59Z",
    participants: 342,
    maxParticipants: 5000,
    prizePool: "$10,000",
    prizes: [
      { position: 1, prize: "$5,000 + Master Trader Title" },
      { position: 2, prize: "$3,000" },
      { position: 3, prize: "$2,000" },
    ],
    isJoined: false,
  },
  {
    id: "comp-004",
    name: "Dividend Kings Challenge",
    description: "Build the best dividend portfolio. Points based on both capital gains and dividend yield.",
    status: "upcoming",
    startDate: "2026-08-15T00:00:00Z",
    endDate: "2026-09-15T23:59:59Z",
    participants: 128,
    prizePool: "$2,000",
    prizes: [
      { position: 1, prize: "$1,000 + Dividend King Crown" },
      { position: 2, prize: "$600" },
      { position: 3, prize: "$400" },
    ],
    isJoined: false,
  },
  {
    id: "comp-005",
    name: "June Sprint Championship",
    description: "High-frequency trading challenge. Most profitable day trader wins.",
    status: "ended",
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-06-30T23:59:59Z",
    participants: 2341,
    prizePool: "$7,500",
    prizes: [
      { position: 1, prize: "$4,000 + Sprint Champion" },
      { position: 2, prize: "$2,500" },
      { position: 3, prize: "$1,000" },
    ],
    isJoined: true,
    leaderboard: [
      { rank: 1, username: "SpeedDemon", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SpeedDemon", roi: 45.2, portfolioValue: 145200, trades: 567 },
      { rank: 2, username: "FlashTrader", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FlashTrader", roi: 38.7, portfolioValue: 138700, trades: 489 },
      { rank: 3, username: "QuickProfit", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=QuickProfit", roi: 32.1, portfolioValue: 132100, trades: 412 },
      { rank: 12, username: "You", roi: 18.4, portfolioValue: 118400, trades: 234, isCurrentUser: true },
    ],
  },
]

export function getLeaderboardByPeriod(period: LeaderboardPeriod): LeaderboardEntry[] {
  return mockLeaderboardData[period] || []
}

export function getCompetitionById(id: string): Competition | undefined {
  return mockCompetitions.find(c => c.id === id)
}

export function getActiveCompetitions(): Competition[] {
  return mockCompetitions.filter(c => c.status === "active")
}

export function getUpcomingCompetitions(): Competition[] {
  return mockCompetitions.filter(c => c.status === "upcoming")
}

export function getEndedCompetitions(): Competition[] {
  return mockCompetitions.filter(c => c.status === "ended")
}
