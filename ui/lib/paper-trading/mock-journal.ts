import type { JournalEntry } from './types'

export const mockJournalEntries: JournalEntry[] = [
  {
    id: 'journal-001',
    orderId: 'ord-100',
    ticker: 'FPT',
    title: 'First FPT purchase',
    content: 'Bought FPT after strong earnings report. Tech sector showing momentum. Plan to hold for medium term growth.',
    tags: ['earnings', 'tech', 'growth'],
    mood: 'bullish',
    createdAt: '2024-01-10T09:30:00Z',
  },
  {
    id: 'journal-002',
    orderId: 'ord-101',
    ticker: 'VCB',
    title: 'Banking sector entry',
    content: 'Added VCB to diversify into financials. Interest rate environment looks favorable. Set stop loss at 85,000.',
    tags: ['banking', 'diversification', 'interest-rates'],
    mood: 'neutral',
    createdAt: '2024-01-11T14:00:00Z',
  },
  {
    id: 'journal-003',
    ticker: 'HPG',
    title: 'Steel sector analysis',
    content: 'Watching HPG closely. Construction demand picking up but steel prices volatile. Will wait for clearer signal before entering.',
    tags: ['steel', 'watchlist', 'analysis'],
    mood: 'neutral',
    createdAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'journal-004',
    title: 'Weekly reflection',
    content: 'Good week overall. Portfolio up 0.93%. Need to be more patient with limit orders - missed VNM entry by being too conservative on price.',
    tags: ['reflection', 'weekly', 'lessons'],
    mood: 'bullish',
    createdAt: '2024-01-14T18:00:00Z',
  },
]

let journalIdCounter = 100
export function generateJournalId(): string {
  return `journal-${++journalIdCounter}`
}

export const MOOD_OPTIONS = [
  { value: 'bullish', label: 'Bullish', emoji: '🐂', color: 'text-success' },
  { value: 'bearish', label: 'Bearish', emoji: '🐻', color: 'text-danger' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-muted-foreground' },
] as const

export const SUGGESTED_TAGS = [
  'earnings', 'technical', 'fundamental', 'momentum', 'value',
  'growth', 'dividend', 'macro', 'sector-rotation', 'breakout',
  'support', 'resistance', 'lesson', 'mistake', 'win', 'loss',
  'watchlist', 'analysis', 'reflection', 'weekly', 'monthly'
]
