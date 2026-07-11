export interface PaperTradingMarketTicker {
  ticker: string
  name: string | null
  exchange: string | null
  sector: string | null
  price: number
  changePercent: number
}

export interface PaperTradingHolding {
  ticker: string
  shares: number
  averageCost: number
  currentPrice: number
  marketValue: number
  unrealizedPnl: number
  sector: string | null
}

export interface PaperTradingLedgerEntry {
  id: number
  side: "BUY" | "SELL"
  ticker: string
  shares: number
  price: number
  total: number
  executedAt: string
}

export interface PaperTradingSession {
  accountId: string
  startingCapital: number
  cashBalance: number
  totalPortfolioValue: number
  roiPercent: number
  marketWatch: PaperTradingMarketTicker[]
  holdings: PaperTradingHolding[]
  ledger: PaperTradingLedgerEntry[]
  mentorMessage: string
}

interface ApiResponse<T> {
  status: number
  message: string
  data: T
  isSuccess: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend"

export async function fetchPaperTradingSession(userId: string, signal?: AbortSignal) {
  return requestSession("/paper-trading/session", userId, { method: "GET", signal })
}

export async function placePaperTradingOrder(userId: string, order: { ticker: string; shares: number; side: "BUY" | "SELL" }) {
  return requestSession("/paper-trading/orders", userId, { method: "POST", body: JSON.stringify(order) })
}

export async function resetPaperTradingAccount(userId: string) {
  return requestSession("/paper-trading/reset", userId, { method: "POST" })
}

async function requestSession(path: string, userId: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-NestEgg-User-Id": userId,
      ...init.headers,
    },
  })
  const payload = await response.json() as ApiResponse<PaperTradingSession>
  if (!response.ok || !payload.isSuccess) {
    throw new Error(payload.message || "Unable to load paper trading account")
  }
  return payload.data
}
