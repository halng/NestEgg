import type { IndicatorConfig, MACDResult, BollingerBandsResult } from './types'

/**
 * Calculate Simple Moving Average (SMA)
 * SMA = Sum of prices over period / period
 */
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period || period <= 0) {
    return []
  }

  const result: number[] = []
  
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += prices[i - j]
    }
    result.push(sum / period)
  }

  // Pad the beginning with NaN to maintain array alignment
  const padding = new Array(period - 1).fill(NaN)
  return [...padding, ...result]
}

/**
 * Calculate Exponential Moving Average (EMA)
 * EMA = Price(t) * k + EMA(y) * (1-k)
 * where k = 2 / (period + 1)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period || period <= 0) {
    return []
  }

  const result: number[] = []
  const multiplier = 2 / (period + 1)

  // First EMA value is the SMA of the first 'period' prices
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  let ema = sum / period
  
  // Pad the beginning with NaN
  for (let i = 0; i < period - 1; i++) {
    result.push(NaN)
  }
  result.push(ema)

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
    result.push(ema)
  }

  return result
}

/**
 * Calculate Relative Strength Index (RSI)
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss
 */
export function calculateRSI(prices: number[], period: number): number[] {
  if (prices.length < period + 1 || period <= 0) {
    return []
  }

  const result: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  // Calculate initial average gain and loss (SMA style)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 0; i < period; i++) {
    avgGain += gains[i]
    avgLoss += losses[i]
  }
  avgGain /= period
  avgLoss /= period

  // Pad the beginning with NaN
  for (let i = 0; i < period; i++) {
    result.push(NaN)
  }

  // First RSI
  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss
  result.push(100 - (100 / (1 + firstRS)))

  // Calculate RSI using smoothed averages (Wilder's smoothing)
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push(100 - (100 / (1 + rs)))
  }

  return result
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * MACD Line = Fast EMA - Slow EMA
 * Signal Line = EMA of MACD Line
 * Histogram = MACD Line - Signal Line
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] }
  }

  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)

  // Calculate MACD line
  const macdLine: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN)
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }
  }

  // Calculate Signal line (EMA of MACD, using only valid MACD values)
  const validMacdStart = slowPeriod - 1
  const validMacdValues = macdLine.slice(validMacdStart).filter(v => !isNaN(v))
  const signalEMA = calculateEMA(validMacdValues, signalPeriod)

  // Build signal array with proper alignment
  const signal: number[] = new Array(validMacdStart).fill(NaN)
  for (let i = 0; i < signalEMA.length; i++) {
    signal.push(signalEMA[i])
  }

  // Calculate Histogram
  const histogram: number[] = []
  for (let i = 0; i < macdLine.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(signal[i])) {
      histogram.push(NaN)
    } else {
      histogram.push(macdLine[i] - signal[i])
    }
  }

  return { macd: macdLine, signal, histogram }
}

/**
 * Calculate Bollinger Bands
 * Middle Band = SMA
 * Upper Band = SMA + (stdDev * standard deviation)
 * Lower Band = SMA - (stdDev * standard deviation)
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult {
  if (prices.length < period || period <= 0) {
    return { upper: [], middle: [], lower: [] }
  }

  const middle = calculateSMA(prices, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
      // Calculate standard deviation for this window
      const slice = prices.slice(i - period + 1, i + 1)
      const mean = middle[i]
      let sumSquaredDiff = 0
      for (const price of slice) {
        sumSquaredDiff += Math.pow(price - mean, 2)
      }
      const standardDeviation = Math.sqrt(sumSquaredDiff / period)
      
      upper.push(mean + stdDev * standardDeviation)
      lower.push(mean - stdDev * standardDeviation)
    }
  }

  return { upper, middle, lower }
}

// Default indicator configurations
export const DEFAULT_INDICATORS: IndicatorConfig[] = [
  { id: 'sma-20', type: 'SMA', enabled: false, period: 20, color: '#3b82f6' },
  { id: 'sma-50', type: 'SMA', enabled: false, period: 50, color: '#8b5cf6' },
  { id: 'ema-12', type: 'EMA', enabled: false, period: 12, color: '#10b981' },
  { id: 'ema-26', type: 'EMA', enabled: false, period: 26, color: '#f59e0b' },
  { id: 'rsi-14', type: 'RSI', enabled: false, period: 14, color: '#ef4444' },
  { 
    id: 'macd', 
    type: 'MACD', 
    enabled: false, 
    period: 9, 
    color: '#06b6d4',
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  },
  { 
    id: 'bollinger', 
    type: 'BOLLINGER', 
    enabled: false, 
    period: 20, 
    color: '#ec4899',
    stdDev: 2
  },
]

// Indicator display names and descriptions
export const INDICATOR_INFO: Record<string, { name: string; description: string }> = {
  SMA: { name: 'Simple Moving Average', description: 'Average price over a period' },
  EMA: { name: 'Exponential Moving Average', description: 'Weighted average giving more weight to recent prices' },
  RSI: { name: 'Relative Strength Index', description: 'Momentum indicator (0-100), overbought >70, oversold <30' },
  MACD: { name: 'MACD', description: 'Trend-following momentum indicator' },
  BOLLINGER: { name: 'Bollinger Bands', description: 'Volatility bands around moving average' },
}
