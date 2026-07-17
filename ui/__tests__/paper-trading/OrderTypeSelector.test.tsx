import { render, screen, fireEvent } from '@testing-library/react'
import { OrderTypeSelector } from '@/components/paper-trading/OrderTypeSelector'

describe('OrderTypeSelector', () => {
  const defaultProps = {
    value: 'MARKET' as const,
    onChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all order type options', () => {
    render(<OrderTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Market')).toBeInTheDocument()
    expect(screen.getByText('Limit')).toBeInTheDocument()
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.getByText('Stop-Limit')).toBeInTheDocument()
  })

  it('highlights the selected order type', () => {
    render(<OrderTypeSelector {...defaultProps} value="LIMIT" />)
    
    const limitButton = screen.getByRole('radio', { name: /^Limit Set your price$/i })
    expect(limitButton).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange when different type is selected', () => {
    render(<OrderTypeSelector {...defaultProps} />)
    
    const limitButton = screen.getByRole('radio', { name: /^Limit Set your price$/i })
    fireEvent.click(limitButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('LIMIT')
  })

  it('displays descriptions for each type', () => {
    render(<OrderTypeSelector {...defaultProps} />)
    
    expect(screen.getByText('Execute immediately')).toBeInTheDocument()
    expect(screen.getByText('Set your price')).toBeInTheDocument()
    expect(screen.getByText('Trigger at price')).toBeInTheDocument()
    expect(screen.getByText('Stop + Limit')).toBeInTheDocument()
  })

  it('disables all buttons when disabled', () => {
    render(<OrderTypeSelector {...defaultProps} disabled />)
    
    const buttons = screen.getAllByRole('radio')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('has correct radiogroup role', () => {
    render(<OrderTypeSelector {...defaultProps} />)
    
    expect(screen.getByRole('radiogroup', { name: /order type/i })).toBeInTheDocument()
  })

  it('marks only the selected option as checked', () => {
    render(<OrderTypeSelector {...defaultProps} value="STOP" />)
    
    const radioButtons = screen.getAllByRole('radio')
    const marketButton = radioButtons[0]
    const limitButton = radioButtons[1]
    const stopButton = radioButtons[2]
    const stopLimitButton = radioButtons[3]
    
    expect(marketButton).toHaveAttribute('aria-checked', 'false')
    expect(limitButton).toHaveAttribute('aria-checked', 'false')
    expect(stopButton).toHaveAttribute('aria-checked', 'true')
    expect(stopLimitButton).toHaveAttribute('aria-checked', 'false')
  })

  it('can select STOP_LIMIT order type', () => {
    render(<OrderTypeSelector {...defaultProps} />)
    
    const radioButtons = screen.getAllByRole('radio')
    const stopLimitButton = radioButtons[3]
    fireEvent.click(stopLimitButton)
    
    expect(defaultProps.onChange).toHaveBeenCalledWith('STOP_LIMIT')
  })
})
