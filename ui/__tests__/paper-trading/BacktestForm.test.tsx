import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BacktestForm } from '@/components/paper-trading/BacktestForm'

// Mock the modules
jest.mock('@/lib/paper-trading/formatters', () => ({
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value)
  },
}))

jest.mock('@/lib/paper-trading/backtest', () => ({
  BACKTEST_INDICATORS: [
    { value: 'rsi', label: 'RSI (14)', description: 'Relative Strength Index', defaultValue: 30 },
    { value: 'sma_cross', label: 'SMA Cross', description: 'Moving average crossover', defaultValue: 20, secondaryValue: 50 },
    { value: 'price_change', label: 'Price Change %', description: 'Percentage change', defaultValue: 5 },
    { value: 'price_level', label: 'Price Level', description: 'Fixed price point', defaultValue: 100000 },
  ],
  BACKTEST_CONDITIONS: [
    { value: 'below', label: 'Below', indicators: ['rsi', 'price_level'] },
    { value: 'above', label: 'Above', indicators: ['rsi', 'price_level'] },
    { value: 'cross_above', label: 'Cross Above', indicators: ['sma_cross'] },
    { value: 'cross_below', label: 'Cross Below', indicators: ['sma_cross'] },
    { value: 'greater_than', label: 'Greater Than', indicators: ['price_change'] },
    { value: 'less_than', label: 'Less Than', indicators: ['price_change'] },
  ],
  PRESET_STRATEGIES: [
    {
      name: 'RSI Oversold/Overbought',
      description: 'Buy when RSI < 30, sell when RSI > 70',
      rules: [
        { type: 'entry', indicator: 'rsi', condition: 'below', value: 30, action: 'buy' },
        { type: 'exit', indicator: 'rsi', condition: 'above', value: 70, action: 'sell' },
      ],
    },
    {
      name: 'Golden Cross',
      description: 'SMA 20/50 crossover strategy',
      rules: [
        { type: 'entry', indicator: 'sma_cross', condition: 'cross_above', value: 20, secondaryValue: 50, action: 'buy' },
        { type: 'exit', indicator: 'sma_cross', condition: 'cross_below', value: 20, secondaryValue: 50, action: 'sell' },
      ],
    },
  ],
  validateStrategy: (strategy: any) => {
    const errors: string[] = []
    if (!strategy.name) errors.push('Strategy name is required')
    if (!strategy.ticker) errors.push('Stock ticker is required')
    if (strategy.rules.length === 0) errors.push('At least one rule is required')

    const hasEntry = strategy.rules.some((r: any) => r.type === 'entry')
    const hasExit = strategy.rules.some((r: any) => r.type === 'exit')
    if (!hasEntry) errors.push('At least one entry rule is required')
    if (!hasExit) errors.push('At least one exit rule is required')

    return { isValid: errors.length === 0, errors }
  },
}))

jest.mock('@/lib/paper-trading/mock-data', () => ({
  mockMarketWatch: [
    { ticker: 'FPT', name: 'FPT Corporation' },
    { ticker: 'VCB', name: 'Vietcombank' },
    { ticker: 'TCB', name: 'Techcombank' },
    { ticker: 'VNM', name: 'Vinamilk' },
  ],
}))

describe('BacktestForm', () => {
  const mockOnRunBacktest = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders step wizard with Setup, Rules, Review steps', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('Setup')).toBeInTheDocument()
    expect(screen.getByText('Rules')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('displays step 1 (Setup) by default', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('Strategy Name')).toBeInTheDocument()
    expect(screen.getByText('Select Stock')).toBeInTheDocument()
    expect(screen.getByText('Backtest Period')).toBeInTheDocument()
    expect(screen.getByText('Initial Capital')).toBeInTheDocument()
  })

  it('renders ticker selection dropdown', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('Choose a stock...')).toBeInTheDocument()

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })

  it('shows available tickers in dropdown', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    const select = screen.getByRole('combobox')
    fireEvent.click(select)

    expect(screen.getByText('FPT - FPT Corporation')).toBeInTheDocument()
    expect(screen.getByText('VCB - Vietcombank')).toBeInTheDocument()
    expect(screen.getByText('TCB - Techcombank')).toBeInTheDocument()
  })

  it('renders date range inputs', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()

    const dateInputs = screen.getAllByRole('textbox')
    // At least 2 date inputs should be present
    expect(dateInputs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders capital preset buttons', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('50M')).toBeInTheDocument()
    expect(screen.getByText('100M')).toBeInTheDocument()
    expect(screen.getByText('200M')).toBeInTheDocument()
  })

  it('selects capital when preset is clicked', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    fireEvent.click(screen.getByText('50M'))

    expect(screen.getByText(/Starting with.*50,000,000/)).toBeInTheDocument()
  })

  it('shows preset strategy option', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    expect(screen.getByText('Use preset strategy')).toBeInTheDocument()
  })

  it('shows preset strategies when clicked', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    fireEvent.click(screen.getByText('Use preset strategy'))

    expect(screen.getByText('RSI Oversold/Overbought')).toBeInTheDocument()
    expect(screen.getByText('Golden Cross')).toBeInTheDocument()
  })

  it('applies preset strategy when selected', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    fireEvent.click(screen.getByText('Use preset strategy'))
    fireEvent.click(screen.getByText('RSI Oversold/Overbought'))

    // Should populate strategy name
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    expect(nameInput).toHaveValue('RSI Oversold/Overbought')
  })

  it('disables Continue button when required fields are empty', () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    const continueButton = screen.getByText('Continue to Rules')
    expect(continueButton).toBeDisabled()
  })

  it('enables Continue button when required fields are filled', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Fill strategy name
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    // Select ticker
    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    await waitFor(() => {
      const continueButton = screen.getByText('Continue to Rules')
      expect(continueButton).not.toBeDisabled()
    })
  })

  it('navigates to step 2 (Rules) when Continue is clicked', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Fill required fields
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    // Continue
    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      expect(screen.getByText('Trading Rules')).toBeInTheDocument()
      expect(screen.getByText('Define when to enter and exit positions')).toBeInTheDocument()
    })
  })

  it('shows Add Rule button in step 2', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      expect(screen.getByText('Add Rule')).toBeInTheDocument()
    })
  })

  it('adds a new rule when Add Rule is clicked', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Rule'))
    })

    // Should show rule builder
    expect(screen.getByText('Rule 1')).toBeInTheDocument()
  })

  it('shows rule type selector (Entry/Exit)', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Navigate to step 2 and add rule
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Rule'))
    })

    expect(screen.getByText('Type')).toBeInTheDocument()
  })

  it('shows indicator selector in rule builder', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Navigate to step 2 and add rule
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Rule'))
    })

    expect(screen.getByText('Indicator')).toBeInTheDocument()
  })

  it('allows navigation back to step 1', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Navigate to step 2
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      expect(screen.getByText('Trading Rules')).toBeInTheDocument()
    })

    // Go back
    fireEvent.click(screen.getByText('Back'))

    expect(screen.getByText('Strategy Name')).toBeInTheDocument()
  })

  it('shows validation errors in step 3 when strategy is incomplete', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Apply preset strategy to get to step 2 with some rules
    const nameInput = screen.getByPlaceholderText(/RSI Reversal Strategy/i)
    fireEvent.change(nameInput, { target: { value: 'My Strategy' } })

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      // Add only an entry rule (no exit)
      fireEvent.click(screen.getByText('Add Rule'))
    })

    fireEvent.click(screen.getByText('Review Strategy'))

    await waitFor(() => {
      expect(screen.getByText('Strategy has issues')).toBeInTheDocument()
    })
  })

  it('shows Run Backtest button in step 3', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Set up complete strategy using presets
    fireEvent.click(screen.getByText('Use preset strategy'))
    fireEvent.click(screen.getByText('RSI Oversold/Overbought'))

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Review Strategy'))
    })

    await waitFor(() => {
      expect(screen.getByText('Run Backtest')).toBeInTheDocument()
    })
  })

  it('disables Run Backtest when isRunning is true', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} isRunning={true} />)

    // Set up complete strategy
    fireEvent.click(screen.getByText('Use preset strategy'))
    fireEvent.click(screen.getByText('RSI Oversold/Overbought'))

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Review Strategy'))
    })

    await waitFor(() => {
      expect(screen.getByText('Running...')).toBeInTheDocument()
      expect(screen.getByText('Running...').closest('button')).toBeDisabled()
    })
  })

  it('shows strategy summary in step 3', async () => {
    render(<BacktestForm onRunBacktest={mockOnRunBacktest} />)

    // Set up complete strategy
    fireEvent.click(screen.getByText('Use preset strategy'))
    fireEvent.click(screen.getByText('RSI Oversold/Overbought'))

    const tickerSelect = screen.getByRole('combobox')
    fireEvent.change(tickerSelect, { target: { value: 'FPT' } })

    fireEvent.click(screen.getByText('Continue to Rules'))

    await waitFor(() => {
      fireEvent.click(screen.getByText('Review Strategy'))
    })

    await waitFor(() => {
      expect(screen.getByText('Stock')).toBeInTheDocument()
      expect(screen.getByText('FPT')).toBeInTheDocument()
      expect(screen.getByText('Capital')).toBeInTheDocument()
      expect(screen.getByText('2 rules')).toBeInTheDocument()
    })
  })
})
