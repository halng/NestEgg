import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TradeJournalEntry } from '@/components/paper-trading/TradeJournalEntry'
import type { JournalEntry } from '@/lib/paper-trading/mock-journal'

const mockEntry: JournalEntry = {
  id: 'journal-001',
  orderId: 'ord-100',
  ticker: 'FPT',
  title: 'First FPT purchase',
  content: 'Bought FPT after strong earnings report. Tech sector showing momentum.',
  tags: ['earnings', 'tech', 'growth'],
  mood: 'bullish',
  createdAt: '2024-01-10T09:30:00Z',
}

const mockEntryWithUpdate: JournalEntry = {
  ...mockEntry,
  id: 'journal-002',
  updatedAt: '2024-01-11T14:00:00Z',
}

const mockEntryNeutral: JournalEntry = {
  id: 'journal-003',
  title: 'Market observation',
  content: 'Watching the market closely today.',
  tags: [],
  mood: 'neutral',
  createdAt: '2024-01-12T10:00:00Z',
}

describe('TradeJournalEntry', () => {
  const defaultProps = {
    entry: mockEntry,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders entry title', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText('First FPT purchase')).toBeInTheDocument()
  })

  it('renders entry content', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText(/Bought FPT after strong earnings report/)).toBeInTheDocument()
  })

  it('shows mood indicator emoji for bullish mood', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText('🐂')).toBeInTheDocument()
  })

  it('shows mood indicator emoji for bearish mood', () => {
    const bearishEntry: JournalEntry = {
      ...mockEntry,
      mood: 'bearish',
    }
    render(<TradeJournalEntry {...defaultProps} entry={bearishEntry} />)

    expect(screen.getByText('🐻')).toBeInTheDocument()
  })

  it('shows mood indicator emoji for neutral mood', () => {
    render(<TradeJournalEntry {...defaultProps} entry={mockEntryNeutral} />)

    expect(screen.getByText('😐')).toBeInTheDocument()
  })

  it('displays tags', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText('#earnings')).toBeInTheDocument()
    expect(screen.getByText('#tech')).toBeInTheDocument()
    expect(screen.getByText('#growth')).toBeInTheDocument()
  })

  it('does not show tag section when no tags', () => {
    render(<TradeJournalEntry {...defaultProps} entry={mockEntryNeutral} />)

    expect(screen.queryByText('#')).not.toBeInTheDocument()
  })

  it('shows formatted creation date', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    const dateElement = screen.getByText(/ago|just now/i, { exact: false })
    expect(dateElement).toBeInTheDocument()
  })

  it('shows edited date when entry has been updated', () => {
    render(<TradeJournalEntry {...defaultProps} entry={mockEntryWithUpdate} />)

    expect(screen.getByText(/edited/i)).toBeInTheDocument()
  })

  it('does not show edited date when entry has not been updated', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.queryByText(/edited/i)).not.toBeInTheDocument()
  })

  it('renders edit button', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => btn.querySelector('svg.lucide-edit-2'))
    expect(editButton).toBeInTheDocument()
  })

  it('renders delete button', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg.lucide-trash-2'))
    expect(deleteButton).toBeInTheDocument()
  })

  it('calls onEdit with entry when edit button clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalEntry {...defaultProps} />)

    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => btn.querySelector('svg.lucide-edit-2'))!
    await user.click(editButton)

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockEntry)
  })

  it('calls onDelete with entry id when delete button clicked', async () => {
    const user = userEvent.setup()
    render(<TradeJournalEntry {...defaultProps} />)

    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg.lucide-trash-2'))!
    await user.click(deleteButton)

    expect(defaultProps.onDelete).toHaveBeenCalledWith('journal-001')
  })

  it('shows ticker badge when entry has a ticker', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText('FPT')).toBeInTheDocument()
  })

  it('does not show ticker badge when entry has no ticker', () => {
    render(<TradeJournalEntry {...defaultProps} entry={mockEntryNeutral} />)

    expect(screen.queryByText('FPT')).not.toBeInTheDocument()
  })

  it('shows linked order info when entry has orderId', () => {
    render(<TradeJournalEntry {...defaultProps} />)

    expect(screen.getByText(/order ord-100/i)).toBeInTheDocument()
  })

  it('does not show linked order info when entry has no orderId', () => {
    render(<TradeJournalEntry {...defaultProps} entry={mockEntryNeutral} />)

    expect(screen.queryByText(/order/i)).not.toBeInTheDocument()
  })
})
