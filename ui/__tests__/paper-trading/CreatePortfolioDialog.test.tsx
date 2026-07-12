import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePortfolioDialog } from '@/components/paper-trading/CreatePortfolioDialog'

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

jest.mock('@/lib/paper-trading/mock-portfolios', () => ({
  PORTFOLIO_STRATEGIES: [
    { value: 'growth', label: 'Growth', icon: '🚀', description: 'High-growth stocks' },
    { value: 'value', label: 'Value', icon: '💎', description: 'Undervalued stocks' },
    { value: 'income', label: 'Income', icon: '💰', description: 'Dividend stocks' },
    { value: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Mixed approach' },
    { value: 'custom', label: 'Custom', icon: '🎯', description: 'Your strategy' },
  ],
}))

describe('CreatePortfolioDialog', () => {
  const mockOnClose = jest.fn()
  const mockOnCreate = jest.fn()
  const existingNames = ['main portfolio', 'growth picks']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(
      <CreatePortfolioDialog
        isOpen={false}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.queryByText('Create Portfolio')).not.toBeInTheDocument()
  })

  it('renders form fields when isOpen is true', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.getByText('Create Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Portfolio Name')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Strategy')).toBeInTheDocument()
    expect(screen.getByText('Starting Capital')).toBeInTheDocument()
  })

  it('renders strategy selection buttons', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.getByText('Growth')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Balanced')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('selects a strategy when button is clicked', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    fireEvent.click(screen.getByText('Growth'))

    // Strategy description should appear
    expect(screen.getByText('High-growth stocks')).toBeInTheDocument()
  })

  it('deselects strategy when clicked again', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    fireEvent.click(screen.getByText('Growth'))
    expect(screen.getByText('High-growth stocks')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Growth'))
    expect(screen.queryByText('High-growth stocks')).not.toBeInTheDocument()
  })

  it('renders capital presets', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.getByText('50M')).toBeInTheDocument()
    expect(screen.getByText('100M')).toBeInTheDocument()
    expect(screen.getByText('200M')).toBeInTheDocument()
    expect(screen.getByText('500M')).toBeInTheDocument()
  })

  it('selects capital preset when clicked', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    fireEvent.click(screen.getByText('50M'))

    // 50M preset should be selected (has primary styling)
    const preset50M = screen.getByText('50M')
    expect(preset50M).toHaveClass('border-primary')
  })

  it('shows validation error when name is too short', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'A' } })

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })
  })

  it('shows validation error when name already exists', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'Main Portfolio' } })

    await waitFor(() => {
      expect(screen.getByText('A portfolio with this name already exists')).toBeInTheDocument()
    })
  })

  it('shows validation error when capital is below minimum', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    const capitalInput = screen.getByDisplayValue('100,000,000')
    fireEvent.change(capitalInput, { target: { value: '100000' } })

    await waitFor(() => {
      expect(screen.getByText('Minimum capital is 1,000,000 VND')).toBeInTheDocument()
    })
  })

  it('disables submit button when form is invalid', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Name is empty by default
    const submitButton = screen.getByText('Create Portfolio')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when form is valid', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'Test Portfolio' } })

    await waitFor(() => {
      const submitButton = screen.getByText('Create Portfolio')
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('calls onCreate with form data when submitted', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Fill out the form
    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'New Test Portfolio' } })

    const descInput = screen.getByPlaceholderText(/Optional/i)
    fireEvent.change(descInput, { target: { value: 'Test description' } })

    // Select strategy
    fireEvent.click(screen.getByText('Growth'))

    // Select capital preset
    fireEvent.click(screen.getByText('200M'))

    // Submit
    const submitButton = screen.getByText('Create Portfolio')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'New Test Portfolio',
        description: 'Test description',
        strategy: 'growth',
        startingCapital: 200_000_000,
      })
    })
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when X button is clicked', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Find the X button in the header
    const closeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking backdrop', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Find and click the backdrop (the black overlay)
    const backdrop = document.querySelector('.bg-black\\/60')
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('displays portfolio summary section', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.getByText('Portfolio Summary')).toBeInTheDocument()
  })

  it('updates summary when form values change', async () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Fill name
    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'My Portfolio' } })

    // Select strategy
    fireEvent.click(screen.getByText('Value'))

    await waitFor(() => {
      // Summary should show updated values
      const summarySection = screen.getByText('Portfolio Summary').parentElement
      expect(summarySection).toHaveTextContent('My Portfolio')
      expect(summarySection).toHaveTextContent('Value')
    })
  })

  it('resets form when closed and reopened', async () => {
    const { rerender } = render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Fill form
    const nameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    fireEvent.change(nameInput, { target: { value: 'Test' } })

    // Close dialog
    fireEvent.click(screen.getByText('Cancel'))

    // Reopen dialog
    rerender(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Form should be reset
    const newNameInput = screen.getByPlaceholderText(/Growth Portfolio/i)
    expect(newNameInput).toHaveValue('')
  })

  it('formats capital input as Vietnamese number format', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    // Default value should be formatted
    expect(screen.getByDisplayValue('100,000,000')).toBeInTheDocument()
  })

  it('shows strategy icons in selection buttons', () => {
    render(
      <CreatePortfolioDialog
        isOpen={true}
        onClose={mockOnClose}
        onCreate={mockOnCreate}
        existingNames={existingNames}
      />
    )

    expect(screen.getByText('🚀')).toBeInTheDocument() // Growth
    expect(screen.getByText('💎')).toBeInTheDocument() // Value
    expect(screen.getByText('💰')).toBeInTheDocument() // Income
    expect(screen.getByText('⚖️')).toBeInTheDocument() // Balanced
    expect(screen.getByText('🎯')).toBeInTheDocument() // Custom
  })
})
