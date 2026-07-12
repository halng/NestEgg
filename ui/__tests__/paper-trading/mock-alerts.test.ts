import {
  mockPriceAlerts,
  generateAlertId,
} from '@/lib/paper-trading/mock-alerts'
import type { PriceAlert, AlertCondition } from '@/lib/paper-trading/types'

describe('mockPriceAlerts', () => {
  it('contains price alerts', () => {
    expect(mockPriceAlerts.length).toBeGreaterThan(0)
  })

  it('has valid alert structure', () => {
    mockPriceAlerts.forEach(alert => {
      expect(alert.id).toBeTruthy()
      expect(alert.ticker).toBeTruthy()
      expect(alert.condition).toBeTruthy()
      expect(typeof alert.targetPrice).toBe('number')
      expect(alert.targetPrice).toBeGreaterThan(0)
      expect(typeof alert.isActive).toBe('boolean')
      expect(alert.createdAt).toBeTruthy()
    })
  })

  it('has valid alert conditions', () => {
    const validConditions: AlertCondition[] = ['ABOVE', 'BELOW', 'CROSS']
    
    mockPriceAlerts.forEach(alert => {
      expect(validConditions).toContain(alert.condition)
    })
  })

  it('contains both active and inactive alerts', () => {
    const activeAlerts = mockPriceAlerts.filter(a => a.isActive)
    const inactiveAlerts = mockPriceAlerts.filter(a => !a.isActive)
    
    expect(activeAlerts.length).toBeGreaterThan(0)
    expect(inactiveAlerts.length).toBeGreaterThan(0)
  })

  it('inactive alerts have triggeredAt timestamp', () => {
    const inactiveAlerts = mockPriceAlerts.filter(a => !a.isActive)
    
    inactiveAlerts.forEach(alert => {
      expect(alert.triggeredAt).toBeTruthy()
    })
  })

  it('has unique alert IDs', () => {
    const ids = mockPriceAlerts.map(a => a.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('has valid ISO date strings for createdAt', () => {
    mockPriceAlerts.forEach(alert => {
      const date = new Date(alert.createdAt)
      expect(date.toString()).not.toBe('Invalid Date')
    })
  })

  it('has valid ticker symbols', () => {
    mockPriceAlerts.forEach(alert => {
      expect(alert.ticker.length).toBeGreaterThan(0)
      expect(alert.ticker).toMatch(/^[A-Z]+$/)
    })
  })
})

describe('generateAlertId', () => {
  it('generates unique IDs', () => {
    const id1 = generateAlertId()
    const id2 = generateAlertId()
    const id3 = generateAlertId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('generates IDs with correct prefix', () => {
    const id = generateAlertId()
    expect(id).toMatch(/^alert-\d+$/)
  })

  it('generates incrementing IDs', () => {
    const id1 = generateAlertId()
    const id2 = generateAlertId()
    
    const num1 = parseInt(id1.split('-')[1])
    const num2 = parseInt(id2.split('-')[1])
    
    expect(num2).toBe(num1 + 1)
  })
})

describe('Alert Conditions', () => {
  it('has ABOVE condition alerts', () => {
    const aboveAlerts = mockPriceAlerts.filter(a => a.condition === 'ABOVE')
    expect(aboveAlerts.length).toBeGreaterThan(0)
  })

  it('has BELOW condition alerts', () => {
    const belowAlerts = mockPriceAlerts.filter(a => a.condition === 'BELOW')
    expect(belowAlerts.length).toBeGreaterThan(0)
  })

  it('has CROSS condition alerts', () => {
    const crossAlerts = mockPriceAlerts.filter(a => a.condition === 'CROSS')
    expect(crossAlerts.length).toBeGreaterThan(0)
  })
})

describe('Alert Active States', () => {
  it('active alerts should not have triggeredAt', () => {
    const activeAlerts = mockPriceAlerts.filter(a => a.isActive)
    
    activeAlerts.forEach(alert => {
      expect(alert.triggeredAt).toBeUndefined()
    })
  })

  it('inactive alert triggeredAt should be after createdAt', () => {
    const inactiveAlerts = mockPriceAlerts.filter(a => !a.isActive && a.triggeredAt)
    
    inactiveAlerts.forEach(alert => {
      const createdAt = new Date(alert.createdAt).getTime()
      const triggeredAt = new Date(alert.triggeredAt!).getTime()
      expect(triggeredAt).toBeGreaterThan(createdAt)
    })
  })
})
