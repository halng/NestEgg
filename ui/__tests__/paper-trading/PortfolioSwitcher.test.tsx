import { render, screen, fireEvent } from '@testing-library/react'
import { PortfolioSwitcher } from '@/components/paper-trading/PortfolioSwitcher'
import type { Portfolio } from '@/lib/paper-trading/mock-portfolios'

// Mock the modules
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
}))

jest.mock('@/lib/paper-trading/mock-portfolios', () => ({
  PORTFOLIO_STRATEGIES: [
    { value: 'growth', label: 'Growth', icon: '🚀', description: 'High-growth stocks' },
    { value: 'value', label: 'Value', icon: '💎', description: 'Undervalued stocks' },
    { value: 'income', label: 'Income', icon: '💰', description: 'Dividend stocks' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Mixed approach' },
    { value: 'custom', label: 'Custom', icon: '🎯', description: 'Your strategy' },
  ],
}))

describe('PortfolioSwitcher', () => {
  const createMockPortfolios = (): Portfolio[] => [
    {
      id: 'portfolio-main',
      name: 'Main Portfolio',
      description: 'My primary portfolio',
      strategy: 'balanced',
      startingCapital: 100_000_000,
      cashBalance: 50_000_000,
      totalValue: 110_000_000,
      roi: 10.0,
      createdAt: '2026-01-01T00:00:00Z',
      isActive: true,
      holdings: [],
    },
    {
      id: 'portfolio-growth',
      name: 'Growth Picks',
      description: 'Tech-focused portfolio',
      strategy: 'growth',
      startingCapital: 50_000_000,
      cashBalance: 15_000_000,
      totalValue: 58_000_000,
      roi: 16.0,
      createdAt: '2026-02-01T00:00:00Z',
      isActive: false,
      holdings: [],
    },
    {
      id: 'portfolio-value',
      name: 'Value Hunting',
      description: 'Undervalued stocks',
      strategy: 'value',
      startingCapital: 75_000_000,
      cashBalance: 30_000_000,
      totalValue: 70_000_000,
      roi: -6.67,
      createdAt: '2026-03-01T00:00:00Z',
      isActive: false,
      holdings: [],
    },
  ]

  const mockOnSwitch = jest.fn()
  const mockOnCreateNew = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnCompare = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dropdown with current portfolio', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Main Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows list of portfolios when dropdown is opened', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Click to open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // All portfolios should be listed
    expect(screen.getByText('Growth Picks')).toBeInTheDocument()
    expect(screen.getByText('Value Hunting')).toBeInTheDocument()
  })

  it('calls onSwitch when a different portfolio is clicked', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Click on a different portfolio
    fireEvent.click(screen.getByText('Growth Picks'))

    expect(mockOnSwitch).toHaveBeenCalledWith('portfolio-growth')
  })

  it('shows delete button for non-active portfolios', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Delete buttons should be present for non-active portfolios
    const deleteButtons = screen.getAllByTitle(/Delete portfolio/i)
    expect(deleteButtons.length).toBe(2) // Growth and Value portfolios
  })

  it('does not show delete button for active portfolio', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Main Portfolio (active) should not have delete button
    const mainPortfolioRow = screen.getByText('Main Portfolio').closest('[class*="flex items-center"]')
    expect(mainPortfolioRow?.querySelector('button[title*="Delete"]')).not.toBeInTheDocument()
  })

  it('requires confirmation before deleting', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Click delete on Growth portfolio
    const deleteButtons = screen.getAllByTitle(/Delete portfolio/i)
    fireEvent.click(deleteButtons[0])

    // First click should show confirmation
    expect(screen.getByTitle(/Click again to confirm/i)).toBeInTheDocument()

    // onDelete should not be called yet
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete after confirmation click', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Click delete twice (first to confirm, second to delete)
    const deleteButtons = screen.getAllByTitle(/Delete portfolio/i)
    fireEvent.click(deleteButtons[0])
    fireEvent.click(screen.getByTitle(/Click again to confirm/i))

    expect(mockOnDelete).toHaveBeenCalledWith('portfolio-growth')
  })

  it('shows New Portfolio button', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    expect(screen.getByText('New Portfolio')).toBeInTheDocument()
  })

  it('calls onCreateNew when New Portfolio is clicked', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Click New Portfolio
    fireEvent.click(screen.getByText('New Portfolio'))

    expect(mockOnCreateNew).toHaveBeenCalled()
  })

  it('shows Compare button when onCompare is provided and multiple portfolios exist', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
        onCompare={mockOnCompare}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    expect(screen.getByText('Compare')).toBeInTheDocument()
  })

  it('calls onCompare when Compare button is clicked', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
        onCompare={mockOnCompare}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Click Compare
    fireEvent.click(screen.getByText('Compare'))

    expect(mockOnCompare).toHaveBeenCalled()
  })

  it('displays portfolio value and ROI', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Main portfolio shows value and ROI in the dropdown trigger
    expect(screen.getByText('+10.00%')).toBeInTheDocument()
  })

  it('shows strategy icon for portfolios', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Strategy icons should be displayed
    expect(screen.getByText('⚖️')).toBeInTheDocument() // balanced
    expect(screen.getByText('🚀')).toBeInTheDocument() // growth
    expect(screen.getByText('💎')).toBeInTheDocument() // value
  })

  it('closes dropdown when clicking outside', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))
    expect(screen.getByText('Growth Picks')).toBeInTheDocument()

    // Click outside (simulate by triggering mousedown on document)
    fireEvent.mouseDown(document.body)

    // Dropdown should be closed
    expect(screen.queryByText('Growth Picks')).not.toBeInTheDocument()
  })

  it('shows check mark next to active portfolio in dropdown', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Active portfolio row should have a check icon (Check from lucide)
    // The active portfolio has primary styling
    const mainPortfolioInDropdown = screen.getAllByText('Main Portfolio')[1] // Second one is in dropdown
    const row = mainPortfolioInDropdown?.closest('[class*="bg-primary/5"]')
    expect(row).toBeInTheDocument()
  })

  it('displays positive ROI in success color and negative in danger color', () => {
    const portfolios = createMockPortfolios()
    const activePortfolio = portfolios[0]

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Main Portfolio'))

    // Check ROI colors
    const positiveRoi = screen.getByText('+16.00%')
    const negativeRoi = screen.getByText('-6.67%')

    expect(positiveRoi.closest('[class*="text-success"]')).toBeInTheDocument()
    expect(negativeRoi.closest('[class*="text-danger"]')).toBeInTheDocument()
  })

  it('shows Select Portfolio when no active portfolio', () => {
    const portfolios = createMockPortfolios()

    render(
      <PortfolioSwitcher
        portfolios={portfolios}
        activePortfolio={null}
        onSwitch={mockOnSwitch}
        onCreateNew={mockOnCreateNew}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('Select Portfolio')).toBeInTheDocument()
  })
})
