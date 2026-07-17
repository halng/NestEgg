import { render, screen, fireEvent } from '@testing-library/react'
import { TimeInForceSelect } from '@/components/paper-trading/TimeInForceSelect'

describe('TimeInForceSelect', () => {
  const defaultProps = {
    value: 'DAY' as const,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with all options', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    const options = select.querySelectorAll('option')
    expect(options.length).toBe(4)
    expect(options[0].value).toBe('DAY')
    expect(options[1].value).toBe('GTC')
    expect(options[2].value).toBe('IOC')
    expect(options[3].value).toBe('FOK')
  })

  it('has correct initial value', () => {
    render(<TimeInForceSelect {...defaultProps} value="GTC" />)
    
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('GTC')
  })

  it('calls onChange when selection changes', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'GTC' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('GTC')
  })

  it('displays label', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    expect(screen.getByText('Time in Force')).toBeInTheDocument()
  })

  it('disables select when disabled', () => {
    render(<TimeInForceSelect {...defaultProps} disabled />)
    
    const select = screen.getByRole('combobox')
    expect(select).toBeDisabled()
  })

  it('displays descriptions for options', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    expect(select.innerHTML).toMatch(/Valid until market close/)
    expect(select.innerHTML).toMatch(/Good 'til cancelled/)
    expect(select.innerHTML).toMatch(/Immediate or cancel/)
    expect(select.innerHTML).toMatch(/Fill or kill/)
  })

  it('can select IOC option', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'IOC' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('IOC')
  })

  it('can select FOK option', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'FOK' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('FOK')
  })

  it('has aria-label for accessibility', () => {
    render(<TimeInForceSelect {...defaultProps} />)
    
    expect(screen.getByLabelText('Time in Force')).toBeInTheDocument()
  })
})
