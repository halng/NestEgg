import type { PaperTradingHolding } from "./types"

// Portfolio Types
export type PortfolioStrategy = 'growth' | 'value' | 'income' | 'balanced' | 'custom'

export interface Portfolio {
  id: string
  name: string
  description?: string
  strategy?: PortfolioStrategy
  startingCapital: number
  cashBalance: number
  totalValue: number
  roi: number
  createdAt: string
  isActive: boolean
  holdings: PaperTradingHolding[]
}

export interface PortfolioSummary {
  id: string
  name: string
  strategy?: PortfolioStrategy
  totalValue: number
  roi: number
  isActive: boolean
}

// Strategy metadata for UI display
export const PORTFOLIO_STRATEGIES: Array<{
  value: PortfolioStrategy
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'growth',
    label: 'Growth',
    description: 'Focus on high-growth tech and innovation stocks',
    icon: '🚀',
  },
  {
    value: 'value',
    label: 'Value',
    description: 'Hunt for undervalued stocks with strong fundamentals',
    icon: '💎',
  },
  {
    value: 'income',
    label: 'Income',
    description: 'Prioritize dividend-paying stocks for passive income',
    icon: '💰',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of growth and income for stable returns',
    icon: '⚖️',
  },
  {
    value: 'custom',
    label: 'Custom',
    description: 'Your own trading strategy',
    icon: '🎯',
  },
]

// Mock portfolio data
export const mockPortfolios: Portfolio[] = [
  {
    id: 'portfolio-main',
    name: 'Main Portfolio',
    description: 'My primary paper trading portfolio',
    strategy: 'balanced',
    startingCapital: 100_000_000,
    cashBalance: 53_470_000,
    totalValue: 100_930_000,
    roi: 0.93,
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    holdings: [
      {
        ticker: 'FPT',
        shares: 200,
        averageCost: 108000,
        currentPrice: 112500,
        marketValue: 22500000,
        unrealizedPnl: 900000,
        sector: 'Technology',
      },
      {
        ticker: 'VCB',
        shares: 150,
        averageCost: 92000,
        currentPrice: 89000,
        marketValue: 13350000,
        unrealizedPnl: -450000,
        sector: 'Banking',
      },
      {
        ticker: 'TCB',
        shares: 300,
        averageCost: 34000,
        currentPrice: 35600,
        marketValue: 10680000,
        unrealizedPnl: 480000,
        sector: 'Banking',
      },
    ],
  },
  {
    id: 'portfolio-growth',
    name: 'Growth Picks',
    description: 'Tech-focused high-growth portfolio',
    strategy: 'growth',
    startingCapital: 50_000_000,
    cashBalance: 15_200_000,
    totalValue: 58_750_000,
    roi: 17.5,
    createdAt: '2024-02-15T00:00:00Z',
    isActive: false,
    holdings: [
      {
        ticker: 'FPT',
        shares: 300,
        averageCost: 105000,
        currentPrice: 112500,
        marketValue: 33750000,
        unrealizedPnl: 2250000,
        sector: 'Technology',
      },
      {
        ticker: 'MWG',
        shares: 200,
        averageCost: 45000,
        currentPrice: 48200,
        marketValue: 9640000,
        unrealizedPnl: 640000,
        sector: 'Consumer',
      },
    ],
  },
  {
    id: 'portfolio-value',
    name: 'Value Hunting',
    description: 'Undervalued stocks with recovery potential',
    strategy: 'value',
    startingCapital: 75_000_000,
    cashBalance: 28_500_000,
    totalValue: 72_850_000,
    roi: -2.87,
    createdAt: '2024-03-01T00:00:00Z',
    isActive: false,
    holdings: [
      {
        ticker: 'HPG',
        shares: 1000,
        averageCost: 27000,
        currentPrice: 25800,
        marketValue: 25800000,
        unrealizedPnl: -1200000,
        sector: 'Materials',
      },
      {
        ticker: 'VIC',
        shares: 400,
        averageCost: 44500,
        currentPrice: 42100,
        marketValue: 16840000,
        unrealizedPnl: -960000,
        sector: 'Real Estate',
      },
    ],
  },
  {
    id: 'portfolio-dividend',
    name: 'Dividend Income',
    description: 'High-yield dividend stocks for passive income',
    strategy: 'income',
    startingCapital: 80_000_000,
    cashBalance: 22_300_000,
    totalValue: 84_520_000,
    roi: 5.65,
    createdAt: '2024-01-20T00:00:00Z',
    isActive: false,
    holdings: [
      {
        ticker: 'GAS',
        shares: 300,
        averageCost: 92000,
        currentPrice: 95200,
        marketValue: 28560000,
        unrealizedPnl: 960000,
        sector: 'Energy',
      },
      {
        ticker: 'VNM',
        shares: 400,
        averageCost: 70000,
        currentPrice: 72500,
        marketValue: 29000000,
        unrealizedPnl: 1000000,
        sector: 'Consumer',
      },
    ],
  },
]

// localStorage key for portfolio persistence
const PORTFOLIOS_STORAGE_KEY = 'paper-trading-portfolios'
const ACTIVE_PORTFOLIO_KEY = 'paper-trading-active-portfolio'

// Helper functions for portfolio management
export function getStoredPortfolios(): Portfolio[] {
  if (typeof window === 'undefined') return mockPortfolios
  
  const stored = localStorage.getItem(PORTFOLIOS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return mockPortfolios
    }
  }
  
  // Initialize with mock data on first load
  localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(mockPortfolios))
  return mockPortfolios
}

export function savePortfolios(portfolios: Portfolio[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PORTFOLIOS_STORAGE_KEY, JSON.stringify(portfolios))
}

export function getActivePortfolioId(): string {
  if (typeof window === 'undefined') return 'portfolio-main'
  return localStorage.getItem(ACTIVE_PORTFOLIO_KEY) || 'portfolio-main'
}

export function setActivePortfolioId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_PORTFOLIO_KEY, id)
}

export function createPortfolio(
  name: string,
  startingCapital: number,
  strategy?: PortfolioStrategy,
  description?: string
): Portfolio {
  return {
    id: `portfolio-${Date.now()}`,
    name,
    description,
    strategy,
    startingCapital,
    cashBalance: startingCapital,
    totalValue: startingCapital,
    roi: 0,
    createdAt: new Date().toISOString(),
    isActive: false,
    holdings: [],
  }
}

export function deletePortfolio(portfolios: Portfolio[], portfolioId: string): Portfolio[] {
  const filtered = portfolios.filter(p => p.id !== portfolioId)
  
  // If we deleted the active portfolio, activate the first remaining one
  if (filtered.length > 0 && !filtered.some(p => p.isActive)) {
    filtered[0].isActive = true
  }
  
  return filtered
}

export function switchActivePortfolio(portfolios: Portfolio[], portfolioId: string): Portfolio[] {
  return portfolios.map(p => ({
    ...p,
    isActive: p.id === portfolioId,
  }))
}

export function getPortfolioSummaries(portfolios: Portfolio[]): PortfolioSummary[] {
  return portfolios.map(p => ({
    id: p.id,
    name: p.name,
    strategy: p.strategy,
    totalValue: p.totalValue,
    roi: p.roi,
    isActive: p.isActive,
  }))
}

// Calculate total portfolio value across all portfolios
export function getTotalPortfoliosValue(portfolios: Portfolio[]): number {
  return portfolios.reduce((sum, p) => sum + p.totalValue, 0)
}

// Get combined ROI across all portfolios (weighted by value)
export function getCombinedROI(portfolios: Portfolio[]): number {
  const totalValue = getTotalPortfoliosValue(portfolios)
  if (totalValue === 0) return 0
  
  const weightedROI = portfolios.reduce((sum, p) => {
    const weight = p.totalValue / totalValue
    return sum + (p.roi * weight)
  }, 0)
  
  return weightedROI
}
