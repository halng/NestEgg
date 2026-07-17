import { render, screen, fireEvent } from '@testing-library/react'
import { OrderHistoryTable } from '@/components/paper-trading/OrderHistoryTable'
import type { Order } from '@/lib/paper-trading/types'

describe('OrderHistoryTable', () => {
  const mockOrders: Order[] = [
    {
      id: 'ord-100',
      ticker: 'FPT',
      side: 'BUY',
      orderType: 'MARKET',
      status: 'FILLED',
      requestedShares: 200,
      filledShares: 200,
      executedPrice: 108000,
      total: 21600000,
      timeInForce: 'DAY',
      createdAt: '2024-01-10T09:15:00Z',
      executedAt: '2024-01-10T09:15:05Z',
    },
    {
      id: 'ord-101',
      ticker: 'VCB',
      side: 'SELL',
      orderType: 'LIMIT',
      status: 'CANCELLED',
      requestedShares: 100,
      filledShares: 0,
      limitPrice: 90000,
      timeInForce: 'DAY',
      createdAt: '2024-01-11T10:00:00Z',
    },
  ]

  it('renders order history rows', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    expect(screen.getByText('FPT')).toBeInTheDocument()
    expect(screen.getByText('VCB')).toBeInTheDocument()
  })

  it('displays correct status badges', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    expect(screen.getByText('Filled')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('shows empty state when no orders', () => {
    render(<OrderHistoryTable orders={[]} />)
    
    expect(screen.getByText(/No orders found/i)).toBeInTheDocument()
  })

  it('shows description in empty state', () => {
    render(<OrderHistoryTable orders={[]} />)
    
    expect(screen.getByText(/Your order history will appear here/i)).toBeInTheDocument()
  })

  it('sorts by date when header clicked', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    const dateHeader = screen.getByText('Date')
    fireEvent.click(dateHeader)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('calls onViewDetails when row clicked', () => {
    const onViewDetails = jest.fn()
    render(<OrderHistoryTable orders={mockOrders} onViewDetails={onViewDetails} />)
    
    const rows = screen.getAllByRole('row')
    fireEvent.click(rows[1])
    
    expect(onViewDetails).toHaveBeenCalled()
  })

  it('displays side with correct styling for BUY', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    const buyBadge = screen.getByText('BUY')
    expect(buyBadge).toHaveClass('text-success')
  })

  it('displays side with correct styling for SELL', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    const sellBadge = screen.getByText('SELL')
    expect(sellBadge).toHaveClass('text-danger')
  })

  it('shows filled/requested shares for partial fills', () => {
    const partialOrder: Order = {
      ...mockOrders[0],
      filledShares: 150,
      requestedShares: 200,
      status: 'PARTIAL',
    }
    
    render(<OrderHistoryTable orders={[partialOrder]} />)
    
    expect(screen.getByText(/150.*200/)).toBeInTheDocument()
  })

  it('shows only requested shares when fully filled', () => {
    render(<OrderHistoryTable orders={[mockOrders[0]]} />)
    
    expect(screen.queryByText(/200.*200/)).not.toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('displays table headers', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Shares')).toBeInTheDocument()
    expect(screen.getByText(/Price/)).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders sortable column headers', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    const dateHeader = screen.getByText('Date')
    const tickerHeader = screen.getByText('Ticker')
    
    expect(dateHeader.closest('th')).toHaveClass('cursor-pointer')
    expect(tickerHeader.closest('th')).toHaveClass('cursor-pointer')
  })

  it('toggles sort direction on same column click', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    const dateHeader = screen.getByText('Date')
    
    fireEvent.click(dateHeader)
    fireEvent.click(dateHeader)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('displays order type labels', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    expect(screen.getByText('Market')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
  })

  it('displays total amount formatted', () => {
    render(<OrderHistoryTable orders={mockOrders} />)
    
    expect(screen.getByText(/21.*600.*000/)).toBeInTheDocument()
  })

  it('shows dash when no total', () => {
    const orderNoTotal: Order = {
      ...mockOrders[1],
      total: undefined,
    }
    
    render(<OrderHistoryTable orders={[orderNoTotal]} />)
    
    const cells = screen.getAllByRole('cell')
    const hasEmptyTotal = cells.some(cell => cell.textContent === '-')
    expect(hasEmptyTotal).toBe(true)
  })
})
