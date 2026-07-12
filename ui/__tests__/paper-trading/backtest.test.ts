import {
  runBacktest,
  validateStrategy,
  PRESET_STRATEGIES,
  BACKTEST_INDICATORS,
  BACKTEST_CONDITIONS,
  type BacktestStrategy,
  type BacktestRule,
} from '@/lib/paper-trading/backtest'

describe('runBacktest', () => {
  const createStrategy = (overrides: Partial<BacktestStrategy> = {}): BacktestStrategy => ({
    name: 'Test Strategy',
    ticker: 'FPT',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    initialCapital: 100_000_000,
    rules: [
      { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
      { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
    ],
    ...overrides,
  })

  describe('basic functionality', () => {
    it('returns complete result structure', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      expect(result).toHaveProperty('strategyName')
      expect(result).toHaveProperty('ticker')
      expect(result).toHaveProperty('period')
      expect(result).toHaveProperty('initialCapital')
      expect(result).toHaveProperty('finalValue')
      expect(result).toHaveProperty('totalReturn')
      expect(result).toHaveProperty('totalReturnPercent')
      expect(result).toHaveProperty('buyAndHoldReturn')
      expect(result).toHaveProperty('buyAndHoldReturnPercent')
      expect(result).toHaveProperty('trades')
      expect(result).toHaveProperty('totalTrades')
      expect(result).toHaveProperty('winningTrades')
      expect(result).toHaveProperty('losingTrades')
      expect(result).toHaveProperty('winRate')
      expect(result).toHaveProperty('maxDrawdown')
      expect(result).toHaveProperty('maxDrawdownPercent')
      expect(result).toHaveProperty('sharpeRatio')
      expect(result).toHaveProperty('equityCurve')
      expect(result).toHaveProperty('buyAndHoldCurve')
    })

    it('preserves strategy name and ticker', () => {
      const strategy = createStrategy({ name: 'My Strategy', ticker: 'VCB' })
      const result = runBacktest(strategy)

      expect(result.strategyName).toBe('My Strategy')
      expect(result.ticker).toBe('VCB')
    })

    it('preserves initial capital', () => {
      const strategy = createStrategy({ initialCapital: 50_000_000 })
      const result = runBacktest(strategy)

      expect(result.initialCapital).toBe(50_000_000)
    })

    it('returns correct period dates', () => {
      const strategy = createStrategy({
        startDate: '2025-03-01',
        endDate: '2025-09-30',
      })
      const result = runBacktest(strategy)

      expect(result.period.start).toBe('2025-03-01')
      expect(result.period.end).toBe('2025-09-30')
    })
  })

  describe('performance metrics', () => {
    it('calculates win rate correctly', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      if (result.totalTrades > 0) {
        const expectedWinRate = (result.winningTrades / result.totalTrades) * 100
        expect(result.winRate).toBeCloseTo(expectedWinRate, 5)
      } else {
        expect(result.winRate).toBe(0)
      }
    })

    it('winning plus losing trades equals total trades', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      expect(result.winningTrades + result.losingTrades).toBe(result.totalTrades)
    })

    it('calculates total return correctly', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      const expectedReturn = result.finalValue - result.initialCapital
      expect(result.totalReturn).toBeCloseTo(expectedReturn, 0)
    })

    it('calculates return percent correctly', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      const expectedPercent = (result.totalReturn / result.initialCapital) * 100
      expect(result.totalReturnPercent).toBeCloseTo(expectedPercent, 5)
    })

    it('max drawdown is non-negative', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      expect(result.maxDrawdown).toBeGreaterThanOrEqual(0)
      expect(result.maxDrawdownPercent).toBeGreaterThanOrEqual(0)
    })

    it('max drawdown percent is between 0 and 100', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      expect(result.maxDrawdownPercent).toBeGreaterThanOrEqual(0)
      expect(result.maxDrawdownPercent).toBeLessThanOrEqual(100)
    })
  })

  describe('equity curves', () => {
    it('equity curve has date and value properties', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      if (result.equityCurve.length > 0) {
        result.equityCurve.forEach(point => {
          expect(point).toHaveProperty('date')
          expect(point).toHaveProperty('value')
          expect(typeof point.date).toBe('string')
          expect(typeof point.value).toBe('number')
        })
      }
    })

    it('buy and hold curve has same length as equity curve', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      expect(result.equityCurve.length).toBe(result.buyAndHoldCurve.length)
    })
  })

  describe('trade execution', () => {
    it('trades have required properties when present', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      result.trades.forEach(trade => {
        expect(trade).toHaveProperty('entryDate')
        expect(trade).toHaveProperty('entryPrice')
        expect(trade).toHaveProperty('shares')
        expect(trade).toHaveProperty('side')
        expect(trade).toHaveProperty('isOpen')
        expect(typeof trade.entryPrice).toBe('number')
        expect(typeof trade.shares).toBe('number')
      })
    })

    it('closed trades have exit information', () => {
      const strategy = createStrategy()
      const result = runBacktest(strategy)

      const closedTrades = result.trades.filter(t => !t.isOpen)
      closedTrades.forEach(trade => {
        expect(trade.exitDate).toBeDefined()
        expect(trade.exitPrice).toBeDefined()
        expect(trade.pnl).toBeDefined()
        expect(trade.pnlPercent).toBeDefined()
      })
    })
  })

  describe('different strategies', () => {
    it('executes RSI mean reversion strategy', () => {
      const strategy = createStrategy({
        rules: PRESET_STRATEGIES[0].rules, // RSI Mean Reversion
      })
      const result = runBacktest(strategy)

      expect(result.strategyName).toBeDefined()
      expect(Array.isArray(result.trades)).toBe(true)
    })

    it('executes SMA crossover strategy', () => {
      const strategy = createStrategy({
        rules: PRESET_STRATEGIES[1].rules, // SMA Crossover
      })
      const result = runBacktest(strategy)

      expect(result.strategyName).toBeDefined()
      expect(Array.isArray(result.trades)).toBe(true)
    })

    it('executes breakout strategy', () => {
      const strategy = createStrategy({
        rules: PRESET_STRATEGIES[2].rules, // Breakout Strategy
      })
      const result = runBacktest(strategy)

      expect(result.strategyName).toBeDefined()
      expect(Array.isArray(result.trades)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles insufficient data gracefully', () => {
      const strategy = createStrategy({
        startDate: '2025-01-01',
        endDate: '2025-01-10', // Very short period
      })
      const result = runBacktest(strategy)

      expect(result.finalValue).toBe(result.initialCapital)
      expect(result.totalReturn).toBe(0)
      expect(result.trades).toHaveLength(0)
    })

    it('handles different tickers', () => {
      const tickers = ['FPT', 'VCB', 'VNM', 'HPG', 'MWG']
      
      tickers.forEach(ticker => {
        const strategy = createStrategy({ ticker })
        const result = runBacktest(strategy)
        expect(result.ticker).toBe(ticker)
      })
    })

    it('handles unknown ticker with default base price', () => {
      const strategy = createStrategy({ ticker: 'UNKNOWN' })
      const result = runBacktest(strategy)

      expect(result.ticker).toBe('UNKNOWN')
      expect(result.initialCapital).toBe(100_000_000)
    })
  })
})

describe('validateStrategy', () => {
  const createStrategy = (overrides: Partial<BacktestStrategy> = {}): BacktestStrategy => ({
    name: 'Test Strategy',
    ticker: 'FPT',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    initialCapital: 100_000_000,
    rules: [
      { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
      { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
    ],
    ...overrides,
  })

  describe('valid strategies', () => {
    it('validates a complete strategy', () => {
      const strategy = createStrategy()
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validates preset strategies', () => {
      PRESET_STRATEGIES.forEach(preset => {
        const strategy = createStrategy({ rules: preset.rules })
        const result = validateStrategy(strategy)
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('name validation', () => {
    it('rejects empty name', () => {
      const strategy = createStrategy({ name: '' })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Strategy name is required')
    })

    it('rejects whitespace-only name', () => {
      const strategy = createStrategy({ name: '   ' })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Strategy name is required')
    })
  })

  describe('ticker validation', () => {
    it('rejects missing ticker', () => {
      const strategy = createStrategy({ ticker: '' })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Ticker is required')
    })
  })

  describe('date validation', () => {
    it('rejects missing start date', () => {
      const strategy = createStrategy({ startDate: '' })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Start and end dates are required')
    })

    it('rejects missing end date', () => {
      const strategy = createStrategy({ endDate: '' })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Start and end dates are required')
    })

    it('rejects start date after end date', () => {
      const strategy = createStrategy({
        startDate: '2025-12-31',
        endDate: '2025-01-01',
      })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Start date must be before end date')
    })

    it('rejects date range less than 30 days', () => {
      const strategy = createStrategy({
        startDate: '2025-01-01',
        endDate: '2025-01-15',
      })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Date range must be at least 30 days')
    })
  })

  describe('capital validation', () => {
    it('rejects capital below minimum', () => {
      const strategy = createStrategy({ initialCapital: 500_000 })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Initial capital must be at least 1,000,000 VND')
    })

    it('accepts capital at minimum', () => {
      const strategy = createStrategy({ initialCapital: 1_000_000 })
      const result = validateStrategy(strategy)

      expect(result.errors).not.toContain('Initial capital must be at least 1,000,000 VND')
    })
  })

  describe('rules validation', () => {
    it('rejects empty rules array', () => {
      const strategy = createStrategy({ rules: [] })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one rule is required')
    })

    it('rejects strategy without entry rule', () => {
      const strategy = createStrategy({
        rules: [
          { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
        ],
      })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one entry rule is required')
    })

    it('rejects strategy without exit rule', () => {
      const strategy = createStrategy({
        rules: [
          { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
        ],
      })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one exit rule is required')
    })

    it('accepts multiple entry and exit rules', () => {
      const strategy = createStrategy({
        rules: [
          { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
          { type: 'entry', indicator: 'price_change', condition: 'above', value: 10, action: 'buy' },
          { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
          { type: 'exit', indicator: 'price_change', condition: 'below', value: -5, action: 'sell' },
        ],
      })
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(true)
    })
  })

  describe('multiple errors', () => {
    it('returns all validation errors', () => {
      const strategy: BacktestStrategy = {
        name: '',
        ticker: '',
        startDate: '',
        endDate: '',
        initialCapital: 100,
        rules: [],
      }
      const result = validateStrategy(strategy)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})

describe('PRESET_STRATEGIES', () => {
  it('contains at least 3 preset strategies', () => {
    expect(PRESET_STRATEGIES.length).toBeGreaterThanOrEqual(3)
  })

  it('each preset has required properties', () => {
    PRESET_STRATEGIES.forEach(preset => {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('description')
      expect(preset).toHaveProperty('rules')
      expect(typeof preset.name).toBe('string')
      expect(typeof preset.description).toBe('string')
      expect(Array.isArray(preset.rules)).toBe(true)
    })
  })

  it('preset rules are valid', () => {
    PRESET_STRATEGIES.forEach(preset => {
      expect(preset.rules.length).toBeGreaterThan(0)
      
      const hasEntry = preset.rules.some(r => r.type === 'entry')
      const hasExit = preset.rules.some(r => r.type === 'exit')
      
      expect(hasEntry).toBe(true)
      expect(hasExit).toBe(true)
    })
  })

  it('RSI Mean Reversion preset has correct structure', () => {
    const rsiPreset = PRESET_STRATEGIES.find(p => p.name === 'RSI Mean Reversion')
    expect(rsiPreset).toBeDefined()
    expect(rsiPreset!.rules.some(r => r.indicator === 'rsi' && r.value === 30)).toBe(true)
    expect(rsiPreset!.rules.some(r => r.indicator === 'rsi' && r.value === 70)).toBe(true)
  })

  it('SMA Crossover preset has correct structure', () => {
    const smaPreset = PRESET_STRATEGIES.find(p => p.name === 'SMA Crossover')
    expect(smaPreset).toBeDefined()
    expect(smaPreset!.rules.some(r => r.indicator === 'sma_cross')).toBe(true)
  })
})

describe('BACKTEST_INDICATORS', () => {
  it('contains expected indicators', () => {
    const values = BACKTEST_INDICATORS.map(i => i.value)
    expect(values).toContain('rsi')
    expect(values).toContain('sma_cross')
    expect(values).toContain('price_change')
    expect(values).toContain('price_level')
  })

  it('each indicator has required properties', () => {
    BACKTEST_INDICATORS.forEach(indicator => {
      expect(indicator).toHaveProperty('value')
      expect(indicator).toHaveProperty('label')
      expect(indicator).toHaveProperty('description')
      expect(indicator).toHaveProperty('defaultValue')
    })
  })

  it('SMA cross has secondary value', () => {
    const smaCross = BACKTEST_INDICATORS.find(i => i.value === 'sma_cross')
    expect(smaCross).toBeDefined()
    expect(smaCross!.secondaryValue).toBeDefined()
  })
})

describe('BACKTEST_CONDITIONS', () => {
  it('contains expected conditions', () => {
    const values = BACKTEST_CONDITIONS.map(c => c.value)
    expect(values).toContain('above')
    expect(values).toContain('below')
    expect(values).toContain('crosses_above')
    expect(values).toContain('crosses_below')
  })

  it('each condition has required properties', () => {
    BACKTEST_CONDITIONS.forEach(condition => {
      expect(condition).toHaveProperty('value')
      expect(condition).toHaveProperty('label')
      expect(condition).toHaveProperty('indicators')
      expect(Array.isArray(condition.indicators)).toBe(true)
    })
  })

  it('conditions specify compatible indicators', () => {
    BACKTEST_CONDITIONS.forEach(condition => {
      condition.indicators.forEach(indicator => {
        const validIndicators = BACKTEST_INDICATORS.map(i => i.value)
        expect(validIndicators).toContain(indicator)
      })
    })
  })
})
