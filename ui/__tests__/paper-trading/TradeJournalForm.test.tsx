import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TradeJournalForm } from '@/components/paper-trading/TradeJournalForm'
import type { JournalEntry } from '@/lib/paper-trading/mock-journal'
import type { PaperTradingMarketTicker } from '@/lib/paper-trading/types'

const mockMarketWatch: PaperTradingMarketTicker[] = [
  { ticker: 'FPT', name: 'FPT Corporation', price: 100000, change: 2000, changePercent: 2.04 },
  { ticker: 'VCB', name: 'Vietcombank', price: 90000, change: -1000, changePercent: -1.1 },
]

const mockEntry: JournalEntry = {
  id: 'journal-001',
  ticker: 'FPT',
  title: 'Existing Entry',
  content: 'This is existing content.',
  tags: ['tech', 'growth'],
  mood: 'bullish',
  createdAt: '2024-01-10T09:30:00Z',
}

describe('TradeJournalForm', () => {
  const defaultProps = {
    entry: null as JournalEntry | null,
    marketWatch: mockMarketWatch,
    onSave: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title input', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/entry title/i)).toBeInTheDocument()
  })

  it('renders content textarea', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/write your thoughts/i)).toBeInTheDocument()
  })

  it('renders mood selector with all options', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText('Sentiment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /🐂 bullish/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /🐻 bearish/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /😐 neutral/i })).toBeInTheDocument()
  })

  it('renders tag input', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText('Tags')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/add tags/i)).toBeInTheDocument()
  })

  it('renders related stock selector', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText(/related stock/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /create entry/i })).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('submit button is disabled when title is empty', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /create entry/i })).toBeDisabled()
  })

  it('submit button is disabled when content is empty', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText(/entry title/i), 'Test Title')

    expect(screen.getByRole('button', { name: /create entry/i })).toBeDisabled()
  })

  it('submit button is enabled when title and content are filled', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText(/entry title/i), 'Test Title')
    await user.type(screen.getByPlaceholderText(/write your thoughts/i), 'Test content')

    expect(screen.getByRole('button', { name: /create entry/i })).not.toBeDisabled()
  })

  it('calls onSave with correct data on submit', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText(/entry title/i), 'New Entry')
    await user.type(screen.getByPlaceholderText(/write your thoughts/i), 'Test content for journal')
    await user.click(screen.getByRole('button', { name: /🐻 bearish/i }))
    await user.click(screen.getByRole('button', { name: /create entry/i }))

    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Entry',
        content: 'Test content for journal',
        mood: 'bearish',
        tags: [],
      })
    )
  })

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('calls onCancel when X button clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find(btn => btn.querySelector('svg.lucide-x'))!
    await user.click(closeButton)

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('shows "Edit Entry" title when editing existing entry', () => {
    render(<TradeJournalForm {...defaultProps} entry={mockEntry} />)

    expect(screen.getByText('Edit Entry')).toBeInTheDocument()
  })

  it('shows "New Journal Entry" title when creating new entry', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByText('New Journal Entry')).toBeInTheDocument()
  })

  it('pre-fills form when editing existing entry', () => {
    render(<TradeJournalForm {...defaultProps} entry={mockEntry} />)

    expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('This is existing content.')).toBeInTheDocument()
    expect(screen.getByText('#tech')).toBeInTheDocument()
    expect(screen.getByText('#growth')).toBeInTheDocument()
  })

  it('shows "Save Changes" button when editing', () => {
    render(<TradeJournalForm {...defaultProps} entry={mockEntry} />)

    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('selects neutral mood by default', () => {
    render(<TradeJournalForm {...defaultProps} />)

    const neutralButton = screen.getByRole('button', { name: /😐 neutral/i })
    expect(neutralButton).toHaveClass('border-primary')
  })

  it('changes mood when mood button is clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    const bullishButton = screen.getByRole('button', { name: /🐂 bullish/i })
    await user.click(bullishButton)

    expect(bullishButton).toHaveClass('border-primary')
  })

  it('adds tag when pressing Enter in tag input', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    const tagInput = screen.getByPlaceholderText(/add tags/i)
    await user.type(tagInput, 'newtag{Enter}')

    expect(screen.getByText('#newtag')).toBeInTheDocument()
  })

  it('removes tag when remove button clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} entry={mockEntry} />)

    expect(screen.getByText('#tech')).toBeInTheDocument()

    const tagRemoveButtons = screen.getAllByRole('button').filter(
      btn => btn.closest('span')?.textContent?.includes('#tech')
    )
    const removeButton = tagRemoveButtons.find(btn => btn.querySelector('svg.lucide-x'))
    if (removeButton) {
      await user.click(removeButton)
    }

    expect(screen.queryByText('#tech')).not.toBeInTheDocument()
  })

  it('shows suggested tags', () => {
    render(<TradeJournalForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /\+earnings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+technical/i })).toBeInTheDocument()
  })

  it('adds suggested tag when clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /\+earnings/i }))

    expect(screen.getByText('#earnings')).toBeInTheDocument()
  })

  it('normalizes tag input to lowercase', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} />)

    const tagInput = screen.getByPlaceholderText(/add tags/i)
    await user.type(tagInput, 'MyTag{Enter}')

    expect(screen.getByText('#mytag')).toBeInTheDocument()
  })

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup()
    render(<TradeJournalForm {...defaultProps} entry={mockEntry} />)

    const tagInput = screen.getByPlaceholderText(/add tags/i)
    await user.type(tagInput, 'tech{Enter}')

    const techTags = screen.getAllByText('#tech')
    expect(techTags).toHaveLength(1)
  })
})
