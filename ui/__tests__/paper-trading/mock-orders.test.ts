import { 
  simulatePlaceOrder, 
  generateOrderId,
  mockPendingOrders,
  mockOrderHistory
} from '@/lib/paper-trading/mock-orders'
import type { PlaceOrderRequest } from '@/lib/paper-trading/types'

describe('simulatePlaceOrder', () => {
  it('creates a filled order for market orders', () => {
    const request: PlaceOrderRequest = {
      ticker: 'FPT',
      side: 'BUY',
      orderType: 'MARKET',
      shares: 100,
      timeInForce: 'DAY'
    }

    const order = simulatePlaceOrder(request)

    expect(order.id).toBeTruthy()
    expect(order.ticker).toBe('FPT')
    expect(order.side).toBe('BUY')
    expect(order.orderType).toBe('MARKET')
    expect(order.status).toBe('FILLED')
    expect(order.requestedShares).toBe(100)
    expect(order.filledShares).toBe(100)
    expect(order.executedAt).toBeTruthy()
  })

  it('creates a pending order for limit orders', () => {
    const request: PlaceOrderRequest = {
      ticker: 'VCB',
      side: 'BUY',
      orderType: 'LIMIT',
      shares: 200,
      limitPrice: 88000,
      timeInForce: 'GTC'
    }

    const order = simulatePlaceOrder(request)

    expect(order.status).toBe('PENDING')
    expect(order.filledShares).toBe(0)
    expect(order.limitPrice).toBe(88000)
    expect(order.executedAt).toBeUndefined()
  })

  it('creates a pending order for stop orders', () => {
    const request: PlaceOrderRequest = {
      ticker: 'TCB',
      side: 'SELL',
      orderType: 'STOP',
      shares: 150,
      stopPrice: 34000,
      timeInForce: 'DAY'
    }

    const order = simulatePlaceOrder(request)

    expect(order.status).toBe('PENDING')
    expect(order.stopPrice).toBe(34000)
  })

  it('preserves all order properties', () => {
    const request: PlaceOrderRequest = {
      ticker: 'HPG',
      side: 'BUY',
      orderType: 'STOP_LIMIT',
      shares: 300,
      stopPrice: 26000,
      limitPrice: 26500,
      timeInForce: 'GTC'
    }

    const order = simulatePlaceOrder(request)

    expect(order.stopPrice).toBe(26000)
    expect(order.limitPrice).toBe(26500)
    expect(order.timeInForce).toBe('GTC')
    expect(order.createdAt).toBeTruthy()
  })
})

describe('generateOrderId', () => {
  it('generates unique IDs', () => {
    const id1 = generateOrderId()
    const id2 = generateOrderId()
    const id3 = generateOrderId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('generates IDs with correct prefix', () => {
    const id = generateOrderId()
    expect(id).toMatch(/^ord-\d+$/)
  })
})

describe('mockPendingOrders', () => {
  it('contains pending orders', () => {
    expect(mockPendingOrders.length).toBeGreaterThan(0)
    mockPendingOrders.forEach(order => {
      expect(order.status).toBe('PENDING')
    })
  })

  it('has valid order structure', () => {
    mockPendingOrders.forEach(order => {
      expect(order.id).toBeTruthy()
      expect(order.ticker).toBeTruthy()
      expect(['BUY', 'SELL']).toContain(order.side)
      expect(order.requestedShares).toBeGreaterThan(0)
    })
  })
})

describe('mockOrderHistory', () => {
  it('contains various order statuses', () => {
    const statuses = new Set(mockOrderHistory.map(o => o.status))
    expect(statuses.size).toBeGreaterThan(1)
  })

  it('includes filled orders with execution details', () => {
    const filledOrders = mockOrderHistory.filter(o => o.status === 'FILLED')
    expect(filledOrders.length).toBeGreaterThan(0)
    filledOrders.forEach(order => {
      expect(order.executedAt).toBeTruthy()
      expect(order.filledShares).toBe(order.requestedShares)
    })
  })
})
