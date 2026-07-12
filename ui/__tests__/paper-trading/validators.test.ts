import { validateOrder, calculateOrderValue } from '@/lib/paper-trading/validators'
import type { PlaceOrderRequest, PaperTradingHolding } from '@/lib/paper-trading/types'

describe('validateOrder', () => {
  const mockHoldings: PaperTradingHolding[] = [
    {
      ticker: 'FPT',
      shares: 200,
      averageCost: 108000,
      currentPrice: 112500,
      marketValue: 22500000,
      unrealizedPnl: 900000,
      sector: 'Technology'
    }
  ]

  describe('buy orders', () => {
    it('validates a valid market buy order', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for insufficient funds', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 1000,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 10_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Insufficient funds'))
    })

    it('warns when order uses more than 90% of buying power', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 12_000_000, mockHoldings, 112500)
      
      expect(result.warnings).toContainEqual(expect.stringContaining('90%'))
    })

    it('warns for non-standard lot sizes', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 75,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.warnings).toContainEqual(expect.stringContaining('lots of 100'))
    })
  })

  describe('sell orders', () => {
    it('validates a valid sell order', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'MARKET',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
    })

    it('returns error when selling more shares than owned', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'MARKET',
        shares: 500,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Insufficient shares'))
    })

    it('returns error when selling stock not owned', () => {
      const order: PlaceOrderRequest = {
        ticker: 'VCB',
        side: 'SELL',
        orderType: 'MARKET',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 89000)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Insufficient shares'))
    })
  })

  describe('limit orders', () => {
    it('requires limit price for limit orders', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'LIMIT',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Limit price is required'))
    })

    it('validates limit order with price', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'LIMIT',
        shares: 100,
        limitPrice: 110000,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
    })

    it('warns for limit price far from current price', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'LIMIT',
        shares: 100,
        limitPrice: 80000,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.warnings).toContainEqual(expect.stringContaining('15%'))
    })
  })

  describe('stop orders', () => {
    it('requires stop price for stop orders', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'STOP',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Stop price is required'))
    })

    it('validates stop order with stop price', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'STOP',
        shares: 100,
        stopPrice: 105000,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('stop-limit orders', () => {
    it('requires both stop and limit prices', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'STOP_LIMIT',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(2)
    })

    it('validates stop-limit order with both prices', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'STOP_LIMIT',
        shares: 100,
        stopPrice: 115000,
        limitPrice: 116000,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
    })
  })

  describe('trailing stop orders', () => {
    it('requires trail percent for trailing stop', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'TRAILING_STOP',
        shares: 100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('Trail percentage'))
    })

    it('validates trail percent within range', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'TRAILING_STOP',
        shares: 100,
        trailPercent: 5,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(true)
    })

    it('rejects trail percent over 20%', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'SELL',
        orderType: 'TRAILING_STOP',
        shares: 100,
        trailPercent: 25,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
    })
  })

  describe('shares validation', () => {
    it('rejects zero shares', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: 0,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(expect.stringContaining('greater than 0'))
    })

    it('rejects negative shares', () => {
      const order: PlaceOrderRequest = {
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        shares: -100,
        timeInForce: 'DAY'
      }
      
      const result = validateOrder(order, 50_000_000, mockHoldings, 112500)
      
      expect(result.isValid).toBe(false)
    })
  })
})

describe('calculateOrderValue', () => {
  it('calculates buy order value with fees', () => {
    const result = calculateOrderValue(100, 112500, 'BUY')
    
    expect(result.value).toBe(11250000)
    expect(result.fees).toBe(16875)
    expect(result.total).toBe(11266875)
  })

  it('calculates sell order value with fees deducted', () => {
    const result = calculateOrderValue(100, 112500, 'SELL')
    
    expect(result.value).toBe(11250000)
    expect(result.fees).toBe(16875)
    expect(result.total).toBe(11233125)
  })

  it('handles small orders', () => {
    const result = calculateOrderValue(10, 25000, 'BUY')
    
    expect(result.value).toBe(250000)
    expect(result.fees).toBe(375)
    expect(result.total).toBe(250375)
  })
})
