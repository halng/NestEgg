import { render, screen, fireEvent } from '@testing-library/react'
import { OrderFilters, defaultFilters, type OrderFiltersState } from '@/components/paper-trading/OrderFilters'

describe('OrderFilters', () => {
  const defaultProps = {
    filters: defaultFilters,
    onChange: jest.fn(),
    onReset: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders search input', () => {
    render(<OrderFilters {...defaultProps} />)
    
    expect(screen.getByPlaceholderText(/Search by ticker/i)).toBeInTheDocument()
  })

  it('renders filter dropdowns', () => {
    render(<OrderFilters {...defaultProps} />)
    
    expect(screen.getByDisplayValue('All Sides')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
  })

  it('calls onChange when search input changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText(/Search by ticker/i)
    fireEvent.change(searchInput, { target: { value: 'FPT' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'FPT' })
    )
  })

  it('calls onChange when side filter changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const sideSelect = screen.getByDisplayValue('All Sides')
    fireEvent.change(sideSelect, { target: { value: 'BUY' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ side: 'BUY' })
    )
  })

  it('calls onChange when status filter changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const statusSelect = screen.getByDisplayValue('All Status')
    fireEvent.change(statusSelect, { target: { value: 'FILLED' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FILLED' })
    )
  })

  it('calls onChange when order type filter changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(typeSelect, { target: { value: 'LIMIT' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ orderType: 'LIMIT' })
    )
  })

  it('shows clear button when filters are active', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      search: 'FPT',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument()
  })

  it('hides clear button when no filters active', () => {
    render(<OrderFilters {...defaultProps} />)
    
    expect(screen.queryByText(/Clear filters/i)).not.toBeInTheDocument()
  })

  it('calls onReset when clear button clicked', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      search: 'FPT',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    const clearButton = screen.getByText(/Clear filters/i)
    fireEvent.click(clearButton)
    
    expect(defaultProps.onReset).toHaveBeenCalled()
  })

  it('renders date range inputs', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const dateInputs = document.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBe(2)
  })

  it('calls onChange when dateFrom changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const dateInputs = document.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[0], { target: { value: '2024-01-01' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: '2024-01-01' })
    )
  })

  it('calls onChange when dateTo changes', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const dateInputs = document.querySelectorAll('input[type="date"]')
    fireEvent.change(dateInputs[1], { target: { value: '2024-12-31' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ dateTo: '2024-12-31' })
    )
  })

  it('shows clear button when side filter is active', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      side: 'BUY',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument()
  })

  it('shows clear button when status filter is active', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      status: 'FILLED',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument()
  })

  it('shows clear button when orderType filter is active', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      orderType: 'LIMIT',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument()
  })

  it('shows clear button when date range is active', () => {
    const activeFilters: OrderFiltersState = {
      ...defaultFilters,
      dateFrom: '2024-01-01',
    }
    
    render(<OrderFilters {...defaultProps} filters={activeFilters} />)
    
    expect(screen.getByText(/Clear filters/i)).toBeInTheDocument()
  })

  it('has all side options', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const sideSelect = screen.getByDisplayValue('All Sides')
    expect(sideSelect).toContainHTML('<option value="ALL">All Sides</option>')
    expect(sideSelect).toContainHTML('<option value="BUY">Buy</option>')
    expect(sideSelect).toContainHTML('<option value="SELL">Sell</option>')
  })

  it('has all status options', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const statusSelect = screen.getByDisplayValue('All Status')
    expect(statusSelect).toContainHTML('<option value="FILLED">Filled</option>')
    expect(statusSelect).toContainHTML('<option value="PENDING">Pending</option>')
    expect(statusSelect).toContainHTML('<option value="CANCELLED">Cancelled</option>')
  })

  it('has all order type options', () => {
    render(<OrderFilters {...defaultProps} />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    expect(typeSelect).toContainHTML('<option value="MARKET">Market</option>')
    expect(typeSelect).toContainHTML('<option value="LIMIT">Limit</option>')
    expect(typeSelect).toContainHTML('<option value="STOP">Stop</option>')
  })
})
