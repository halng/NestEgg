import { render, screen, fireEvent } from '@testing-library/react'
import { PriceInput } from '@/components/paper-trading/PriceInput'

describe('PriceInput', () => {
  const defaultProps = {
    value: 112500,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with formatted value', () => {
    render(<PriceInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toMatch(/112.*500/)
  })

  it('displays VND suffix', () => {
    render(<PriceInput {...defaultProps} />)
    
    expect(screen.getByText('VND')).toBeInTheDocument()
  })

  it('calls onChange with numeric value', () => {
    render(<PriceInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '115000' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(115000)
  })

  it('strips non-numeric characters', () => {
    render(<PriceInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '115,000 VND' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(115000)
  })

  it('calls onChange with undefined for empty input', () => {
    render(<PriceInput {...defaultProps} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(undefined)
  })

  it('renders label when provided', () => {
    render(<PriceInput {...defaultProps} label="Limit Price" />)
    
    expect(screen.getByText('Limit Price')).toBeInTheDocument()
  })

  it('shows placeholder when no value', () => {
    render(<PriceInput value={undefined} onChange={jest.fn()} placeholder="Enter price" />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.placeholder).toBe('Enter price')
  })

  it('uses default placeholder of 0', () => {
    render(<PriceInput value={undefined} onChange={jest.fn()} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.placeholder).toBe('0')
  })

  it('disables input when disabled', () => {
    render(<PriceInput {...defaultProps} disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('displays empty string when value is undefined', () => {
    render(<PriceInput value={undefined} onChange={jest.fn()} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('uses label as aria-label when provided', () => {
    render(<PriceInput {...defaultProps} label="Stop Price" />)
    
    expect(screen.getByLabelText('Stop Price')).toBeInTheDocument()
  })

  it('uses default aria-label Price when no label', () => {
    render(<PriceInput {...defaultProps} />)
    
    expect(screen.getByLabelText('Price')).toBeInTheDocument()
  })

  it('formats large numbers with locale separators', () => {
    render(<PriceInput value={1000000} onChange={jest.fn()} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toMatch(/1.*000.*000/)
  })
})
