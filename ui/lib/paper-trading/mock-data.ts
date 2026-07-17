import type { PaperTradingSession, PaperTradingMarketTicker, PaperTradingHolding } from "./types"

export const mockMarketWatch: PaperTradingMarketTicker[] = [
  { ticker: "FPT", name: "FPT Corporation", exchange: "HOSE", sector: "Technology", price: 112500, changePercent: 2.1 },
  { ticker: "VCB", name: "Vietcombank", exchange: "HOSE", sector: "Banking", price: 89000, changePercent: -0.5 },
  { ticker: "VNM", name: "Vinamilk", exchange: "HOSE", sector: "Consumer", price: 72500, changePercent: 1.2 },
  { ticker: "HPG", name: "Hoa Phat Group", exchange: "HOSE", sector: "Materials", price: 25800, changePercent: -1.8 },
  { ticker: "MWG", name: "Mobile World", exchange: "HOSE", sector: "Consumer", price: 48200, changePercent: 0.8 },
  { ticker: "TCB", name: "Techcombank", exchange: "HOSE", sector: "Banking", price: 35600, changePercent: 1.5 },
  { ticker: "VIC", name: "Vingroup", exchange: "HOSE", sector: "Real Estate", price: 42100, changePercent: -0.3 },
  { ticker: "MSN", name: "Masan Group", exchange: "HOSE", sector: "Consumer", price: 78500, changePercent: 2.8 },
  { ticker: "VHM", name: "Vinhomes", exchange: "HOSE", sector: "Real Estate", price: 38900, changePercent: 0.5 },
  { ticker: "GAS", name: "PV Gas", exchange: "HOSE", sector: "Energy", price: 95200, changePercent: -1.2 },
]

export const mockHoldings: PaperTradingHolding[] = [
  {
    ticker: "FPT",
    shares: 200,
    averageCost: 108000,
    currentPrice: 112500,
    marketValue: 22500000,
    unrealizedPnl: 900000,
    sector: "Technology",
  },
  {
    ticker: "VCB",
    shares: 150,
    averageCost: 92000,
    currentPrice: 89000,
    marketValue: 13350000,
    unrealizedPnl: -450000,
    sector: "Banking",
  },
  {
    ticker: "TCB",
    shares: 300,
    averageCost: 34000,
    currentPrice: 35600,
    marketValue: 10680000,
    unrealizedPnl: 480000,
    sector: "Banking",
  },
]

export const mockSession: PaperTradingSession = {
  accountId: "mock-account-001",
  startingCapital: 100_000_000,
  cashBalance: 53_470_000,
  totalPortfolioValue: 100_000_000 + 930_000,
  roiPercent: 0.93,
  marketWatch: mockMarketWatch,
  holdings: mockHoldings,
  ledger: [
    {
      id: 1,
      side: "BUY",
      ticker: "FPT",
      shares: 200,
      price: 108000,
      total: 21600000,
      executedAt: "2024-01-10T09:15:00Z",
    },
    {
      id: 2,
      side: "BUY",
      ticker: "VCB",
      shares: 150,
      price: 92000,
      total: 13800000,
      executedAt: "2024-01-11T10:30:00Z",
    },
    {
      id: 3,
      side: "BUY",
      ticker: "TCB",
      shares: 300,
      price: 34000,
      total: 10200000,
      executedAt: "2024-01-12T14:20:00Z",
    },
    {
      id: 4,
      side: "SELL",
      ticker: "HPG",
      shares: 100,
      price: 26500,
      total: 2650000,
      executedAt: "2024-01-13T11:45:00Z",
    },
  ],
  mentorMessage:
    "Welcome to paper trading! Your portfolio is up 0.93% since you started. Consider diversifying into more sectors.",
}

export function getMockSession(): PaperTradingSession {
  return { ...mockSession }
}
