import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DividendCalendar } from '@/components/paper-trading/DividendCalendar'
import type { Dividend, DividendCalendarEntry } from '@/lib/paper-trading/mock-dividends'

const mockUpcomingDividends: Dividend[] = [
  {
    id: 'div-up-001',
    ticker: 'VCB',
    exDate: '2024-02-15',
    payDate: '2024-03-01',
    amountPerShare: 1500,
    shares: 100,
    totalAmount: 150000,
    status: 'upcoming',
  },
  {
    id: 'div-up-002',
    ticker: 'FPT',
    exDate: '2024-03-01',
    payDate: '2024-03-15',
    amountPerShare: 1000,
    shares: 200,
    totalAmount: 200000,
    status: 'upcoming',
  },
]

const mockReceivedDividends: Dividend[] = [
  {
    id: 'div-rec-001',
    ticker: 'VNM',
    exDate: '2024-01-05',
    payDate: '2024-01-20',
    amountPerShare: 2000,
    shares: 150,
    totalAmount: 300000,
    status: 'paid',
  },
]

const mockCalendar: DividendCalendarEntry[] = [
  {
    ticker: 'VCB',
    companyName: 'Vietcombank',
    exDate: '2024-02-15',
    payDate: '2024-03-01',
    amountPerShare: 1500,
    yield: 1.7,
  },
  {
    ticker: 'FPT',
    companyName: 'FPT Corporation',
    exDate: '2024-03-01',
    payDate: '2024-03-15',
    amountPerShare: 1000,
    yield: 0.9,
  },
]

describe('DividendCalendar', () => {
  const defaultProps = {
    upcomingDividends: mockUpcomingDividends,
    receivedDividends: mockReceivedDividends,
    calendar: mockCalendar,
  }

  it('renders dividends header', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByText('Dividends')).toBeInTheDocument()
  })

  it('renders dividend entries', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByText('VCB')).toBeInTheDocument()
    expect(screen.getByText('FPT')).toBeInTheDocument()
  })

  it('shows upcoming dividends by default', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByText('100 shares')).toBeInTheDocument()
    expect(screen.getByText('200 shares')).toBeInTheDocument()
  })

  it('shows total upcoming dividends amount', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByText('2 payments')).toBeInTheDocument()
  })

  it('shows total received dividends amount', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByText('1 payments')).toBeInTheDocument()
  })

  it('displays upcoming and received summary cards', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0)
    expect(screen.getByText('Received')).toBeInTheDocument()
  })

  it('renders tab navigation', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getByRole('button', { name: /upcoming/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /calendar/i })).toBeInTheDocument()
  })

  it('switches to history tab when clicked', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /history/i }))

    expect(screen.getByText('VNM')).toBeInTheDocument()
    expect(screen.getByText('150 shares')).toBeInTheDocument()
  })

  it('switches to calendar tab when clicked', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /calendar/i }))

    expect(screen.getByText('Vietcombank')).toBeInTheDocument()
    expect(screen.getByText('FPT Corporation')).toBeInTheDocument()
  })

  it('shows ex-date and pay-date in calendar view', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /calendar/i }))

    expect(screen.getAllByText(/ex-date/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/pay date/i).length).toBeGreaterThan(0)
  })

  it('shows yield percentage in calendar view', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /calendar/i }))

    expect(screen.getByText('1.7% yield')).toBeInTheDocument()
    expect(screen.getByText('0.9% yield')).toBeInTheDocument()
  })

  it('formats currency correctly', () => {
    render(<DividendCalendar {...defaultProps} />)

    const currencyElements = screen.getAllByText(/₫|,/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('shows empty state for upcoming when no upcoming dividends', () => {
    render(
      <DividendCalendar 
        {...defaultProps} 
        upcomingDividends={[]} 
      />
    )

    expect(screen.getByText(/no upcoming dividends/i)).toBeInTheDocument()
  })

  it('shows empty state for history when no received dividends', async () => {
    const user = userEvent.setup()
    render(
      <DividendCalendar 
        {...defaultProps} 
        receivedDividends={[]} 
      />
    )

    await user.click(screen.getByRole('button', { name: /history/i }))

    expect(screen.getByText(/no dividend history/i)).toBeInTheDocument()
  })

  it('shows paid status indicator for received dividends', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /history/i }))

    expect(screen.getByText(/paid/i)).toBeInTheDocument()
  })

  it('shows upcoming status indicator for upcoming dividends', () => {
    render(<DividendCalendar {...defaultProps} />)

    const payDateElements = screen.getAllByText(/pay date/i)
    expect(payDateElements.length).toBeGreaterThan(0)
  })

  it('shows amount per share for dividend entries', () => {
    render(<DividendCalendar {...defaultProps} />)

    expect(screen.getAllByText(/\/share/i).length).toBeGreaterThan(0)
  })

  it('highlights active tab', async () => {
    const user = userEvent.setup()
    render(<DividendCalendar {...defaultProps} />)

    const upcomingTab = screen.getByRole('button', { name: /upcoming/i })
    expect(upcomingTab).toHaveClass('bg-background')

    await user.click(screen.getByRole('button', { name: /history/i }))

    const historyTab = screen.getByRole('button', { name: /history/i })
    expect(historyTab).toHaveClass('bg-background')
  })

  it('shows 0 upcoming when no upcoming dividends', () => {
    render(
      <DividendCalendar 
        {...defaultProps} 
        upcomingDividends={[]} 
      />
    )

    expect(screen.getByText('0 payments')).toBeInTheDocument()
  })
})
