import {
  mockPortfolios,
  PORTFOLIO_STRATEGIES,
  createPortfolio,
  deletePortfolio,
  switchActivePortfolio,
  getPortfolioSummaries,
  getTotalPortfoliosValue,
  getCombinedROI,
  type Portfolio,
  type PortfolioStrategy,
} from '@/lib/paper-trading/mock-portfolios'

describe('mockPortfolios', () => {
  describe('data structure', () => {
    it('contains at least 3 portfolios', () => {
      expect(mockPortfolios.length).toBeGreaterThanOrEqual(3)
    })

    it('each portfolio has required properties', () => {
      mockPortfolios.forEach(portfolio => {
        expect(portfolio).toHaveProperty('id')
        expect(portfolio).toHaveProperty('name')
        expect(portfolio).toHaveProperty('startingCapital')
        expect(portfolio).toHaveProperty('cashBalance')
        expect(portfolio).toHaveProperty('totalValue')
        expect(portfolio).toHaveProperty('roi')
        expect(portfolio).toHaveProperty('createdAt')
        expect(portfolio).toHaveProperty('isActive')
        expect(portfolio).toHaveProperty('holdings')
        expect(typeof portfolio.id).toBe('string')
        expect(typeof portfolio.name).toBe('string')
        expect(typeof portfolio.startingCapital).toBe('number')
        expect(typeof portfolio.cashBalance).toBe('number')
        expect(typeof portfolio.totalValue).toBe('number')
        expect(typeof portfolio.roi).toBe('number')
        expect(typeof portfolio.isActive).toBe('boolean')
        expect(Array.isArray(portfolio.holdings)).toBe(true)
      })
    })

    it('portfolios have unique ids', () => {
      const ids = mockPortfolios.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('strategies', () => {
    it('portfolios have valid strategies', () => {
      const validStrategies: (PortfolioStrategy | undefined)[] = [
        'growth', 'value', 'income', 'balanced', 'custom', undefined
      ]
      mockPortfolios.forEach(portfolio => {
        expect(validStrategies).toContain(portfolio.strategy)
      })
    })

    it('has portfolios with different strategies', () => {
      const strategies = new Set(mockPortfolios.map(p => p.strategy).filter(Boolean))
      expect(strategies.size).toBeGreaterThanOrEqual(2)
    })
  })

  describe('active portfolio', () => {
    it('exactly one portfolio is active', () => {
      const activePortfolios = mockPortfolios.filter(p => p.isActive)
      expect(activePortfolios.length).toBe(1)
    })
  })

  describe('holdings', () => {
    it('holdings have required properties', () => {
      mockPortfolios.forEach(portfolio => {
        portfolio.holdings.forEach(holding => {
          expect(holding).toHaveProperty('ticker')
          expect(holding).toHaveProperty('shares')
          expect(holding).toHaveProperty('averageCost')
          expect(holding).toHaveProperty('currentPrice')
          expect(holding).toHaveProperty('marketValue')
          expect(holding).toHaveProperty('unrealizedPnl')
          expect(typeof holding.ticker).toBe('string')
          expect(typeof holding.shares).toBe('number')
          expect(typeof holding.averageCost).toBe('number')
          expect(typeof holding.currentPrice).toBe('number')
        })
      })
    })

    it('market value calculation is correct', () => {
      mockPortfolios.forEach(portfolio => {
        portfolio.holdings.forEach(holding => {
          const expectedMarketValue = holding.shares * holding.currentPrice
          expect(holding.marketValue).toBe(expectedMarketValue)
        })
      })
    })
  })

  describe('financial values', () => {
    it('starting capital is positive', () => {
      mockPortfolios.forEach(portfolio => {
        expect(portfolio.startingCapital).toBeGreaterThan(0)
      })
    })

    it('cash balance is non-negative', () => {
      mockPortfolios.forEach(portfolio => {
        expect(portfolio.cashBalance).toBeGreaterThanOrEqual(0)
      })
    })

    it('total value is positive', () => {
      mockPortfolios.forEach(portfolio => {
        expect(portfolio.totalValue).toBeGreaterThan(0)
      })
    })
  })

  describe('createdAt dates', () => {
    it('all createdAt timestamps are valid ISO dates', () => {
      mockPortfolios.forEach(portfolio => {
        const date = new Date(portfolio.createdAt)
        expect(date.toString()).not.toBe('Invalid Date')
      })
    })
  })
})

describe('PORTFOLIO_STRATEGIES', () => {
  it('contains all strategy types', () => {
    const values = PORTFOLIO_STRATEGIES.map(s => s.value)
    expect(values).toContain('growth')
    expect(values).toContain('value')
    expect(values).toContain('income')
    expect(values).toContain('balanced')
    expect(values).toContain('custom')
  })

  it('each strategy has required properties', () => {
    PORTFOLIO_STRATEGIES.forEach(strategy => {
      expect(strategy).toHaveProperty('value')
      expect(strategy).toHaveProperty('label')
      expect(strategy).toHaveProperty('description')
      expect(strategy).toHaveProperty('icon')
      expect(typeof strategy.value).toBe('string')
      expect(typeof strategy.label).toBe('string')
      expect(typeof strategy.description).toBe('string')
      expect(typeof strategy.icon).toBe('string')
    })
  })

  it('descriptions are meaningful', () => {
    PORTFOLIO_STRATEGIES.forEach(strategy => {
      expect(strategy.description.length).toBeGreaterThan(10)
    })
  })
})

describe('createPortfolio', () => {
  it('creates portfolio with required properties', () => {
    const result = createPortfolio('Test Portfolio', 50_000_000)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('startingCapital')
    expect(result).toHaveProperty('cashBalance')
    expect(result).toHaveProperty('totalValue')
    expect(result).toHaveProperty('roi')
    expect(result).toHaveProperty('createdAt')
    expect(result).toHaveProperty('isActive')
    expect(result).toHaveProperty('holdings')
  })

  it('uses provided name', () => {
    const result = createPortfolio('My Custom Name', 50_000_000)
    expect(result.name).toBe('My Custom Name')
  })

  it('uses provided starting capital', () => {
    const result = createPortfolio('Test', 75_000_000)
    expect(result.startingCapital).toBe(75_000_000)
    expect(result.cashBalance).toBe(75_000_000)
    expect(result.totalValue).toBe(75_000_000)
  })

  it('sets optional strategy', () => {
    const result = createPortfolio('Test', 50_000_000, 'growth')
    expect(result.strategy).toBe('growth')
  })

  it('sets optional description', () => {
    const result = createPortfolio('Test', 50_000_000, 'growth', 'My description')
    expect(result.description).toBe('My description')
  })

  it('initializes with zero ROI', () => {
    const result = createPortfolio('Test', 50_000_000)
    expect(result.roi).toBe(0)
  })

  it('initializes with empty holdings', () => {
    const result = createPortfolio('Test', 50_000_000)
    expect(result.holdings).toEqual([])
  })

  it('creates inactive portfolio', () => {
    const result = createPortfolio('Test', 50_000_000)
    expect(result.isActive).toBe(false)
  })

  it('generates unique id with timestamp', () => {
    const result = createPortfolio('Test', 50_000_000)
    expect(result.id).toMatch(/^portfolio-\d+$/)
  })

  it('sets current timestamp as createdAt', () => {
    const before = new Date()
    const result = createPortfolio('Test', 50_000_000)
    const after = new Date()

    const createdAt = new Date(result.createdAt)
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('deletePortfolio', () => {
  it('removes portfolio from array', () => {
    const portfolios = [...mockPortfolios]
    const toDelete = portfolios[1].id
    const result = deletePortfolio(portfolios, toDelete)

    expect(result.length).toBe(portfolios.length - 1)
    expect(result.find(p => p.id === toDelete)).toBeUndefined()
  })

  it('preserves other portfolios', () => {
    const portfolios = [...mockPortfolios]
    const toDelete = portfolios[1].id
    const result = deletePortfolio(portfolios, toDelete)

    portfolios.forEach(p => {
      if (p.id !== toDelete) {
        expect(result.find(r => r.id === p.id)).toBeDefined()
      }
    })
  })

  it('activates first portfolio if active one is deleted', () => {
    const portfolios: Portfolio[] = [
      { ...mockPortfolios[0], isActive: false },
      { ...mockPortfolios[1], isActive: true },
    ]
    const result = deletePortfolio(portfolios, portfolios[1].id)

    expect(result[0].isActive).toBe(true)
  })

  it('does not change active status if non-active portfolio is deleted', () => {
    const portfolios: Portfolio[] = [
      { ...mockPortfolios[0], isActive: true },
      { ...mockPortfolios[1], isActive: false },
    ]
    const result = deletePortfolio(portfolios, portfolios[1].id)

    expect(result[0].isActive).toBe(true)
  })

  it('returns empty array when deleting last portfolio', () => {
    const portfolios: Portfolio[] = [mockPortfolios[0]]
    const result = deletePortfolio(portfolios, portfolios[0].id)

    expect(result).toEqual([])
  })

  it('handles non-existent id gracefully', () => {
    const portfolios = [...mockPortfolios]
    const result = deletePortfolio(portfolios, 'non-existent')

    expect(result.length).toBe(portfolios.length)
  })
})

describe('switchActivePortfolio', () => {
  it('sets specified portfolio as active', () => {
    const portfolios = [...mockPortfolios]
    const newActiveId = portfolios[1].id
    const result = switchActivePortfolio(portfolios, newActiveId)

    const newActive = result.find(p => p.id === newActiveId)
    expect(newActive?.isActive).toBe(true)
  })

  it('deactivates all other portfolios', () => {
    const portfolios = [...mockPortfolios]
    const newActiveId = portfolios[1].id
    const result = switchActivePortfolio(portfolios, newActiveId)

    result.forEach(portfolio => {
      if (portfolio.id !== newActiveId) {
        expect(portfolio.isActive).toBe(false)
      }
    })
  })

  it('exactly one portfolio is active after switch', () => {
    const portfolios = [...mockPortfolios]
    const result = switchActivePortfolio(portfolios, portfolios[2].id)

    const activeCount = result.filter(p => p.isActive).length
    expect(activeCount).toBe(1)
  })

  it('preserves portfolio count', () => {
    const portfolios = [...mockPortfolios]
    const result = switchActivePortfolio(portfolios, portfolios[1].id)

    expect(result.length).toBe(portfolios.length)
  })

  it('handles non-existent id (all become inactive)', () => {
    const portfolios = [...mockPortfolios]
    const result = switchActivePortfolio(portfolios, 'non-existent')

    const activeCount = result.filter(p => p.isActive).length
    expect(activeCount).toBe(0)
  })
})

describe('getPortfolioSummaries', () => {
  it('returns correct number of summaries', () => {
    const result = getPortfolioSummaries(mockPortfolios)
    expect(result.length).toBe(mockPortfolios.length)
  })

  it('summaries contain required fields', () => {
    const result = getPortfolioSummaries(mockPortfolios)

    result.forEach(summary => {
      expect(summary).toHaveProperty('id')
      expect(summary).toHaveProperty('name')
      expect(summary).toHaveProperty('totalValue')
      expect(summary).toHaveProperty('roi')
      expect(summary).toHaveProperty('isActive')
    })
  })

  it('summaries do not contain holdings', () => {
    const result = getPortfolioSummaries(mockPortfolios)

    result.forEach(summary => {
      expect(summary).not.toHaveProperty('holdings')
      expect(summary).not.toHaveProperty('cashBalance')
      expect(summary).not.toHaveProperty('startingCapital')
    })
  })

  it('preserves strategy in summary', () => {
    const result = getPortfolioSummaries(mockPortfolios)

    result.forEach((summary, index) => {
      expect(summary.strategy).toBe(mockPortfolios[index].strategy)
    })
  })
})

describe('getTotalPortfoliosValue', () => {
  it('sums all portfolio values', () => {
    const result = getTotalPortfoliosValue(mockPortfolios)
    const expected = mockPortfolios.reduce((sum, p) => sum + p.totalValue, 0)
    expect(result).toBe(expected)
  })

  it('returns 0 for empty array', () => {
    const result = getTotalPortfoliosValue([])
    expect(result).toBe(0)
  })

  it('returns single portfolio value for array of one', () => {
    const result = getTotalPortfoliosValue([mockPortfolios[0]])
    expect(result).toBe(mockPortfolios[0].totalValue)
  })
})

describe('getCombinedROI', () => {
  it('calculates weighted average ROI', () => {
    const result = getCombinedROI(mockPortfolios)
    expect(typeof result).toBe('number')
  })

  it('returns 0 for empty array', () => {
    const result = getCombinedROI([])
    expect(result).toBe(0)
  })

  it('returns single portfolio ROI for array of one', () => {
    const result = getCombinedROI([mockPortfolios[0]])
    expect(result).toBeCloseTo(mockPortfolios[0].roi, 5)
  })

  it('weights by portfolio value', () => {
    const portfolios: Portfolio[] = [
      { ...mockPortfolios[0], totalValue: 100, roi: 10 },
      { ...mockPortfolios[1], totalValue: 100, roi: 20 },
    ]
    const result = getCombinedROI(portfolios)
    
    // Equal weights, so average should be 15
    expect(result).toBeCloseTo(15, 5)
  })

  it('higher value portfolio has more weight', () => {
    const portfolios: Portfolio[] = [
      { ...mockPortfolios[0], totalValue: 900, roi: 10 },
      { ...mockPortfolios[1], totalValue: 100, roi: 100 },
    ]
    const result = getCombinedROI(portfolios)
    
    // 900/1000 * 10 + 100/1000 * 100 = 9 + 10 = 19
    expect(result).toBeCloseTo(19, 5)
  })
})
