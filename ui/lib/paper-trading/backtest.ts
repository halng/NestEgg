// Strategy Backtesting Types and Engine

export type BacktestIndicator = 'rsi' | 'sma_cross' | 'price_change' | 'price_level'
export type BacktestCondition = 'above' | 'below' | 'crosses_above' | 'crosses_below'
export type BacktestAction = 'buy' | 'sell'

export interface BacktestRule {
  type: 'entry' | 'exit'
  indicator: BacktestIndicator
  condition: BacktestCondition
  value: number
  secondaryValue?: number // For SMA cross (fast/slow period)
  action: BacktestAction
}

export interface BacktestStrategy {
  name: string
  ticker: string
  startDate: string
  endDate: string
  initialCapital: number
  rules: BacktestRule[]
}

export interface BacktestTrade {
  entryDate: string
  entryPrice: number
  exitDate?: string
  exitPrice?: number
  shares: number
  side: 'long' | 'short'
  pnl?: number
  pnlPercent?: number
  isOpen: boolean
}

export interface BacktestResult {
  strategyName: string
  ticker: string
  period: { start: string; end: string }
  initialCapital: number
  finalValue: number
  totalReturn: number
  totalReturnPercent: number
  buyAndHoldReturn: number
  buyAndHoldReturnPercent: number
  trades: BacktestTrade[]
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  maxDrawdown: number
  maxDrawdownPercent: number
  sharpeRatio: number
  equityCurve: EquityPoint[]
  buyAndHoldCurve: EquityPoint[]
}

export interface EquityPoint {
  date: string
  value: number
}

// Indicator metadata for UI
export const BACKTEST_INDICATORS: Array<{
  value: BacktestIndicator
  label: string
  description: string
  defaultValue: number
  secondaryValue?: number
}> = [
  {
    value: 'rsi',
    label: 'RSI (Relative Strength Index)',
    description: 'Momentum oscillator measuring speed of price changes (0-100)',
    defaultValue: 30,
  },
  {
    value: 'sma_cross',
    label: 'SMA Crossover',
    description: 'Simple Moving Average crossover (fast vs slow period)',
    defaultValue: 20,
    secondaryValue: 50,
  },
  {
    value: 'price_change',
    label: 'Price Change %',
    description: 'Percentage change in price from previous period',
    defaultValue: 5,
  },
  {
    value: 'price_level',
    label: 'Price Level',
    description: 'Absolute price threshold',
    defaultValue: 100000,
  },
]

export const BACKTEST_CONDITIONS: Array<{
  value: BacktestCondition
  label: string
  indicators: BacktestIndicator[]
}> = [
  { value: 'above', label: 'Above', indicators: ['rsi', 'price_change', 'price_level'] },
  { value: 'below', label: 'Below', indicators: ['rsi', 'price_change', 'price_level'] },
  { value: 'crosses_above', label: 'Crosses Above', indicators: ['rsi', 'sma_cross', 'price_level'] },
  { value: 'crosses_below', label: 'Crosses Below', indicators: ['rsi', 'sma_cross', 'price_level'] },
]

// Preset strategies for quick selection
export interface PresetStrategy {
  name: string
  description: string
  rules: BacktestRule[]
}

export const PRESET_STRATEGIES: PresetStrategy[] = [
  {
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI < 30 (oversold), Sell when RSI > 70 (overbought)',
    rules: [
      { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
      { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
    ],
  },
  {
    name: 'SMA Crossover',
    description: 'Buy when SMA20 crosses above SMA50, Sell when crosses below',
    rules: [
      { type: 'entry', indicator: 'sma_cross', condition: 'crosses_above', value: 20, secondaryValue: 50, action: 'buy' },
      { type: 'exit', indicator: 'sma_cross', condition: 'crosses_below', value: 20, secondaryValue: 50, action: 'sell' },
    ],
  },
  {
    name: 'Breakout Strategy',
    description: 'Buy on 10% price increase, Sell at 15% gain or 5% loss',
    rules: [
      { type: 'entry', indicator: 'price_change', condition: 'above', value: 10, action: 'buy' },
      { type: 'exit', indicator: 'price_change', condition: 'above', value: 15, action: 'sell' },
      { type: 'exit', indicator: 'price_change', condition: 'below', value: -5, action: 'sell' },
    ],
  },
]

// Mock historical price data generator
interface MockPricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function generateMockPriceData(
  ticker: string,
  startDate: string,
  endDate: string,
  basePrice: number = 100000
): MockPricePoint[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const data: MockPricePoint[] = []
  
  let currentPrice = basePrice
  const volatility = 0.02 // 2% daily volatility
  
  // Use ticker hash for consistent but different price patterns per ticker
  const tickerHash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  let seed = tickerHash
  
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const changePercent = (pseudoRandom() - 0.5) * 2 * volatility
    const trend = (pseudoRandom() - 0.48) * 0.005 // Slight upward bias
    
    currentPrice = currentPrice * (1 + changePercent + trend)
    currentPrice = Math.max(currentPrice, basePrice * 0.3) // Floor at 30% of base
    
    const dailyRange = currentPrice * volatility
    const open = currentPrice + (pseudoRandom() - 0.5) * dailyRange
    const high = Math.max(open, currentPrice) + pseudoRandom() * dailyRange * 0.5
    const low = Math.min(open, currentPrice) - pseudoRandom() * dailyRange * 0.5
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(currentPrice),
      volume: Math.round(1000000 + pseudoRandom() * 5000000),
    })
  }
  
  return data
}

// Technical indicator calculations
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = []
  
  if (prices.length < period + 1) {
    return prices.map(() => 50) // Default RSI
  }
  
  let gains = 0
  let losses = 0
  
  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change >= 0) gains += change
    else losses -= change
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  for (let i = 0; i < period; i++) {
    rsi.push(50) // Placeholder for initial period
  }
  
  for (let i = period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    const currentGain = change >= 0 ? change : 0
    const currentLoss = change < 0 ? -change : 0
    
    avgGain = (avgGain * (period - 1) + currentGain) / period
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi.push(100 - (100 / (1 + rs)))
  }
  
  return rsi
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i])
      continue
    }
    
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  
  return sma
}

function calculatePriceChange(prices: number[]): number[] {
  return prices.map((price, i) => {
    if (i === 0) return 0
    return ((price - prices[i - 1]) / prices[i - 1]) * 100
  })
}

// Backtest engine
export function runBacktest(strategy: BacktestStrategy): BacktestResult {
  const { name, ticker, startDate, endDate, initialCapital, rules } = strategy
  
  // Get base price based on ticker
  const basePrices: Record<string, number> = {
    FPT: 112500,
    VCB: 89000,
    VNM: 72500,
    HPG: 25800,
    MWG: 48200,
    TCB: 35600,
    VIC: 42100,
    MSN: 78500,
    VHM: 38900,
    GAS: 95200,
  }
  
  const priceData = generateMockPriceData(
    ticker,
    startDate,
    endDate,
    basePrices[ticker] || 100000
  )
  
  if (priceData.length < 20) {
    // Return empty result for insufficient data
    return {
      strategyName: name,
      ticker,
      period: { start: startDate, end: endDate },
      initialCapital,
      finalValue: initialCapital,
      totalReturn: 0,
      totalReturnPercent: 0,
      buyAndHoldReturn: 0,
      buyAndHoldReturnPercent: 0,
      trades: [],
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      sharpeRatio: 0,
      equityCurve: [],
      buyAndHoldCurve: [],
    }
  }
  
  const closePrices = priceData.map(d => d.close)
  
  // Calculate indicators
  const rsi = calculateRSI(closePrices)
  const smaFast = calculateSMA(closePrices, 20)
  const smaSlow = calculateSMA(closePrices, 50)
  const priceChanges = calculatePriceChange(closePrices)
  
  // Run simulation
  let cash = initialCapital
  let shares = 0
  let position: BacktestTrade | null = null
  const trades: BacktestTrade[] = []
  const equityCurve: EquityPoint[] = []
  const buyAndHoldCurve: EquityPoint[] = []
  const dailyReturns: number[] = []
  
  // Buy and hold calculation
  const buyAndHoldShares = Math.floor(initialCapital / closePrices[0])
  const buyAndHoldCash = initialCapital - buyAndHoldShares * closePrices[0]
  
  let prevEquity = initialCapital
  let maxEquity = initialCapital
  let maxDrawdown = 0
  
  for (let i = 50; i < priceData.length; i++) { // Start after enough data for indicators
    const price = closePrices[i]
    const date = priceData[i].date
    
    // Calculate current equity
    const equity = cash + shares * price
    
    // Track drawdown
    if (equity > maxEquity) maxEquity = equity
    const drawdown = maxEquity - equity
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
    
    // Track daily return
    if (prevEquity > 0) {
      dailyReturns.push((equity - prevEquity) / prevEquity)
    }
    prevEquity = equity
    
    // Record equity curve
    equityCurve.push({ date, value: Math.round(equity) })
    buyAndHoldCurve.push({
      date,
      value: Math.round(buyAndHoldCash + buyAndHoldShares * price),
    })
    
    // Check rules
    for (const rule of rules) {
      let conditionMet = false
      
      // Get indicator value
      let indicatorValue = 0
      let prevIndicatorValue = 0
      
      switch (rule.indicator) {
        case 'rsi':
          indicatorValue = rsi[i]
          prevIndicatorValue = rsi[i - 1] || 50
          break
        case 'sma_cross':
          // Value is whether fast SMA is above slow SMA
          indicatorValue = smaFast[i] - smaSlow[i]
          prevIndicatorValue = smaFast[i - 1] - smaSlow[i - 1]
          break
        case 'price_change':
          indicatorValue = priceChanges[i]
          break
        case 'price_level':
          indicatorValue = price
          break
      }
      
      // Check condition
      switch (rule.condition) {
        case 'above':
          conditionMet = indicatorValue > rule.value
          break
        case 'below':
          conditionMet = indicatorValue < rule.value
          break
        case 'crosses_above':
          if (rule.indicator === 'sma_cross') {
            conditionMet = prevIndicatorValue <= 0 && indicatorValue > 0
          } else {
            conditionMet = prevIndicatorValue <= rule.value && indicatorValue > rule.value
          }
          break
        case 'crosses_below':
          if (rule.indicator === 'sma_cross') {
            conditionMet = prevIndicatorValue >= 0 && indicatorValue < 0
          } else {
            conditionMet = prevIndicatorValue >= rule.value && indicatorValue < rule.value
          }
          break
      }
      
      // Execute action
      if (conditionMet) {
        if (rule.type === 'entry' && rule.action === 'buy' && shares === 0) {
          // Buy
          const buyShares = Math.floor(cash * 0.95 / price) // Use 95% of cash
          if (buyShares > 0) {
            shares = buyShares
            cash -= buyShares * price
            position = {
              entryDate: date,
              entryPrice: price,
              shares: buyShares,
              side: 'long',
              isOpen: true,
            }
          }
        } else if (rule.type === 'exit' && rule.action === 'sell' && shares > 0 && position) {
          // Sell
          const sellValue = shares * price
          const pnl = sellValue - position.shares * position.entryPrice
          const pnlPercent = (pnl / (position.shares * position.entryPrice)) * 100
          
          trades.push({
            ...position,
            exitDate: date,
            exitPrice: price,
            pnl: Math.round(pnl),
            pnlPercent,
            isOpen: false,
          })
          
          cash += sellValue
          shares = 0
          position = null
        }
      }
    }
  }
  
  // Close any open position at end
  if (position && shares > 0) {
    const lastPrice = closePrices[closePrices.length - 1]
    const sellValue = shares * lastPrice
    const pnl = sellValue - position.shares * position.entryPrice
    const pnlPercent = (pnl / (position.shares * position.entryPrice)) * 100
    
    trades.push({
      ...position,
      exitDate: priceData[priceData.length - 1].date,
      exitPrice: lastPrice,
      pnl: Math.round(pnl),
      pnlPercent,
      isOpen: false,
    })
    
    cash += sellValue
    shares = 0
  }
  
  // Calculate results
  const finalValue = cash + shares * closePrices[closePrices.length - 1]
  const totalReturn = finalValue - initialCapital
  const totalReturnPercent = (totalReturn / initialCapital) * 100
  
  const buyAndHoldFinal = buyAndHoldCash + buyAndHoldShares * closePrices[closePrices.length - 1]
  const buyAndHoldReturn = buyAndHoldFinal - initialCapital
  const buyAndHoldReturnPercent = (buyAndHoldReturn / initialCapital) * 100
  
  const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length
  const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0
  
  // Calculate Sharpe Ratio (annualized)
  const avgReturn = dailyReturns.length > 0
    ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
    : 0
  const stdReturn = dailyReturns.length > 1
    ? Math.sqrt(
        dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
        (dailyReturns.length - 1)
      )
    : 0
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(252) : 0
  
  return {
    strategyName: name,
    ticker,
    period: { start: startDate, end: endDate },
    initialCapital,
    finalValue: Math.round(finalValue),
    totalReturn: Math.round(totalReturn),
    totalReturnPercent,
    buyAndHoldReturn: Math.round(buyAndHoldReturn),
    buyAndHoldReturnPercent,
    trades,
    totalTrades: trades.length,
    winningTrades,
    losingTrades,
    winRate,
    maxDrawdown: Math.round(maxDrawdown),
    maxDrawdownPercent: maxEquity > 0 ? (maxDrawdown / maxEquity) * 100 : 0,
    sharpeRatio,
    equityCurve,
    buyAndHoldCurve,
  }
}

// Helper to validate strategy before running
export function validateStrategy(strategy: BacktestStrategy): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!strategy.name.trim()) {
    errors.push('Strategy name is required')
  }
  
  if (!strategy.ticker) {
    errors.push('Ticker is required')
  }
  
  if (!strategy.startDate || !strategy.endDate) {
    errors.push('Start and end dates are required')
  } else {
    const start = new Date(strategy.startDate)
    const end = new Date(strategy.endDate)
    
    if (start >= end) {
      errors.push('Start date must be before end date')
    }
    
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff < 30) {
      errors.push('Date range must be at least 30 days')
    }
  }
  
  if (strategy.initialCapital < 1000000) {
    errors.push('Initial capital must be at least 1,000,000 VND')
  }
  
  if (strategy.rules.length === 0) {
    errors.push('At least one rule is required')
  }
  
  const hasEntryRule = strategy.rules.some(r => r.type === 'entry')
  const hasExitRule = strategy.rules.some(r => r.type === 'exit')
  
  if (!hasEntryRule) {
    errors.push('At least one entry rule is required')
  }
  
  if (!hasExitRule) {
    errors.push('At least one exit rule is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}
