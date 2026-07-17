import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceAlertForm } from '@/components/paper-trading/PriceAlertForm'
import type { PaperTradingMarketTicker } from '@/lib/paper-trading/types'

const mockMarketWatch: PaperTradingMarketTicker[] = [
  { ticker: 'FPT', name: 'FPT Corporation', price: 100000, change: 2000, changePercent: 2.04 },
  { ticker: 'VCB', name: 'Vietcombank', price: 90000, change: -1000, changePercent: -1.1 },
  { ticker: 'VNM', name: 'Vinamilk', price: 75000, change: 500, changePercent: 0.67 },
]

describe('PriceAlertForm', () => {
  const defaultProps = {
    marketWatch: mockMarketWatch,
    onCreateAlert: jest.fn(),
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed state with create button', () => {
    render(<PriceAlertForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /create price alert/i })).toBeInTheDocument()
  })

  it('expands form when create button is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    expect(screen.getByText('New Price Alert')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders ticker selector with all market watch stocks', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    const select = screen.getByRole('combobox')
    const options = within(select).getAllByRole('option')

    expect(options).toHaveLength(3)
    expect(options[0]).toHaveTextContent('FPT')
    expect(options[1]).toHaveTextContent('VCB')
    expect(options[2]).toHaveTextContent('VNM')
  })

  it('renders condition buttons (Above, Below, Crosses)', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    expect(screen.getByRole('button', { name: /^above$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^below$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^crosses$/i })).toBeInTheDocument()
  })

  it('renders price input field', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    expect(screen.getByText('Target Price')).toBeInTheDocument()
  })

  it('submit button is disabled when target price is not set', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    const submitButton = screen.getByRole('button', { name: /create alert$/i })
    expect(submitButton).toBeDisabled()
  })

  it('submit button is enabled when all fields are valid', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))
    
    const priceInput = screen.getByLabelText(/target price/i)
    await user.clear(priceInput)
    await user.type(priceInput, '105000')

    const submitButton = screen.getByRole('button', { name: /create alert$/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onCreateAlert with correct data on form submit', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'VCB')

    await user.click(screen.getByRole('button', { name: /^below$/i }))

    const priceInput = screen.getByLabelText(/target price/i)
    await user.clear(priceInput)
    await user.type(priceInput, '85000')

    const submitButton = screen.getByRole('button', { name: /create alert$/i })
    await user.click(submitButton)

    expect(defaultProps.onCreateAlert).toHaveBeenCalledWith({
      ticker: 'VCB',
      condition: 'BELOW',
      targetPrice: 85000,
    })
  })

  it('selects ABOVE condition by default', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    expect(screen.getByText('Alert when price rises above target')).toBeInTheDocument()
  })

  it('changes condition when condition button is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))
    await user.click(screen.getByRole('button', { name: /^below$/i }))

    expect(screen.getByText('Alert when price falls below target')).toBeInTheDocument()
  })

  it('shows current price info for selected stock', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    expect(screen.getByText('Current Price')).toBeInTheDocument()
  })

  it('collapses form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))
    expect(screen.getByText('New Price Alert')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText('New Price Alert')).not.toBeInTheDocument()
  })

  it('disables create button when disabled prop is true', () => {
    render(<PriceAlertForm {...defaultProps} disabled />)

    expect(screen.getByRole('button', { name: /create price alert/i })).toBeDisabled()
  })

  it('resets form after successful submit', async () => {
    const user = userEvent.setup()
    render(<PriceAlertForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create price alert/i }))

    const priceInput = screen.getByLabelText(/target price/i)
    await user.clear(priceInput)
    await user.type(priceInput, '105000')

    await user.click(screen.getByRole('button', { name: /create alert$/i }))

    expect(screen.queryByText('New Price Alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create price alert/i })).toBeInTheDocument()
  })
})
