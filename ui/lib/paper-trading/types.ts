// Order Types
export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT" | "TRAILING_STOP"
export type OrderSide = "BUY" | "SELL"
export type TimeInForce = "DAY" | "GTC" | "IOC" | "FOK"
export type OrderStatus = "PENDING" | "FILLED" | "PARTIAL" | "CANCELLED" | "REJECTED"

// Order interfaces
export interface PlaceOrderRequest {
  ticker: string
  side: OrderSide
  orderType: OrderType
  shares: number
  limitPrice?: number
  stopPrice?: number
  trailPercent?: number
  timeInForce: TimeInForce
}

export interface Order {
  id: string
  ticker: string
  side: OrderSide
  orderType: OrderType
  status: OrderStatus
  requestedShares: number
  filledShares: number
  limitPrice?: number
  stopPrice?: number
  trailPercent?: number
  executedPrice?: number
  total?: number
  timeInForce: TimeInForce
  createdAt: string
  updatedAt?: string
  executedAt?: string
  expiresAt?: string
}

export interface OrderValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Analytics interfaces
export interface PortfolioSnapshot {
  date: string
  portfolioValue: number
  cashBalance: number
  holdingsValue: number
  dailyPnl?: number
}

export interface PerformanceMetrics {
  totalReturn: number
  totalReturnPercent: number
  dailyReturn: number
  weeklyReturn: number
  monthlyReturn: number
  maxDrawdown: number
  volatility: number
  sharpeRatio: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  avgWinAmount: number
  avgLossAmount: number
  profitFactor: number
}

export interface SectorAllocation {
  sector: string
  value: number
  percent: number
  color: string
}

// Price Alert interfaces
export type AlertCondition = "ABOVE" | "BELOW" | "CROSS"

export interface PriceAlert {
  id: string
  ticker: string
  condition: AlertCondition
  targetPrice: number
  isActive: boolean
  triggeredAt?: string
  createdAt: string
}

// Journal entry interface
export interface JournalEntry {
  id: string
  orderId?: string
  ticker?: string
  title: string
  content: string
  tags: string[]
  mood: 'bullish' | 'bearish' | 'neutral'
  createdAt: string
  updatedAt?: string
}

// Leaderboard interfaces
export interface LeaderboardEntry {
  rank: number
  username: string
  avatar?: string
  roi: number
  portfolioValue: number
  trades: number
  isCurrentUser?: boolean
}

export type LeaderboardPeriod = "week" | "month" | "all-time"

// Competition interfaces
export type CompetitionStatus = "active" | "upcoming" | "ended"

export interface Competition {
  id: string
  name: string
  description: string
  status: CompetitionStatus
  startDate: string
  endDate: string
  participants: number
  maxParticipants?: number
  prizePool: string
  prizes: CompetitionPrize[]
  isJoined?: boolean
  leaderboard?: LeaderboardEntry[]
}

export interface CompetitionPrize {
  position: number
  prize: string
}

// Achievement interfaces
export type AchievementCategory = "trading" | "learning" | "social"
export type AchievementStatus = "unlocked" | "locked" | "in-progress"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  status: AchievementStatus
  progress?: number
  maxProgress?: number
  unlockedAt?: string
}

// Onboarding Tour Types
export type TourStepPosition = "top" | "bottom" | "left" | "right"

export interface TourStepConfig {
  id: string
  title: string
  description: string
  targetSelector: string
  position: TourStepPosition
}

export interface OnboardingState {
  hasCompletedTour: boolean
  dontShowAgain: boolean
  completedAt?: string
}

// Risk Assessment Types
export type RiskTolerance = "conservative" | "moderate" | "aggressive"

export interface RiskQuizQuestion {
  id: string
  question: string
  options: RiskQuizOption[]
}

export interface RiskQuizOption {
  value: string
  label: string
  score: number
}

export interface RiskProfileResult {
  tolerance: RiskTolerance
  score: number
  maxPositionSizePercent: number
  description: string
  recommendation: string
}

export interface RiskProfileState {
  tolerance: RiskTolerance
  score: number
  completedAt: string
}

// Glossary Types
export interface GlossaryTerm {
  term: string
  definition: string
  example?: string
  learnMoreUrl?: string
}

// Technical Indicator Types
export type IndicatorType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BOLLINGER'

export interface IndicatorConfig {
  id: string
  type: IndicatorType
  enabled: boolean
  period: number
  color: string
  // MACD specific
  fastPeriod?: number
  slowPeriod?: number
  signalPeriod?: number
  // Bollinger Bands specific
  stdDev?: number
}

export interface MACDResult {
  macd: number[]
  signal: number[]
  histogram: number[]
}

export interface BollingerBandsResult {
  upper: number[]
  middle: number[]
  lower: number[]
}

// News Types
export type NewsCategory = 'market' | 'company' | 'analysis'
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral'

export interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: NewsCategory
  sentiment: NewsSentiment
  tickers: string[]
  imageUrl?: string
}

// Re-export existing types from paper-trading-api.ts for convenience
export type {
  PaperTradingMarketTicker,
  PaperTradingHolding,
  PaperTradingLedgerEntry,
  PaperTradingSession,
} from "../paper-trading-api"

// Re-export Portfolio types
export type {
  Portfolio,
  PortfolioSummary,
  PortfolioStrategy,
} from "./mock-portfolios"

// Re-export Backtest types
export type {
  BacktestStrategy,
  BacktestRule,
  BacktestResult,
  BacktestTrade,
  BacktestIndicator,
  BacktestCondition,
  BacktestAction,
  EquityPoint,
  PresetStrategy,
} from "./backtest"
