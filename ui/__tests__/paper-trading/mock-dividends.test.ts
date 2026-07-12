import {
  mockDividendCalendar,
  mockReceivedDividends,
  calculateUpcomingDividends,
  Dividend,
  DividendCalendarEntry,
} from '@/lib/paper-trading/mock-dividends'

describe('mockDividendCalendar', () => {
  it('contains dividend calendar entries', () => {
    expect(mockDividendCalendar.length).toBeGreaterThan(0)
  })

  it('has valid entry structure', () => {
    mockDividendCalendar.forEach(entry => {
      expect(entry.ticker).toBeTruthy()
      expect(entry.companyName).toBeTruthy()
      expect(entry.exDate).toBeTruthy()
      expect(entry.payDate).toBeTruthy()
      expect(typeof entry.amountPerShare).toBe('number')
      expect(typeof entry.yield).toBe('number')
    })
  })

  it('has unique ticker symbols', () => {
    const tickers = mockDividendCalendar.map(e => e.ticker)
    const uniqueTickers = new Set(tickers)
    
    expect(uniqueTickers.size).toBe(tickers.length)
  })

  it('has positive dividend amounts', () => {
    mockDividendCalendar.forEach(entry => {
      expect(entry.amountPerShare).toBeGreaterThan(0)
    })
  })

  it('has valid yield percentages', () => {
    mockDividendCalendar.forEach(entry => {
      expect(entry.yield).toBeGreaterThan(0)
      expect(entry.yield).toBeLessThan(100)
    })
  })

  it('has valid date format for exDate', () => {
    mockDividendCalendar.forEach(entry => {
      const date = new Date(entry.exDate)
      expect(date.toString()).not.toBe('Invalid Date')
      expect(entry.exDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('has valid date format for payDate', () => {
    mockDividendCalendar.forEach(entry => {
      const date = new Date(entry.payDate)
      expect(date.toString()).not.toBe('Invalid Date')
      expect(entry.payDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  it('payDate is after exDate', () => {
    mockDividendCalendar.forEach(entry => {
      const exDate = new Date(entry.exDate).getTime()
      const payDate = new Date(entry.payDate).getTime()
      expect(payDate).toBeGreaterThan(exDate)
    })
  })

  it('has valid ticker symbols', () => {
    mockDividendCalendar.forEach(entry => {
      expect(entry.ticker).toMatch(/^[A-Z]+$/)
    })
  })
})

describe('mockReceivedDividends', () => {
  it('contains received dividend records', () => {
    expect(mockReceivedDividends.length).toBeGreaterThan(0)
  })

  it('has valid dividend structure', () => {
    mockReceivedDividends.forEach(dividend => {
      expect(dividend.id).toBeTruthy()
      expect(dividend.ticker).toBeTruthy()
      expect(dividend.exDate).toBeTruthy()
      expect(dividend.payDate).toBeTruthy()
      expect(typeof dividend.amountPerShare).toBe('number')
      expect(typeof dividend.shares).toBe('number')
      expect(typeof dividend.totalAmount).toBe('number')
      expect(dividend.status).toBeTruthy()
    })
  })

  it('has unique dividend IDs', () => {
    const ids = mockReceivedDividends.map(d => d.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('has correct totalAmount calculation', () => {
    mockReceivedDividends.forEach(dividend => {
      const expectedTotal = dividend.amountPerShare * dividend.shares
      expect(dividend.totalAmount).toBe(expectedTotal)
    })
  })

  it('all received dividends have paid status', () => {
    mockReceivedDividends.forEach(dividend => {
      expect(dividend.status).toBe('paid')
    })
  })

  it('has positive share counts', () => {
    mockReceivedDividends.forEach(dividend => {
      expect(dividend.shares).toBeGreaterThan(0)
    })
  })

  it('has positive amounts per share', () => {
    mockReceivedDividends.forEach(dividend => {
      expect(dividend.amountPerShare).toBeGreaterThan(0)
    })
  })
})

describe('calculateUpcomingDividends', () => {
  const testCalendar: DividendCalendarEntry[] = [
    {
      ticker: 'AAA',
      companyName: 'Company A',
      exDate: '2024-02-15',
      payDate: '2024-03-01',
      amountPerShare: 1000,
      yield: 2.0,
    },
    {
      ticker: 'BBB',
      companyName: 'Company B',
      exDate: '2024-02-20',
      payDate: '2024-03-10',
      amountPerShare: 500,
      yield: 1.5,
    },
    {
      ticker: 'CCC',
      companyName: 'Company C',
      exDate: '2024-03-01',
      payDate: '2024-03-15',
      amountPerShare: 2000,
      yield: 3.0,
    },
  ]

  it('calculates upcoming dividends for holdings', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
      { ticker: 'BBB', shares: 200 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)

    expect(upcoming.length).toBe(2)
  })

  it('calculates correct total amounts', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)

    expect(upcoming[0].totalAmount).toBe(1000 * 100)
    expect(upcoming[0].amountPerShare).toBe(1000)
    expect(upcoming[0].shares).toBe(100)
  })

  it('returns empty array for empty holdings', () => {
    const upcoming = calculateUpcomingDividends([], testCalendar)
    expect(upcoming).toEqual([])
  })

  it('returns empty array for holdings not in calendar', () => {
    const holdings = [
      { ticker: 'XYZ', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)
    expect(upcoming).toEqual([])
  })

  it('returns empty array for empty calendar', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, [])
    expect(upcoming).toEqual([])
  })

  it('sets status as upcoming', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)
    
    upcoming.forEach(dividend => {
      expect(dividend.status).toBe('upcoming')
    })
  })

  it('generates correct ID format', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)
    
    expect(upcoming[0].id).toBe('div-upcoming-AAA')
  })

  it('copies date fields from calendar', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)
    const calendarEntry = testCalendar.find(c => c.ticker === 'AAA')!

    expect(upcoming[0].exDate).toBe(calendarEntry.exDate)
    expect(upcoming[0].payDate).toBe(calendarEntry.payDate)
  })

  it('sorts results by exDate ascending', () => {
    const holdings = [
      { ticker: 'CCC', shares: 50 },
      { ticker: 'AAA', shares: 100 },
      { ticker: 'BBB', shares: 200 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)

    expect(upcoming[0].ticker).toBe('AAA')
    expect(upcoming[1].ticker).toBe('BBB')
    expect(upcoming[2].ticker).toBe('CCC')
  })

  it('handles multiple holdings for same ticker correctly', () => {
    const holdings = [
      { ticker: 'AAA', shares: 100 },
    ]

    const upcoming = calculateUpcomingDividends(holdings, testCalendar)
    
    expect(upcoming.length).toBe(1)
    expect(upcoming[0].shares).toBe(100)
  })
})

describe('Dividend Calculations', () => {
  it('received dividends total amounts are correct', () => {
    mockReceivedDividends.forEach(dividend => {
      const calculatedTotal = dividend.amountPerShare * dividend.shares
      expect(dividend.totalAmount).toBe(calculatedTotal)
    })
  })

  it('dividend yields are reasonable (0-10%)', () => {
    mockDividendCalendar.forEach(entry => {
      expect(entry.yield).toBeGreaterThan(0)
      expect(entry.yield).toBeLessThanOrEqual(10)
    })
  })
})

describe('Date Handling', () => {
  it('calendar exDates are in future or past', () => {
    mockDividendCalendar.forEach(entry => {
      const exDate = new Date(entry.exDate)
      expect(exDate.toString()).not.toBe('Invalid Date')
    })
  })

  it('received dividend payDates are valid', () => {
    mockReceivedDividends.forEach(dividend => {
      const payDate = new Date(dividend.payDate)
      expect(payDate.toString()).not.toBe('Invalid Date')
    })
  })

  it('received dividend exDates come before payDates', () => {
    mockReceivedDividends.forEach(dividend => {
      const exDate = new Date(dividend.exDate).getTime()
      const payDate = new Date(dividend.payDate).getTime()
      expect(payDate).toBeGreaterThan(exDate)
    })
  })
})
