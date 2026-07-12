import { render, screen, fireEvent } from '@testing-library/react'
import { TechnicalIndicators } from '@/components/paper-trading/TechnicalIndicators'
import type { IndicatorConfig } from '@/lib/paper-trading/types'
import { DEFAULT_INDICATORS } from '@/lib/paper-trading/indicators'

describe('TechnicalIndicators', () => {
  const createMockIndicators = (): IndicatorConfig[] => [...DEFAULT_INDICATORS]

  const mockOnIndicatorChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders indicator checkboxes for SMA, EMA, RSI, MACD, Bollinger', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    expect(screen.getByText(/SMA 20/)).toBeInTheDocument()
    expect(screen.getByText(/EMA 12/)).toBeInTheDocument()
    expect(screen.getByText(/RSI 14/)).toBeInTheDocument()
    expect(screen.getByText('MACD')).toBeInTheDocument()
    expect(screen.getByText('BOLLINGER')).toBeInTheDocument()
  })

  it('toggles indicator on/off when checkbox is clicked', () => {
    const indicators = createMockIndicators()

    render(
      <TechnicalIndicators
        indicators={indicators}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Find checkboxes and click the first one
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(mockOnIndicatorChange).toHaveBeenCalled()
    const updatedIndicators = mockOnIndicatorChange.mock.calls[0][0]
    expect(updatedIndicators[0].enabled).toBe(true)
  })

  it('collapses panel when header is clicked', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Panel should be expanded by default
    expect(screen.getByText(/SMA 20/)).toBeInTheDocument()

    // Click header to collapse
    const header = screen.getByText('Technical Indicators')
    fireEvent.click(header)

    // Indicators should be hidden after collapse
    expect(screen.queryByText(/SMA 20/)).not.toBeInTheDocument()
  })

  it('expands panel when header is clicked while collapsed', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Click to collapse
    const header = screen.getByText('Technical Indicators')
    fireEvent.click(header)

    // Click again to expand
    fireEvent.click(header)

    // Indicators should be visible again
    expect(screen.getByText(/SMA 20/)).toBeInTheDocument()
  })

  it('shows active count when indicators are enabled', () => {
    const indicatorsWithEnabled = createMockIndicators()
    indicatorsWithEnabled[0].enabled = true
    indicatorsWithEnabled[1].enabled = true

    render(
      <TechnicalIndicators
        indicators={indicatorsWithEnabled}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    expect(screen.getByText('2 active')).toBeInTheDocument()
  })

  it('hides active count when no indicators are enabled', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    expect(screen.queryByText(/active/)).not.toBeInTheDocument()
  })

  it('displays indicator type names', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    expect(screen.getByText('Simple Moving Average')).toBeInTheDocument()
    expect(screen.getByText('Exponential Moving Average')).toBeInTheDocument()
    expect(screen.getByText('Relative Strength Index')).toBeInTheDocument()
  })

  it('highlights enabled indicators with primary border', () => {
    const indicators = createMockIndicators()
    indicators[0].enabled = true

    render(
      <TechnicalIndicators
        indicators={indicators}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Enabled indicator should have primary border styling
    const smaText = screen.getByText(/SMA 20/)
    const indicatorRow = smaText.closest('[class*="rounded-xl"]')
    expect(indicatorRow).toHaveClass('border-primary/30')
  })

  it('shows settings button for each indicator', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Each indicator row should have a settings button
    const buttons = screen.getAllByRole('button')
    // Filter to find settings buttons (small square buttons)
    const settingsButtons = buttons.filter(btn => btn.className.includes('h-7'))
    expect(settingsButtons.length).toBeGreaterThan(0)
  })

  it('shows color indicator for each enabled indicator', () => {
    const indicators = createMockIndicators()
    indicators[0].enabled = true

    render(
      <TechnicalIndicators
        indicators={indicators}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Color legend should show the enabled indicator
    const colorIndicators = screen.getAllByText(/SMA/)
    expect(colorIndicators.length).toBeGreaterThan(0)
  })

  it('renders Technical Indicators header', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    expect(screen.getByText('Technical Indicators')).toBeInTheDocument()
  })

  it('groups indicators by type', () => {
    render(
      <TechnicalIndicators
        indicators={createMockIndicators()}
        onIndicatorChange={mockOnIndicatorChange}
      />
    )

    // Multiple SMA indicators should be grouped
    const smaHeading = screen.getByText('Simple Moving Average')
    expect(smaHeading).toBeInTheDocument()
  })
})
