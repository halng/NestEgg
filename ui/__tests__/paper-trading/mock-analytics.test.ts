import {
  generatePortfolioHistory,
  calculateSectorAllocation,
  mockPerformanceMetrics,
  mockPortfolioHistory
} from '@/lib/paper-trading/mock-analytics'
import type { PaperTradingHolding } from '@/lib/paper-trading/types'

describe('generatePortfolioHistory', () => {
  it('generates correct number of data points', () => {
    const history = generatePortfolioHistory(30)
    expect(history.length).toBe(31)
  })

  it('generates data with required fields', () => {
    const history = generatePortfolioHistory(7)
    
    history.forEach(snapshot => {
      expect(snapshot.date).toBeTruthy()
      expect(typeof snapshot.portfolioValue).toBe('number')
      expect(typeof snapshot.cashBalance).toBe('number')
      expect(typeof snapshot.holdingsValue).toBe('number')
      expect(snapshot.portfolioValue).toBeGreaterThan(0)
    })
  })

  it('ensures cash + holdings approximately equals portfolio value', () => {
    const history = generatePortfolioHistory(10)
    
    history.forEach(snapshot => {
      const sum = snapshot.cashBalance + snapshot.holdingsValue
      expect(Math.abs(sum - snapshot.portfolioValue)).toBeLessThan(1000)
    })
  })

  it('generates dates in chronological order', () => {
    const history = generatePortfolioHistory(5)
    
    for (let i = 1; i < history.length; i++) {
      const prevDate = new Date(history[i - 1].date)
      const currDate = new Date(history[i].date)
      expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime())
    }
  })
})

describe('calculateSectorAllocation', () => {
  it('calculates allocation from holdings', () => {
    const holdings: PaperTradingHolding[] = [
      { ticker: 'FPT', shares: 100, averageCost: 100000, currentPrice: 110000, marketValue: 11000000, unrealizedPnl: 1000000, sector: 'Technology' },
      { ticker: 'VCB', shares: 50, averageCost: 90000, currentPrice: 89000, marketValue: 4450000, unrealizedPnl: -50000, sector: 'Banking' }
    ]

    const allocation = calculateSectorAllocation(holdings)

    expect(allocation.length).toBe(2)
    expect(allocation.find(a => a.sector === 'Technology')).toBeTruthy()
    expect(allocation.find(a => a.sector === 'Banking')).toBeTruthy()
  })

  it('calculates correct percentages', () => {
    const holdings: PaperTradingHolding[] = [
      { ticker: 'A', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 75000, unrealizedPnl: 0, sector: 'Technology' },
      { ticker: 'B', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 25000, unrealizedPnl: 0, sector: 'Banking' }
    ]

    const allocation = calculateSectorAllocation(holdings)
    const techAlloc = allocation.find(a => a.sector === 'Technology')
    const bankingAlloc = allocation.find(a => a.sector === 'Banking')

    expect(techAlloc?.percent).toBe(75)
    expect(bankingAlloc?.percent).toBe(25)
  })

  it('handles empty holdings', () => {
    const allocation = calculateSectorAllocation([])
    expect(allocation).toEqual([])
  })

  it('groups null sectors as "Other"', () => {
    const holdings: PaperTradingHolding[] = [
      { ticker: 'X', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 100000, unrealizedPnl: 0, sector: null }
    ]

    const allocation = calculateSectorAllocation(holdings)
    expect(allocation[0].sector).toBe('Other')
  })

  it('sorts by value descending', () => {
    const holdings: PaperTradingHolding[] = [
      { ticker: 'A', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 10000, unrealizedPnl: 0, sector: 'Consumer' },
      { ticker: 'B', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 50000, unrealizedPnl: 0, sector: 'Technology' },
      { ticker: 'C', shares: 100, averageCost: 1000, currentPrice: 1000, marketValue: 30000, unrealizedPnl: 0, sector: 'Banking' }
    ]

    const allocation = calculateSectorAllocation(holdings)
    
    expect(allocation[0].sector).toBe('Technology')
    expect(allocation[1].sector).toBe('Banking')
    expect(allocation[2].sector).toBe('Consumer')
  })

  it('includes color for each sector', () => {
    const holdings: PaperTradingHolding[] = [
      { ticker: 'FPT', shares: 100, averageCost: 100000, currentPrice: 110000, marketValue: 11000000, unrealizedPnl: 1000000, sector: 'Banking' }
    ]

    const allocation = calculateSectorAllocation(holdings)
    expect(allocation[0].color).toBeTruthy()
    expect(allocation[0].color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

describe('mockPerformanceMetrics', () => {
  it('has all required fields', () => {
    expect(mockPerformanceMetrics.totalReturn).toBeDefined()
    expect(mockPerformanceMetrics.totalReturnPercent).toBeDefined()
    expect(mockPerformanceMetrics.winRate).toBeDefined()
    expect(mockPerformanceMetrics.sharpeRatio).toBeDefined()
    expect(mockPerformanceMetrics.maxDrawdown).toBeDefined()
    expect(mockPerformanceMetrics.totalTrades).toBeDefined()
    expect(mockPerformanceMetrics.profitFactor).toBeDefined()
  })

  it('has consistent win/loss counts', () => {
    const { totalTrades, winningTrades, losingTrades } = mockPerformanceMetrics
    expect(winningTrades + losingTrades).toBe(totalTrades)
  })

  it('has valid win rate', () => {
    const { winRate, winningTrades, totalTrades } = mockPerformanceMetrics
    const calculatedWinRate = (winningTrades / totalTrades) * 100
    expect(Math.abs(winRate - calculatedWinRate)).toBeLessThan(0.1)
  })
})

describe('mockPortfolioHistory', () => {
  it('has all time period keys', () => {
    expect(mockPortfolioHistory['1D']).toBeDefined()
    expect(mockPortfolioHistory['1W']).toBeDefined()
    expect(mockPortfolioHistory['1M']).toBeDefined()
    expect(mockPortfolioHistory['3M']).toBeDefined()
    expect(mockPortfolioHistory['6M']).toBeDefined()
    expect(mockPortfolioHistory['1Y']).toBeDefined()
    expect(mockPortfolioHistory['ALL']).toBeDefined()
  })

  it('has appropriate data lengths for each period', () => {
    expect(mockPortfolioHistory['1D'].length).toBe(2)
    expect(mockPortfolioHistory['1W'].length).toBe(8)
    expect(mockPortfolioHistory['1M'].length).toBe(31)
  })
})
