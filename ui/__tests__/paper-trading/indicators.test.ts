import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  DEFAULT_INDICATORS,
  INDICATOR_INFO,
} from '@/lib/paper-trading/indicators'

describe('calculateSMA', () => {
  describe('valid calculations', () => {
    it('calculates SMA correctly for simple data', () => {
      const prices = [10, 20, 30, 40, 50]
      const result = calculateSMA(prices, 3)
      
      expect(result).toHaveLength(5)
      expect(result[0]).toBeNaN()
      expect(result[1]).toBeNaN()
      expect(result[2]).toBeCloseTo(20, 5) // (10+20+30)/3
      expect(result[3]).toBeCloseTo(30, 5) // (20+30+40)/3
      expect(result[4]).toBeCloseTo(40, 5) // (30+40+50)/3
    })

    it('calculates SMA with period equal to data length', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 3)
      
      expect(result).toHaveLength(3)
      expect(result[2]).toBeCloseTo(20, 5)
    })

    it('maintains array alignment with NaN padding', () => {
      const prices = [100, 200, 300, 400, 500, 600]
      const result = calculateSMA(prices, 4)
      
      expect(result).toHaveLength(6)
      expect(result.slice(0, 3).every(isNaN)).toBe(true)
      expect(result[3]).toBeCloseTo(250, 5) // (100+200+300+400)/4
    })

    it('handles period of 1 (returns original prices)', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 1)
      
      expect(result).toEqual(prices)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty prices', () => {
      const result = calculateSMA([], 5)
      expect(result).toEqual([])
    })

    it('returns empty array when period is greater than data length', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 5)
      expect(result).toEqual([])
    })

    it('returns empty array for period of 0', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, 0)
      expect(result).toEqual([])
    })

    it('returns empty array for negative period', () => {
      const prices = [10, 20, 30]
      const result = calculateSMA(prices, -1)
      expect(result).toEqual([])
    })

    it('handles single value with period 1', () => {
      const prices = [100]
      const result = calculateSMA(prices, 1)
      expect(result).toEqual([100])
    })
  })
})

describe('calculateEMA', () => {
  describe('valid calculations', () => {
    it('calculates EMA with first value equal to SMA', () => {
      const prices = [10, 20, 30, 40, 50]
      const result = calculateEMA(prices, 3)
      
      expect(result).toHaveLength(5)
      expect(result[0]).toBeNaN()
      expect(result[1]).toBeNaN()
      expect(result[2]).toBeCloseTo(20, 5) // First EMA = SMA = (10+20+30)/3
    })

    it('applies correct multiplier for subsequent values', () => {
      const prices = [10, 20, 30, 40, 50]
      const period = 3
      const multiplier = 2 / (period + 1) // 0.5
      
      const result = calculateEMA(prices, period)
      
      const firstEMA = 20 // SMA of first 3
      const expectedSecondEMA = (40 - firstEMA) * multiplier + firstEMA
      
      expect(result[3]).toBeCloseTo(expectedSecondEMA, 5)
    })

    it('gives more weight to recent prices than SMA', () => {
      const prices = [10, 10, 10, 10, 100] // sudden spike
      const period = 4
      
      const ema = calculateEMA(prices, period)
      const sma = calculateSMA(prices, period)
      
      // EMA should react more to the spike
      expect(ema[4]).toBeGreaterThan(sma[4])
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty prices', () => {
      const result = calculateEMA([], 5)
      expect(result).toEqual([])
    })

    it('returns empty array when period is greater than data length', () => {
      const prices = [10, 20, 30]
      const result = calculateEMA(prices, 5)
      expect(result).toEqual([])
    })

    it('returns empty array for period of 0', () => {
      const prices = [10, 20, 30]
      const result = calculateEMA(prices, 0)
      expect(result).toEqual([])
    })

    it('returns empty array for negative period', () => {
      const prices = [10, 20, 30]
      const result = calculateEMA(prices, -1)
      expect(result).toEqual([])
    })
  })
})

describe('calculateRSI', () => {
  describe('valid calculations', () => {
    it('returns values in 0-100 range', () => {
      const prices = [44, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64]
      const result = calculateRSI(prices, 14)
      
      const validValues = result.filter(v => !isNaN(v))
      validValues.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(100)
      })
    })

    it('returns high value close to 100 when all price changes are positive (no losses)', () => {
      // Continuously increasing prices
      const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      const result = calculateRSI(prices, 5)
      
      // Should approach 100 since no losses (may not be exactly 100 due to smoothing)
      const lastValue = result[result.length - 1]
      expect(lastValue).toBeGreaterThan(95)
      expect(lastValue).toBeLessThanOrEqual(100)
    })

    it('pads beginning with NaN values', () => {
      const prices = Array.from({ length: 20 }, (_, i) => 100 + i)
      const period = 14
      const result = calculateRSI(prices, period)
      
      // First 'period' values should be NaN
      for (let i = 0; i < period; i++) {
        expect(result[i]).toBeNaN()
      }
      expect(result[period]).not.toBeNaN()
    })

    it('calculates RSI around 50 for oscillating prices', () => {
      // Prices oscillating up and down equally
      const prices = [100, 110, 100, 110, 100, 110, 100, 110, 100, 110, 100, 110, 100, 110, 100, 110]
      const result = calculateRSI(prices, 14)
      
      const lastValue = result[result.length - 1]
      // Should be around 50 due to equal gains and losses
      expect(lastValue).toBeGreaterThan(40)
      expect(lastValue).toBeLessThan(60)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for insufficient data', () => {
      const prices = [10, 20, 30]
      const result = calculateRSI(prices, 14)
      expect(result).toEqual([])
    })

    it('returns empty array for period of 0', () => {
      const prices = Array.from({ length: 20 }, () => 100)
      const result = calculateRSI(prices, 0)
      expect(result).toEqual([])
    })

    it('returns empty array for negative period', () => {
      const prices = Array.from({ length: 20 }, () => 100)
      const result = calculateRSI(prices, -14)
      expect(result).toEqual([])
    })

    it('returns empty array for empty prices', () => {
      const result = calculateRSI([], 14)
      expect(result).toEqual([])
    })
  })
})

describe('calculateMACD', () => {
  describe('valid calculations', () => {
    it('returns macd, signal, and histogram arrays', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i * 0.5 + Math.sin(i / 5) * 5)
      const result = calculateMACD(prices)
      
      expect(result).toHaveProperty('macd')
      expect(result).toHaveProperty('signal')
      expect(result).toHaveProperty('histogram')
      expect(result.macd).toHaveLength(prices.length)
      expect(result.signal).toHaveLength(prices.length)
      expect(result.histogram).toHaveLength(prices.length)
    })

    it('has NaN values at the beginning before sufficient data', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i)
      const result = calculateMACD(prices, 12, 26, 9)
      
      // First slowPeriod-1 MACD values should be NaN
      for (let i = 0; i < 25; i++) {
        expect(result.macd[i]).toBeNaN()
      }
    })

    it('histogram equals macd minus signal', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i + Math.random() * 5)
      const result = calculateMACD(prices)
      
      for (let i = 0; i < prices.length; i++) {
        if (!isNaN(result.macd[i]) && !isNaN(result.signal[i])) {
          expect(result.histogram[i]).toBeCloseTo(result.macd[i] - result.signal[i], 10)
        }
      }
    })

    it('accepts custom periods', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + i)
      const result = calculateMACD(prices, 8, 17, 6)
      
      expect(result.macd).toHaveLength(50)
    })
  })

  describe('edge cases', () => {
    it('returns empty arrays for insufficient data', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i)
      const result = calculateMACD(prices, 12, 26, 9)
      
      // Needs slowPeriod + signalPeriod data points
      expect(result).toEqual({ macd: [], signal: [], histogram: [] })
    })

    it('returns empty arrays for empty prices', () => {
      const result = calculateMACD([])
      expect(result).toEqual({ macd: [], signal: [], histogram: [] })
    })
  })
})

describe('calculateBollingerBands', () => {
  describe('valid calculations', () => {
    it('returns upper, middle, and lower bands', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i + Math.random() * 5)
      const result = calculateBollingerBands(prices, 20, 2)
      
      expect(result).toHaveProperty('upper')
      expect(result).toHaveProperty('middle')
      expect(result).toHaveProperty('lower')
      expect(result.upper).toHaveLength(prices.length)
      expect(result.middle).toHaveLength(prices.length)
      expect(result.lower).toHaveLength(prices.length)
    })

    it('middle band equals SMA', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i)
      const period = 20
      const result = calculateBollingerBands(prices, period, 2)
      const sma = calculateSMA(prices, period)
      
      for (let i = 0; i < prices.length; i++) {
        if (!isNaN(result.middle[i])) {
          expect(result.middle[i]).toBeCloseTo(sma[i], 10)
        }
      }
    })

    it('upper band is greater than middle band', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10)
      const result = calculateBollingerBands(prices, 20, 2)
      
      for (let i = 19; i < prices.length; i++) {
        expect(result.upper[i]).toBeGreaterThan(result.middle[i])
      }
    })

    it('lower band is less than middle band', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10)
      const result = calculateBollingerBands(prices, 20, 2)
      
      for (let i = 19; i < prices.length; i++) {
        expect(result.lower[i]).toBeLessThan(result.middle[i])
      }
    })

    it('bands are symmetric around middle with equal stdDev', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10)
      const stdDev = 2
      const result = calculateBollingerBands(prices, 20, stdDev)
      
      for (let i = 19; i < prices.length; i++) {
        const upperDiff = result.upper[i] - result.middle[i]
        const lowerDiff = result.middle[i] - result.lower[i]
        expect(upperDiff).toBeCloseTo(lowerDiff, 10)
      }
    })

    it('wider bands for higher stdDev', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 10)
      const result2 = calculateBollingerBands(prices, 20, 2)
      const result3 = calculateBollingerBands(prices, 20, 3)
      
      // Last valid value
      const idx = prices.length - 1
      const width2 = result2.upper[idx] - result2.lower[idx]
      const width3 = result3.upper[idx] - result3.lower[idx]
      
      expect(width3).toBeGreaterThan(width2)
    })
  })

  describe('edge cases', () => {
    it('returns empty arrays for insufficient data', () => {
      const prices = [100, 101, 102]
      const result = calculateBollingerBands(prices, 20, 2)
      expect(result).toEqual({ upper: [], middle: [], lower: [] })
    })

    it('returns empty arrays for period of 0', () => {
      const prices = Array.from({ length: 30 }, () => 100)
      const result = calculateBollingerBands(prices, 0, 2)
      expect(result).toEqual({ upper: [], middle: [], lower: [] })
    })

    it('returns empty arrays for empty prices', () => {
      const result = calculateBollingerBands([], 20, 2)
      expect(result).toEqual({ upper: [], middle: [], lower: [] })
    })

    it('pads beginning with NaN values', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + i)
      const period = 20
      const result = calculateBollingerBands(prices, period, 2)
      
      for (let i = 0; i < period - 1; i++) {
        expect(result.upper[i]).toBeNaN()
        expect(result.lower[i]).toBeNaN()
      }
    })
  })
})

describe('DEFAULT_INDICATORS', () => {
  it('contains expected indicator types', () => {
    const types = DEFAULT_INDICATORS.map(i => i.type)
    expect(types).toContain('SMA')
    expect(types).toContain('EMA')
    expect(types).toContain('RSI')
    expect(types).toContain('MACD')
    expect(types).toContain('BOLLINGER')
  })

  it('all indicators have required properties', () => {
    DEFAULT_INDICATORS.forEach(indicator => {
      expect(indicator).toHaveProperty('id')
      expect(indicator).toHaveProperty('type')
      expect(indicator).toHaveProperty('enabled')
      expect(indicator).toHaveProperty('period')
      expect(indicator).toHaveProperty('color')
      expect(typeof indicator.id).toBe('string')
      expect(typeof indicator.period).toBe('number')
      expect(indicator.period).toBeGreaterThan(0)
    })
  })

  it('MACD indicator has specific periods', () => {
    const macd = DEFAULT_INDICATORS.find(i => i.type === 'MACD')
    expect(macd).toBeDefined()
    expect(macd?.fastPeriod).toBe(12)
    expect(macd?.slowPeriod).toBe(26)
    expect(macd?.signalPeriod).toBe(9)
  })

  it('Bollinger Bands indicator has stdDev', () => {
    const bollinger = DEFAULT_INDICATORS.find(i => i.type === 'BOLLINGER')
    expect(bollinger).toBeDefined()
    expect(bollinger?.stdDev).toBe(2)
  })
})

describe('INDICATOR_INFO', () => {
  it('has info for all indicator types', () => {
    expect(INDICATOR_INFO).toHaveProperty('SMA')
    expect(INDICATOR_INFO).toHaveProperty('EMA')
    expect(INDICATOR_INFO).toHaveProperty('RSI')
    expect(INDICATOR_INFO).toHaveProperty('MACD')
    expect(INDICATOR_INFO).toHaveProperty('BOLLINGER')
  })

  it('each indicator has name and description', () => {
    Object.values(INDICATOR_INFO).forEach(info => {
      expect(info).toHaveProperty('name')
      expect(info).toHaveProperty('description')
      expect(typeof info.name).toBe('string')
      expect(typeof info.description).toBe('string')
      expect(info.name.length).toBeGreaterThan(0)
      expect(info.description.length).toBeGreaterThan(0)
    })
  })
})
