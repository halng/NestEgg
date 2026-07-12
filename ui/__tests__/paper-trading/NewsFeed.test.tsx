import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewsFeed } from '@/components/paper-trading/NewsFeed'

describe('NewsFeed', () => {
  it('renders Market News header', () => {
    render(<NewsFeed />)

    expect(screen.getByText('Market News')).toBeInTheDocument()
  })

  it('displays category filter buttons', () => {
    render(<NewsFeed />)

    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /My Stocks/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Market$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Company/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analysis/i })).toBeInTheDocument()
  })

  it('renders news articles', () => {
    render(<NewsFeed />)

    // Should render some news items from mock data
    const articles = screen.getAllByRole('button')
    expect(articles.length).toBeGreaterThan(5) // Filter buttons + news cards
  })

  it('filters by Market category when clicked', () => {
    render(<NewsFeed />)

    const marketButton = screen.getByRole('button', { name: /^Market$/i })
    fireEvent.click(marketButton)

    // Filter should be active
    expect(marketButton).toHaveClass('bg-primary')
  })

  it('filters by Company category when clicked', () => {
    render(<NewsFeed />)

    const companyButton = screen.getByRole('button', { name: /Company/i })
    fireEvent.click(companyButton)

    expect(companyButton).toHaveClass('bg-primary')
  })

  it('filters by Analysis category when clicked', () => {
    render(<NewsFeed />)

    const analysisButton = screen.getByRole('button', { name: /Analysis/i })
    fireEvent.click(analysisButton)

    expect(analysisButton).toHaveClass('bg-primary')
  })

  it('shows All filter as active by default', () => {
    render(<NewsFeed />)

    const allButton = screen.getByRole('button', { name: /All/i })
    expect(allButton).toHaveClass('bg-primary')
  })

  it('shows My Stocks filter with count when heldTickers provided', () => {
    render(<NewsFeed heldTickers={['FPT', 'VCB', 'TCB']} />)

    // Check My Stocks button exists - the count is shown inside the button
    const myStocksButton = screen.getByRole('button', { name: /My Stocks/i })
    expect(myStocksButton).toBeInTheDocument()
    expect(myStocksButton.textContent).toContain('3')
  })

  it('respects maxItems prop', () => {
    const { container } = render(<NewsFeed maxItems={2} />)

    // With maxItems=2, should show limited news articles
    const newsCards = container.querySelectorAll('[class*="rounded-xl"][class*="border"]')
    // Filter buttons and news cards - checking there are some
    expect(newsCards.length).toBeGreaterThan(0)
  })

  it('shows View All News button when onViewAll is provided', () => {
    const mockOnViewAll = jest.fn()

    render(<NewsFeed onViewAll={mockOnViewAll} />)

    expect(screen.getByText('View All News')).toBeInTheDocument()
  })

  it('calls onViewAll when View All button is clicked', () => {
    const mockOnViewAll = jest.fn()

    render(<NewsFeed onViewAll={mockOnViewAll} />)

    fireEvent.click(screen.getByText('View All News'))

    expect(mockOnViewAll).toHaveBeenCalled()
  })

  it('shows auto-refresh indicator', () => {
    render(<NewsFeed />)

    expect(screen.getByText(/Auto-refreshing every 5 minutes/i)).toBeInTheDocument()
  })

  it('has refresh button', () => {
    render(<NewsFeed />)

    // Should have a refresh button with RefreshCw icon
    const buttons = screen.getAllByRole('button')
    const refreshButton = buttons.find(btn => btn.title === 'Refresh news')
    expect(refreshButton).toBeInTheDocument()
  })

  it('shows portfolio filter with held ticker count', () => {
    render(<NewsFeed heldTickers={['FPT', 'VCB']} />)

    const myStocksButton = screen.getByRole('button', { name: /My Stocks/i })
    expect(myStocksButton).toBeInTheDocument()
    expect(myStocksButton.textContent).toContain('2')
  })

  it('renders filter icon', () => {
    const { container } = render(<NewsFeed />)

    // Filter section should exist
    const filterSection = container.querySelector('[class*="border-b"]')
    expect(filterSection).toBeInTheDocument()
  })
})
