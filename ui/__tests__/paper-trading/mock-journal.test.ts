import {
  mockJournalEntries,
  generateJournalId,
  MOOD_OPTIONS,
  SUGGESTED_TAGS,
} from '@/lib/paper-trading/mock-journal'
import type { JournalEntry } from '@/lib/paper-trading/types'

describe('mockJournalEntries', () => {
  it('contains journal entries', () => {
    expect(mockJournalEntries.length).toBeGreaterThan(0)
  })

  it('has valid entry structure', () => {
    mockJournalEntries.forEach(entry => {
      expect(entry.id).toBeTruthy()
      expect(entry.title).toBeTruthy()
      expect(entry.content).toBeTruthy()
      expect(Array.isArray(entry.tags)).toBe(true)
      expect(entry.mood).toBeTruthy()
      expect(entry.createdAt).toBeTruthy()
    })
  })

  it('has unique entry IDs', () => {
    const ids = mockJournalEntries.map(e => e.id)
    const uniqueIds = new Set(ids)
    
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('has valid mood values', () => {
    const validMoods = ['bullish', 'bearish', 'neutral']
    
    mockJournalEntries.forEach(entry => {
      expect(validMoods).toContain(entry.mood)
    })
  })

  it('has valid ISO date strings for createdAt', () => {
    mockJournalEntries.forEach(entry => {
      const date = new Date(entry.createdAt)
      expect(date.toString()).not.toBe('Invalid Date')
    })
  })

  it('contains entries with tags', () => {
    const entriesWithTags = mockJournalEntries.filter(e => e.tags.length > 0)
    expect(entriesWithTags.length).toBeGreaterThan(0)
  })

  it('contains entries with orderId (trade-linked)', () => {
    const tradeLinkedEntries = mockJournalEntries.filter(e => e.orderId)
    expect(tradeLinkedEntries.length).toBeGreaterThan(0)
  })

  it('contains entries without orderId (general reflections)', () => {
    const generalEntries = mockJournalEntries.filter(e => !e.orderId)
    expect(generalEntries.length).toBeGreaterThan(0)
  })

  it('trade-linked entries have ticker symbol', () => {
    const tradeLinkedEntries = mockJournalEntries.filter(e => e.orderId)
    
    tradeLinkedEntries.forEach(entry => {
      expect(entry.ticker).toBeTruthy()
    })
  })
})

describe('generateJournalId', () => {
  it('generates unique IDs', () => {
    const id1 = generateJournalId()
    const id2 = generateJournalId()
    const id3 = generateJournalId()

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('generates IDs with correct prefix', () => {
    const id = generateJournalId()
    expect(id).toMatch(/^journal-\d+$/)
  })

  it('generates incrementing IDs', () => {
    const id1 = generateJournalId()
    const id2 = generateJournalId()
    
    const num1 = parseInt(id1.split('-')[1])
    const num2 = parseInt(id2.split('-')[1])
    
    expect(num2).toBe(num1 + 1)
  })
})

describe('MOOD_OPTIONS', () => {
  it('contains exactly three mood options', () => {
    expect(MOOD_OPTIONS.length).toBe(3)
  })

  it('has all required mood types', () => {
    const moodValues = MOOD_OPTIONS.map(m => m.value)
    
    expect(moodValues).toContain('bullish')
    expect(moodValues).toContain('bearish')
    expect(moodValues).toContain('neutral')
  })

  it('has valid structure for each mood option', () => {
    MOOD_OPTIONS.forEach(mood => {
      expect(mood.value).toBeTruthy()
      expect(mood.label).toBeTruthy()
      expect(mood.emoji).toBeTruthy()
      expect(mood.color).toBeTruthy()
    })
  })

  it('has valid CSS color classes', () => {
    MOOD_OPTIONS.forEach(mood => {
      expect(mood.color).toMatch(/^text-/)
    })
  })

  it('bullish option has correct properties', () => {
    const bullish = MOOD_OPTIONS.find(m => m.value === 'bullish')
    
    expect(bullish).toBeDefined()
    expect(bullish?.label).toBe('Bullish')
    expect(bullish?.emoji).toBe('🐂')
    expect(bullish?.color).toBe('text-success')
  })

  it('bearish option has correct properties', () => {
    const bearish = MOOD_OPTIONS.find(m => m.value === 'bearish')
    
    expect(bearish).toBeDefined()
    expect(bearish?.label).toBe('Bearish')
    expect(bearish?.emoji).toBe('🐻')
    expect(bearish?.color).toBe('text-danger')
  })

  it('neutral option has correct properties', () => {
    const neutral = MOOD_OPTIONS.find(m => m.value === 'neutral')
    
    expect(neutral).toBeDefined()
    expect(neutral?.label).toBe('Neutral')
    expect(neutral?.emoji).toBe('😐')
    expect(neutral?.color).toBe('text-muted-foreground')
  })
})

describe('SUGGESTED_TAGS', () => {
  it('contains suggested tags', () => {
    expect(SUGGESTED_TAGS.length).toBeGreaterThan(0)
  })

  it('has unique tags', () => {
    const uniqueTags = new Set(SUGGESTED_TAGS)
    expect(uniqueTags.size).toBe(SUGGESTED_TAGS.length)
  })

  it('contains common trading tags', () => {
    expect(SUGGESTED_TAGS).toContain('earnings')
    expect(SUGGESTED_TAGS).toContain('technical')
    expect(SUGGESTED_TAGS).toContain('fundamental')
  })

  it('contains learning/reflection tags', () => {
    expect(SUGGESTED_TAGS).toContain('lesson')
    expect(SUGGESTED_TAGS).toContain('mistake')
    expect(SUGGESTED_TAGS).toContain('reflection')
  })

  it('contains outcome tags', () => {
    expect(SUGGESTED_TAGS).toContain('win')
    expect(SUGGESTED_TAGS).toContain('loss')
  })

  it('all tags are lowercase strings', () => {
    SUGGESTED_TAGS.forEach(tag => {
      expect(typeof tag).toBe('string')
      expect(tag).toBe(tag.toLowerCase())
    })
  })

  it('all tags are non-empty', () => {
    SUGGESTED_TAGS.forEach(tag => {
      expect(tag.length).toBeGreaterThan(0)
    })
  })
})

describe('Entry Content Validation', () => {
  it('entries have meaningful content length', () => {
    mockJournalEntries.forEach(entry => {
      expect(entry.content.length).toBeGreaterThan(10)
    })
  })

  it('entries have meaningful title length', () => {
    mockJournalEntries.forEach(entry => {
      expect(entry.title.length).toBeGreaterThan(3)
    })
  })

  it('entry tags are non-empty strings', () => {
    mockJournalEntries.forEach(entry => {
      entry.tags.forEach(tag => {
        expect(typeof tag).toBe('string')
        expect(tag.length).toBeGreaterThan(0)
      })
    })
  })
})
