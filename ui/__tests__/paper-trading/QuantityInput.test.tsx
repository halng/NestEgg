import { render, screen, fireEvent } from '@testing-library/react'
import { QuantityInput } from '@/components/paper-trading/QuantityInput'

describe('QuantityInput', () => {
  const defaultProps = {
    value: 100,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with initial value', () => {
    render(<QuantityInput {...defaultProps} />)
    
    const input = screen.getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('100')
  })

  it('calls onChange when input value changes', () => {
    render(<QuantityInput {...defaultProps} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '200' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(200)
  })

  it('increments value when plus button clicked', () => {
    render(<QuantityInput {...defaultProps} step={100} />)
    
    const plusButton = screen.getByRole('button', { name: /increase quantity/i })
    fireEvent.click(plusButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(200)
  })

  it('decrements value when minus button clicked', () => {
    render(<QuantityInput {...defaultProps} value={200} step={100} />)
    
    const minusButton = screen.getByRole('button', { name: /decrease quantity/i })
    fireEvent.click(minusButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(100)
  })

  it('does not decrement below min value', () => {
    render(<QuantityInput {...defaultProps} value={100} min={100} step={100} />)
    
    const minusButton = screen.getByRole('button', { name: /decrease quantity/i })
    expect(minusButton).toBeDisabled()
  })

  it('does not increment above max value', () => {
    render(<QuantityInput {...defaultProps} value={1000} max={1000} step={100} />)
    
    const plusButton = screen.getByRole('button', { name: /increase quantity/i })
    expect(plusButton).toBeDisabled()
  })

  it('clamps input value to min when below', () => {
    render(<QuantityInput {...defaultProps} min={50} max={500} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '10' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(50)
  })

  it('clamps input value to max when above', () => {
    render(<QuantityInput {...defaultProps} min={50} max={500} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '1000' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(500)
  })

  it('handles non-numeric input by falling back to min', () => {
    render(<QuantityInput {...defaultProps} min={1} />)
    
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: 'abc' } })
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(1)
  })

  it('disables all controls when disabled prop is true', () => {
    render(<QuantityInput {...defaultProps} disabled />)
    
    const input = screen.getByRole('spinbutton')
    const minusButton = screen.getByRole('button', { name: /decrease quantity/i })
    const plusButton = screen.getByRole('button', { name: /increase quantity/i })
    
    expect(input).toBeDisabled()
    expect(minusButton).toBeDisabled()
    expect(plusButton).toBeDisabled()
  })

  it('uses default step value of 100', () => {
    render(<QuantityInput {...defaultProps} />)
    
    const plusButton = screen.getByRole('button', { name: /increase quantity/i })
    fireEvent.click(plusButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(200)
  })

  it('respects custom step value', () => {
    render(<QuantityInput {...defaultProps} step={50} />)
    
    const plusButton = screen.getByRole('button', { name: /increase quantity/i })
    fireEvent.click(plusButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(150)
  })

  it('has correct accessibility attributes', () => {
    render(<QuantityInput {...defaultProps} />)
    
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument()
    expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument()
  })
})
