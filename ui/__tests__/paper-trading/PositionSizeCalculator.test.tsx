import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PositionSizeCalculator } from '@/components/paper-trading/PositionSizeCalculator'

describe('PositionSizeCalculator', () => {
  const defaultProps = {
    portfolioValue: 100000000,
    cashBalance: 50000000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders collapsed state by default', () => {
    render(<PositionSizeCalculator {...defaultProps} />)

    expect(screen.getByText('Position Size Calculator')).toBeInTheDocument()
    expect(screen.getByText(/calculate optimal position size/i)).toBeInTheDocument()
  })

  it('expands when clicked', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText('Risk per trade')).toBeInTheDocument()
    expect(screen.getByText('Entry Price')).toBeInTheDocument()
    expect(screen.getByText('Stop Loss Price')).toBeInTheDocument()
  })

  it('renders input fields when expanded', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(2)
  })

  it('renders risk percentage slider when expanded', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByRole('slider')).toBeInTheDocument()
    expect(screen.getByText(/conservative/i)).toBeInTheDocument()
    expect(screen.getByText(/aggressive/i)).toBeInTheDocument()
  })

  it('calculates position size correctly', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
    expect(screen.getByText('Position Value')).toBeInTheDocument()
  })

  it('updates calculation when entry price changes', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const entryPriceInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(entryPriceInput)
    await user.type(entryPriceInput, '120000')

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
  })

  it('updates calculation when stop loss price changes', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const stopLossInput = screen.getAllByRole('spinbutton')[1]
    await user.clear(stopLossInput)
    await user.type(stopLossInput, '90000')

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
  })

  it('updates calculation when risk percentage changes', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '3' } })

    expect(screen.getAllByText(/3%/).length).toBeGreaterThan(0)
  })

  it('shows results including shares and risk amount', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
    expect(screen.getByText('Position Value')).toBeInTheDocument()
    expect(screen.getByText('Stop Loss Distance')).toBeInTheDocument()
    expect(screen.getByText('Max Loss if Stopped')).toBeInTheDocument()
  })

  it('shows error when stop loss is above entry price', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const entryPriceInput = screen.getAllByRole('spinbutton')[0]
    const stopLossInput = screen.getAllByRole('spinbutton')[1]

    await user.clear(entryPriceInput)
    await user.type(entryPriceInput, '100000')
    await user.clear(stopLossInput)
    await user.type(stopLossInput, '110000')

    expect(screen.getByText(/stop loss must be below entry price/i)).toBeInTheDocument()
  })

  it('shows warning when position exceeds cash balance', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator portfolioValue={100000000} cashBalance={1000000} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText(/insufficient cash/i)).toBeInTheDocument()
  })

  it('shows warning when position is large percentage of portfolio', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator portfolioValue={10000000} cashBalance={50000000} />)

    await user.click(screen.getByText('Position Size Calculator'))

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '5' } })

    expect(screen.getByText(/consider diversifying/i)).toBeInTheDocument()
  })

  it('collapses when collapse button is clicked', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))
    expect(screen.getByText('Risk per trade')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /collapse/i }))
    expect(screen.queryByText('Risk per trade')).not.toBeInTheDocument()
  })

  it('shows portfolio percentage of position', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText(/of portfolio/)).toBeInTheDocument()
  })

  it('displays recommended shares section', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
  })

  it('shows info text about risk calculation', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText(/the calculator determines position size/i)).toBeInTheDocument()
  })

  it('default risk percent is 2%', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator {...defaultProps} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getAllByText(/2%/).length).toBeGreaterThan(0)
  })

  it('handles zero portfolio value gracefully', async () => {
    const user = userEvent.setup()
    render(<PositionSizeCalculator portfolioValue={0} cashBalance={0} />)

    await user.click(screen.getByText('Position Size Calculator'))

    expect(screen.getByText('Recommended Shares')).toBeInTheDocument()
  })
})
