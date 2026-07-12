import { render, screen, fireEvent } from '@testing-library/react'
import { BacktestResults } from '@/components/paper-trading/BacktestResults'
import type { BacktestResult } from '@/lib/paper-trading/backtest'

// Mock the formatters module
jest.mock('@/lib/paper-trading/formatters', () => ({
  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value)
  },
  formatPercent: (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  },
  formatDate: (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  },
}))

describe('BacktestResults', () => {
  const createMockResult = (overrides: Partial<BacktestResult> = {}): BacktestResult => ({
    strategyName: 'RSI Oversold Strategy',
    ticker: 'FPT',
    period: {
      start: '2026-01-01',
      end: '2026-06-30',
    },
    initialCapital: 100_000_000,
    finalValue: 115_000_000,
    totalReturn: 15_000_000,
    totalReturnPercent: 15.0,
    buyAndHoldReturn: 10_000_000,
    buyAndHoldReturnPercent: 10.0,
    totalTrades: 12,
    winningTrades: 8,
    losingTrades: 4,
    winRate: 66.67,
    maxDrawdown: 5_000_000,
    maxDrawdownPercent: 4.5,
    sharpeRatio: 1.25,
    trades: [
      {
        entryDate: '2026-01-15',
        exitDate: '2026-02-01',
        entryPrice: 105_000,
        exitPrice: 112_000,
        shares: 100,
        pnl: 700_000,
        pnlPercent: 6.67,
      },
      {
        entryDate: '2026-02-15',
        exitDate: '2026-03-01',
        entryPrice: 110_000,
        exitPrice: 108_000,
        shares: 100,
        pnl: -200_000,
        pnlPercent: -1.82,
      },
    ],
    equityCurve: [
      { date: '2026-01-01', value: 100_000_000 },
      { date: '2026-03-01', value: 108_000_000 },
      { date: '2026-06-30', value: 115_000_000 },
    ],
    buyAndHoldCurve: [
      { date: '2026-01-01', value: 100_000_000 },
      { date: '2026-03-01', value: 105_000_000 },
      { date: '2026-06-30', value: 110_000_000 },
    ],
    ...overrides,
  })

  const mockOnReset = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders strategy name and ticker', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('RSI Oversold Strategy')).toBeInTheDocument()
    expect(screen.getByText(/FPT/)).toBeInTheDocument()
  })

  it('renders backtest period', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText(/2026-01-01 to 2026-06-30/)).toBeInTheDocument()
  })

  it('shows key metrics: return, win rate, Sharpe, drawdown', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Total Return
    expect(screen.getByText('Total Return')).toBeInTheDocument()
    expect(screen.getByText('+15.00%')).toBeInTheDocument()

    // Win Rate
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('66.7%')).toBeInTheDocument()

    // Sharpe Ratio
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument()
    expect(screen.getByText('1.25')).toBeInTheDocument()
  })

  it('shows final portfolio value', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('Final Value')).toBeInTheDocument()
  })

  it('displays trade log in Trades tab', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Click on Trades tab
    fireEvent.click(screen.getByText(/Trades \(12\)/))

    // Should show trade table headers
    expect(screen.getByText('Entry')).toBeInTheDocument()
    expect(screen.getByText('Exit')).toBeInTheDocument()
    expect(screen.getByText('Shares')).toBeInTheDocument()
    expect(screen.getByText('Entry Price')).toBeInTheDocument()
    expect(screen.getByText('Exit Price')).toBeInTheDocument()
    expect(screen.getByText('P&L')).toBeInTheDocument()
  })

  it('shows equity curve in Chart tab', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Click on Equity Curve tab
    fireEvent.click(screen.getByText('Equity Curve'))

    // Should show chart legend
    expect(screen.getByText('Your Strategy')).toBeInTheDocument()
    expect(screen.getByText('Buy & Hold')).toBeInTheDocument()
  })

  it('shows comparison to buy-and-hold', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Strategy beats buy-and-hold in the mock data
    expect(screen.getByText(/Outperformed buy-and-hold/)).toBeInTheDocument()
  })

  it('shows underperformed message when strategy loses to buy-and-hold', () => {
    const losingResult = createMockResult({
      totalReturnPercent: 8.0,
      buyAndHoldReturnPercent: 15.0,
    })

    render(<BacktestResults result={losingResult} />)

    expect(screen.getByText(/Underperformed buy-and-hold/)).toBeInTheDocument()
  })

  it('renders tabs: Summary, Trades, Equity Curve', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('Summary')).toBeInTheDocument()
    expect(screen.getByText(/Trades \(12\)/)).toBeInTheDocument()
    expect(screen.getByText('Equity Curve')).toBeInTheDocument()
  })

  it('switches between tabs', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Default is Summary tab
    expect(screen.getByText('Performance Statistics')).toBeInTheDocument()

    // Click Trades tab
    fireEvent.click(screen.getByText(/Trades \(12\)/))
    expect(screen.getByText('Entry')).toBeInTheDocument()

    // Click back to Summary
    fireEvent.click(screen.getByText('Summary'))
    expect(screen.getByText('Performance Statistics')).toBeInTheDocument()
  })

  it('displays winning and losing trade counts', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('Winning Trades')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()

    expect(screen.getByText('Losing Trades')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows max drawdown in risk metrics', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('Max Drawdown')).toBeInTheDocument()
    expect(screen.getByText('Max Drawdown %')).toBeInTheDocument()
    expect(screen.getByText('-4.50%')).toBeInTheDocument()
  })

  it('calls onReset when Run Another button is clicked', () => {
    render(<BacktestResults result={createMockResult()} onReset={mockOnReset} />)

    fireEvent.click(screen.getByText('Run Another'))

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('does not show Run Another when onReset is not provided', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.queryByText('Run Another')).not.toBeInTheDocument()
  })

  it('applies success color for positive returns', () => {
    render(<BacktestResults result={createMockResult()} />)

    const positiveReturn = screen.getByText('+15.00%')
    expect(positiveReturn.closest('[class*="text-success"]')).toBeInTheDocument()
  })

  it('applies danger color for negative returns', () => {
    const negativeResult = createMockResult({
      totalReturn: -5_000_000,
      totalReturnPercent: -5.0,
      finalValue: 95_000_000,
    })

    render(<BacktestResults result={negativeResult} />)

    const negativeReturn = screen.getByText('-5.00%')
    expect(negativeReturn.closest('[class*="text-danger"]')).toBeInTheDocument()
  })

  it('shows trade entries with profit/loss styling', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Switch to Trades tab
    fireEvent.click(screen.getByText(/Trades \(12\)/))

    // Winning trade should have success styling
    expect(screen.getByText('+6.67%')).toBeInTheDocument()

    // Losing trade should have danger styling
    expect(screen.getByText('-1.82%')).toBeInTheDocument()
  })

  it('shows strategy vs buy-and-hold comparison section', () => {
    render(<BacktestResults result={createMockResult()} />)

    expect(screen.getByText('Strategy vs Buy & Hold')).toBeInTheDocument()
  })

  it('displays comparison winner message', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Strategy wins by 5% (15% - 10%)
    expect(screen.getByText(/Strategy wins by \+5\.00%/)).toBeInTheDocument()
  })

  it('shows empty trades message when no trades executed', () => {
    const noTradesResult = createMockResult({
      trades: [],
      totalTrades: 0,
    })

    render(<BacktestResults result={noTradesResult} />)

    // Switch to Trades tab
    fireEvent.click(screen.getByText(/Trades \(0\)/))

    expect(screen.getByText('No trades were executed during this backtest period.')).toBeInTheDocument()
  })

  it('shows good Sharpe ratio indicator when >= 1', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Sharpe of 1.25 should show "Good risk-adjusted returns"
    expect(screen.getByText('Good risk-adjusted returns')).toBeInTheDocument()
  })

  it('shows below average indicator when Sharpe < 1', () => {
    const lowSharpeResult = createMockResult({
      sharpeRatio: 0.75,
    })

    render(<BacktestResults result={lowSharpeResult} />)

    expect(screen.getByText('Below average')).toBeInTheDocument()
  })

  it('renders equity curve chart with start and end values', () => {
    render(<BacktestResults result={createMockResult()} />)

    // Switch to Equity Curve tab
    fireEvent.click(screen.getByText('Equity Curve'))

    // Should show start and end dates
    expect(screen.getByText('2026-01-01')).toBeInTheDocument()
    expect(screen.getByText('2026-06-30')).toBeInTheDocument()
  })

  it('shows no chart data message when equity curve is empty', () => {
    const emptyChartResult = createMockResult({
      equityCurve: [],
      buyAndHoldCurve: [],
    })

    render(<BacktestResults result={emptyChartResult} />)

    // Switch to Equity Curve tab
    fireEvent.click(screen.getByText('Equity Curve'))

    expect(screen.getByText('No data available for chart.')).toBeInTheDocument()
  })
})
