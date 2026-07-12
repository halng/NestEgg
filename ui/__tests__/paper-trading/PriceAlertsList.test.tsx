import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PriceAlertsList } from '@/components/paper-trading/PriceAlertsList'
import type { PriceAlert, PaperTradingMarketTicker } from '@/lib/paper-trading/types'

const mockMarketWatch: PaperTradingMarketTicker[] = [
  { ticker: 'FPT', name: 'FPT Corporation', price: 100000, change: 2000, changePercent: 2.04 },
  { ticker: 'VCB', name: 'Vietcombank', price: 90000, change: -1000, changePercent: -1.1 },
]

const mockAlerts: PriceAlert[] = [
  {
    id: 'alert-1',
    ticker: 'FPT',
    condition: 'ABOVE',
    targetPrice: 105000,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'alert-2',
    ticker: 'VCB',
    condition: 'BELOW',
    targetPrice: 85000,
    isActive: true,
    createdAt: '2024-01-14T09:00:00Z',
  },
  {
    id: 'alert-3',
    ticker: 'FPT',
    condition: 'CROSS',
    targetPrice: 95000,
    isActive: false,
    triggeredAt: '2024-01-13T15:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
  },
]

describe('PriceAlertsList', () => {
  const defaultProps = {
    alerts: mockAlerts,
    marketWatch: mockMarketWatch,
    onDelete: jest.fn(),
    onToggle: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders list of alerts', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getAllByText('FPT').length).toBeGreaterThan(0)
    expect(screen.getByText('VCB')).toBeInTheDocument()
  })

  it('shows alert ticker and target price', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getAllByText('FPT')).toHaveLength(2)
    expect(screen.getByText('VCB')).toBeInTheDocument()
  })

  it('displays condition labels correctly', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getByText(/rises above/)).toBeInTheDocument()
    expect(screen.getByText(/falls below/)).toBeInTheDocument()
    expect(screen.getByText(/crosses/)).toBeInTheDocument()
  })

  it('shows active alerts section with count', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getByText('Active Alerts (2)')).toBeInTheDocument()
  })

  it('shows triggered alerts section with count', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getByText('Triggered (1)')).toBeInTheDocument()
  })

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceAlertsList {...defaultProps} />)

    const toggleButtons = screen.getAllByTitle(/disable alert|enable alert/i)
    await user.click(toggleButtons[0])

    expect(defaultProps.onToggle).toHaveBeenCalledWith('alert-1')
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<PriceAlertsList {...defaultProps} />)

    const deleteButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg.lucide-trash-2')
    )
    await user.click(deleteButtons[0])

    expect(defaultProps.onDelete).toHaveBeenCalledWith('alert-1')
  })

  it('shows empty state when no alerts', () => {
    render(<PriceAlertsList {...defaultProps} alerts={[]} />)

    expect(screen.getByText('No price alerts')).toBeInTheDocument()
    expect(screen.getByText(/create an alert to get notified/i)).toBeInTheDocument()
  })

  it('displays current price for active alerts', () => {
    render(<PriceAlertsList {...defaultProps} />)

    const currentPriceLabels = screen.getAllByText('Current:')
    expect(currentPriceLabels.length).toBeGreaterThan(0)
  })

  it('shows distance percentage for active alerts', () => {
    render(<PriceAlertsList {...defaultProps} />)

    const distanceLabels = screen.getAllByText('Distance:')
    expect(distanceLabels.length).toBeGreaterThan(0)
  })

  it('shows triggered time for inactive alerts', () => {
    render(<PriceAlertsList {...defaultProps} />)

    expect(screen.getAllByText(/triggered/i).length).toBeGreaterThan(0)
  })

  it('shows creation time for all alerts', () => {
    render(<PriceAlertsList {...defaultProps} />)

    const createdLabels = screen.getAllByText(/created/i)
    expect(createdLabels.length).toBe(3)
  })

  it('renders toggle button with correct icon based on active state', () => {
    render(<PriceAlertsList {...defaultProps} />)

    const disableButtons = screen.getAllByTitle('Disable alert')
    const enableButtons = screen.getAllByTitle('Enable alert')

    expect(disableButtons.length).toBe(2)
    expect(enableButtons.length).toBe(1)
  })

  it('does not show active/triggered sections when respective alerts are empty', () => {
    const activeOnlyAlerts: PriceAlert[] = [
      {
        id: 'alert-1',
        ticker: 'FPT',
        condition: 'ABOVE',
        targetPrice: 105000,
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
      },
    ]

    render(<PriceAlertsList {...defaultProps} alerts={activeOnlyAlerts} />)

    expect(screen.getByText('Active Alerts (1)')).toBeInTheDocument()
    expect(screen.queryByText(/triggered/i)).not.toBeInTheDocument()
  })
})
