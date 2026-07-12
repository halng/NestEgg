import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PendingOrdersTable } from '@/components/paper-trading/PendingOrdersTable'
import type { Order } from '@/lib/paper-trading/types'

describe('PendingOrdersTable', () => {
  const mockOrders: Order[] = [
    {
      id: 'ord-001',
      ticker: 'FPT',
      side: 'BUY',
      orderType: 'LIMIT',
      status: 'PENDING',
      requestedShares: 100,
      filledShares: 0,
      limitPrice: 110000,
      timeInForce: 'GTC',
      createdAt: '2024-01-15T09:30:00Z',
    },
    {
      id: 'ord-002',
      ticker: 'VCB',
      side: 'SELL',
      orderType: 'STOP',
      status: 'PENDING',
      requestedShares: 50,
      filledShares: 0,
      stopPrice: 85000,
      timeInForce: 'DAY',
      createdAt: '2024-01-15T10:15:00Z',
    },
  ]

  const defaultProps = {
    orders: mockOrders,
    onModify: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders order rows', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByText('FPT')).toBeInTheDocument()
    expect(screen.getByText('VCB')).toBeInTheDocument()
  })

  it('displays order details correctly', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByText('BUY')).toBeInTheDocument()
    expect(screen.getByText('SELL')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
    expect(screen.getByText('Stop')).toBeInTheDocument()
  })

  it('shows empty state when no orders', () => {
    render(<PendingOrdersTable {...defaultProps} orders={[]} />)
    
    expect(screen.getByText(/No pending orders/i)).toBeInTheDocument()
  })

  it('shows description in empty state', () => {
    render(<PendingOrdersTable {...defaultProps} orders={[]} />)
    
    expect(screen.getByText(/Limit and stop orders will appear here/i)).toBeInTheDocument()
  })

  it('calls onModify when modify button clicked', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    const modifyButtons = screen.getAllByRole('button')
    const firstModifyButton = modifyButtons[0]
    
    fireEvent.click(firstModifyButton)
    expect(defaultProps.onModify).toHaveBeenCalledWith(mockOrders[0])
  })

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = jest.fn().mockResolvedValue(undefined)
    render(<PendingOrdersTable {...defaultProps} onCancel={onCancel} />)
    
    const buttons = screen.getAllByRole('button')
    const cancelButton = buttons.find(btn => 
      btn.className.includes('text-danger')
    )
    
    if (cancelButton) {
      fireEvent.click(cancelButton)
      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledWith('ord-001')
      })
    }
  })

  it('formats shares with thousand separators', () => {
    const ordersWithLargeShares: Order[] = [{
      ...mockOrders[0],
      requestedShares: 10000,
    }]
    
    render(<PendingOrdersTable {...defaultProps} orders={ordersWithLargeShares} />)
    
    const sharesCell = screen.getByText('10.000')
    expect(sharesCell).toBeInTheDocument()
  })

  it('renders table with correct structure', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('displays table headers', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByText('Ticker')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Shares')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('displays formatted price for limit orders', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByText(/110.*000/)).toBeInTheDocument()
  })

  it('displays formatted price for stop orders', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    expect(screen.getByText(/85.*000/)).toBeInTheDocument()
  })

  it('shows BUY side with success styling', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    const buyBadge = screen.getByText('BUY')
    expect(buyBadge).toHaveClass('text-success')
  })

  it('shows SELL side with danger styling', () => {
    render(<PendingOrdersTable {...defaultProps} />)
    
    const sellBadge = screen.getByText('SELL')
    expect(sellBadge).toHaveClass('text-danger')
  })

  it('disables modify button when loading', () => {
    render(<PendingOrdersTable {...defaultProps} isLoading />)
    
    const buttons = screen.getAllByRole('button')
    const modifyButtons = buttons.filter(btn => !btn.className.includes('text-danger'))
    
    modifyButtons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })
})
