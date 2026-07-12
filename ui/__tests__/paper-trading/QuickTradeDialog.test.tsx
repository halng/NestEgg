import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickTradeDialog } from '@/components/paper-trading/QuickTradeDialog'
import type { PaperTradingHolding } from '@/lib/paper-trading/types'

const mockStock = {
  ticker: 'FPT',
  name: 'FPT Corporation',
  price: 100000,
  changePercent: 2.5,
  sector: 'Technology',
  exchange: 'HOSE',
}

const mockHoldings: PaperTradingHolding[] = [
  {
    ticker: 'FPT',
    name: 'FPT Corporation',
    shares: 500,
    averageCost: 95000,
    currentPrice: 100000,
    value: 50000000,
    unrealizedPnl: 2500000,
    unrealizedPnlPercent: 5.26,
  },
]

describe('QuickTradeDialog', () => {
  const defaultProps = {
    stock: mockStock,
    cashBalance: 100000000,
    holdings: mockHoldings,
    onClose: jest.fn(),
    onOrderSubmit: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with stock info pre-filled', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('FPT')).toBeInTheDocument()
    expect(screen.getByText('FPT Corporation')).toBeInTheDocument()
  })

  it('shows current price', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    const priceElements = screen.getAllByText(/100.*000|₫/i)
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it('shows price change percentage', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText(/2\.50%|\+2\.50%/)).toBeInTheDocument()
  })

  it('displays holding info if user holds stock', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText(/500.*shares held/i)).toBeInTheDocument()
    expect(screen.getByText(/avg/i)).toBeInTheDocument()
  })

  it('does not display holding info if user does not hold stock', () => {
    render(<QuickTradeDialog {...defaultProps} holdings={[]} />)

    expect(screen.queryByText(/shares held/i)).not.toBeInTheDocument()
  })

  it('renders order type selector', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('Order Type')).toBeInTheDocument()
    expect(screen.getByText('Market')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
  })

  it('renders quantity input', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('Quantity')).toBeInTheDocument()
  })

  it('renders buy button', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: /buy/i })).toBeInTheDocument()
  })

  it('renders sell button', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: /sell/i })).toBeInTheDocument()
  })

  it('sell button is disabled when user has no holdings', () => {
    render(<QuickTradeDialog {...defaultProps} holdings={[]} />)

    expect(screen.getByRole('button', { name: /sell/i })).toBeDisabled()
  })

  it('shows message when user cannot sell', () => {
    render(<QuickTradeDialog {...defaultProps} holdings={[]} />)

    expect(screen.getByText(/you don't hold any shares/i)).toBeInTheDocument()
  })

  it('shows validation errors when order is invalid', () => {
    render(<QuickTradeDialog {...defaultProps} cashBalance={0} />)

    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<QuickTradeDialog {...defaultProps} />)

    const backdrop = container.querySelector('.bg-black\\/60')!
    await user.click(backdrop)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose when X button clicked', async () => {
    const user = userEvent.setup()
    render(<QuickTradeDialog {...defaultProps} />)

    const closeButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg.lucide-x')
    )
    await user.click(closeButtons[0])

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows limit price input when limit order selected', async () => {
    const user = userEvent.setup()
    render(<QuickTradeDialog {...defaultProps} />)

    await user.click(screen.getByRole('radio', { name: /limit/i }))

    expect(screen.getByText('Limit Price')).toBeInTheDocument()
  })

  it('shows stop price input when stop order selected', async () => {
    const user = userEvent.setup()
    render(<QuickTradeDialog {...defaultProps} />)

    await user.click(screen.getByRole('radio', { name: /^stop trigger/i }))

    expect(screen.getByText('Stop Price')).toBeInTheDocument()
  })

  it('renders time in force selector', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('Time in Force')).toBeInTheDocument()
  })

  it('shows order summary with estimated value', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('Est. Value')).toBeInTheDocument()
    expect(screen.getByText('Est. Fees')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('shows available cash balance', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('Available Cash')).toBeInTheDocument()
  })

  it('returns null when stock is null', () => {
    const { container } = render(<QuickTradeDialog {...defaultProps} stock={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('shows exchange badge when stock has exchange', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText('HOSE')).toBeInTheDocument()
  })

  it('shows max shares for sell when user has holdings', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    expect(screen.getByText(/max for sell.*500/i)).toBeInTheDocument()
  })

  it('shows unrealized PnL for current holding', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    const pnlElement = screen.getByText(/2,500,000|₫2,500,000|\+₫2,500,000/i)
    expect(pnlElement).toBeInTheDocument()
  })

  it('shows buy button disabled when insufficient funds', () => {
    render(<QuickTradeDialog {...defaultProps} cashBalance={1000} />)

    expect(screen.getByRole('button', { name: /buy/i })).toBeDisabled()
  })

  it('shows positive price change with up indicator', () => {
    render(<QuickTradeDialog {...defaultProps} />)

    const trendingUpIcon = document.querySelector('svg.lucide-trending-up')
    expect(trendingUpIcon).toBeInTheDocument()
  })

  it('shows negative price change with down indicator', () => {
    const stockDown = { ...mockStock, changePercent: -3.5 }
    render(<QuickTradeDialog {...defaultProps} stock={stockDown} />)

    const trendingDownIcon = document.querySelector('svg.lucide-trending-down')
    expect(trendingDownIcon).toBeInTheDocument()
  })

  it('shows confirmation dialog when buy button clicked', async () => {
    const user = userEvent.setup()
    render(<QuickTradeDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /buy/i }))

    expect(screen.getAllByText(/confirm/i).length).toBeGreaterThan(0)
  })

  it('shows confirmation dialog when sell button clicked', async () => {
    const user = userEvent.setup()
    render(<QuickTradeDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sell/i }))

    expect(screen.getAllByText(/confirm/i).length).toBeGreaterThan(0)
  })
})
