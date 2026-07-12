import { render, screen } from '@testing-library/react'
import { TradeStatistics } from '@/components/paper-trading/TradeStatistics'
import type { Order } from '@/lib/paper-trading/types'

const mockOrders: Order[] = [
  {
    id: 'ord-001',
    ticker: 'FPT',
    side: 'BUY',
    orderType: 'MARKET',
    status: 'FILLED',
    requestedShares: 100,
    filledShares: 100,
    executedPrice: 100000,
    total: 10000000,
    timeInForce: 'DAY',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-002',
    ticker: 'FPT',
    side: 'SELL',
    orderType: 'LIMIT',
    status: 'FILLED',
    requestedShares: 50,
    filledShares: 50,
    limitPrice: 105000,
    executedPrice: 105000,
    total: 5250000,
    timeInForce: 'GTC',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-003',
    ticker: 'VCB',
    side: 'BUY',
    orderType: 'MARKET',
    status: 'FILLED',
    requestedShares: 200,
    filledShares: 200,
    executedPrice: 90000,
    total: 18000000,
    timeInForce: 'DAY',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-004',
    ticker: 'HPG',
    side: 'BUY',
    orderType: 'LIMIT',
    status: 'PENDING',
    requestedShares: 100,
    filledShares: 0,
    limitPrice: 25000,
    timeInForce: 'GTC',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

describe('TradeStatistics', () => {
  it('renders statistics header', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('Trade Statistics')).toBeInTheDocument()
  })

  it('renders all statistics cards', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('Total Bought')).toBeInTheDocument()
    expect(screen.getByText('Total Sold')).toBeInTheDocument()
    expect(screen.getByText('Avg Order Size')).toBeInTheDocument()
    expect(screen.getByText('Trading Frequency')).toBeInTheDocument()
  })

  it('displays correct total bought value', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('2 orders')).toBeInTheDocument()
  })

  it('displays correct total sold value', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('1 orders')).toBeInTheDocument()
  })

  it('calculates and displays average order size', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('3 total trades')).toBeInTheDocument()
  })

  it('calculates trading frequency correctly', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText(/\/week/)).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })

  it('shows most traded stocks section', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('Most Traded Stocks')).toBeInTheDocument()
    expect(screen.getByText('FPT')).toBeInTheDocument()
  })

  it('shows trade count for most traded stocks', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('2 trades')).toBeInTheDocument()
    expect(screen.getByText('1 trades')).toBeInTheDocument()
  })

  it('handles empty orders array', () => {
    render(<TradeStatistics orders={[]} />)

    expect(screen.getByText('Trade Statistics')).toBeInTheDocument()
    expect(screen.getAllByText('0 orders').length).toBeGreaterThan(0)
    expect(screen.getByText('0 total trades')).toBeInTheDocument()
  })

  it('only counts filled orders', () => {
    render(<TradeStatistics orders={mockOrders} />)

    expect(screen.getByText('3 total trades')).toBeInTheDocument()
  })

  it('does not show most traded stocks when no filled orders', () => {
    const pendingOrders: Order[] = [
      {
        id: 'ord-001',
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'LIMIT',
        status: 'PENDING',
        requestedShares: 100,
        filledShares: 0,
        limitPrice: 100000,
        timeInForce: 'GTC',
        createdAt: new Date().toISOString(),
      },
    ]

    render(<TradeStatistics orders={pendingOrders} />)

    expect(screen.queryByText('Most Traded Stocks')).not.toBeInTheDocument()
  })

  it('handles orders with null total values', () => {
    const ordersWithNullTotal: Order[] = [
      {
        id: 'ord-001',
        ticker: 'FPT',
        side: 'BUY',
        orderType: 'MARKET',
        status: 'FILLED',
        requestedShares: 100,
        filledShares: 100,
        executedPrice: 100000,
        total: undefined,
        timeInForce: 'DAY',
        createdAt: new Date().toISOString(),
      },
    ]

    render(<TradeStatistics orders={ordersWithNullTotal} />)

    expect(screen.getByText('Trade Statistics')).toBeInTheDocument()
    expect(screen.getByText('1 total trades')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    render(<TradeStatistics orders={mockOrders} />)

    const currencyElements = screen.getAllByText(/₫|VND|,/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('highlights top traded stock', () => {
    render(<TradeStatistics orders={mockOrders} />)

    const topTicker = screen.getByText('FPT').closest('div')
    expect(topTicker).toHaveClass('bg-primary/10')
  })

  it('shows up to 3 most traded stocks', () => {
    const manyOrders: Order[] = [
      ...mockOrders,
      {
        id: 'ord-005',
        ticker: 'VNM',
        side: 'BUY',
        orderType: 'MARKET',
        status: 'FILLED',
        requestedShares: 100,
        filledShares: 100,
        executedPrice: 75000,
        total: 7500000,
        timeInForce: 'DAY',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ord-006',
        ticker: 'TCB',
        side: 'BUY',
        orderType: 'MARKET',
        status: 'FILLED',
        requestedShares: 100,
        filledShares: 100,
        executedPrice: 35000,
        total: 3500000,
        timeInForce: 'DAY',
        createdAt: new Date().toISOString(),
      },
    ]

    render(<TradeStatistics orders={manyOrders} />)

    expect(screen.getByText('Most Traded Stocks')).toBeInTheDocument()
  })
})
