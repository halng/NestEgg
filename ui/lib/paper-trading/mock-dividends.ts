export interface Dividend {
  id: string
  ticker: string
  exDate: string
  payDate: string
  amountPerShare: number
  shares: number
  totalAmount: number
  status: 'upcoming' | 'paid'
}

export interface DividendCalendarEntry {
  ticker: string
  companyName: string
  exDate: string
  payDate: string
  amountPerShare: number
  yield: number
}

export const mockDividendCalendar: DividendCalendarEntry[] = [
  {
    ticker: 'VCB',
    companyName: 'Vietcombank',
    exDate: '2024-02-15',
    payDate: '2024-03-01',
    amountPerShare: 1500,
    yield: 1.7,
  },
  {
    ticker: 'VNM',
    companyName: 'Vinamilk',
    exDate: '2024-02-20',
    payDate: '2024-03-10',
    amountPerShare: 2000,
    yield: 2.8,
  },
  {
    ticker: 'FPT',
    companyName: 'FPT Corporation',
    exDate: '2024-03-01',
    payDate: '2024-03-15',
    amountPerShare: 1000,
    yield: 0.9,
  },
  {
    ticker: 'GAS',
    companyName: 'PV Gas',
    exDate: '2024-03-10',
    payDate: '2024-03-25',
    amountPerShare: 3000,
    yield: 3.2,
  },
  {
    ticker: 'TCB',
    companyName: 'Techcombank',
    exDate: '2024-03-20',
    payDate: '2024-04-05',
    amountPerShare: 800,
    yield: 2.2,
  },
]

export const mockReceivedDividends: Dividend[] = [
  {
    id: 'div-001',
    ticker: 'FPT',
    exDate: '2024-01-05',
    payDate: '2024-01-20',
    amountPerShare: 1000,
    shares: 200,
    totalAmount: 200000,
    status: 'paid',
  },
  {
    id: 'div-002',
    ticker: 'VCB',
    exDate: '2023-12-15',
    payDate: '2024-01-05',
    amountPerShare: 1500,
    shares: 150,
    totalAmount: 225000,
    status: 'paid',
  },
]

export function calculateUpcomingDividends(
  holdings: { ticker: string; shares: number }[],
  calendar: DividendCalendarEntry[]
): Dividend[] {
  const upcoming: Dividend[] = []
  
  holdings.forEach(holding => {
    const calendarEntry = calendar.find(c => c.ticker === holding.ticker)
    if (calendarEntry) {
      upcoming.push({
        id: `div-upcoming-${holding.ticker}`,
        ticker: holding.ticker,
        exDate: calendarEntry.exDate,
        payDate: calendarEntry.payDate,
        amountPerShare: calendarEntry.amountPerShare,
        shares: holding.shares,
        totalAmount: calendarEntry.amountPerShare * holding.shares,
        status: 'upcoming',
      })
    }
  })
  
  return upcoming.sort((a, b) => new Date(a.exDate).getTime() - new Date(b.exDate).getTime())
}
