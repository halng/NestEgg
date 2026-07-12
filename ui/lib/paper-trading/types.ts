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

// Re-export existing types from paper-trading-api.ts for convenience
export type {
  PaperTradingMarketTicker,
  PaperTradingHolding,
  PaperTradingLedgerEntry,
  PaperTradingSession,
} from "../paper-trading-api"
