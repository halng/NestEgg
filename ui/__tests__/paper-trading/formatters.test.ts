import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDateTime,
  formatDate,
  formatRelativeTime
} from '@/lib/paper-trading/formatters'

describe('formatCurrency', () => {
  it('formats positive VND amounts', () => {
    const result = formatCurrency(11250000)
    expect(result).toMatch(/11.*250.*000/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/0/)
  })

  it('formats negative amounts', () => {
    const result = formatCurrency(-500000)
    expect(result).toMatch(/-.*500.*000/)
  })

  it('handles large amounts', () => {
    const result = formatCurrency(100000000)
    expect(result).toMatch(/100.*000.*000/)
  })
})

describe('formatNumber', () => {
  it('formats integers with thousand separators', () => {
    const result = formatNumber(1234567)
    expect(result).toMatch(/1.*234.*567/)
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('formats small numbers', () => {
    expect(formatNumber(100)).toBe('100')
  })
})

describe('formatPercent', () => {
  it('formats positive percentage with sign', () => {
    const result = formatPercent(12.5, true)
    expect(result).toBe('+12.50%')
  })

  it('formats negative percentage', () => {
    const result = formatPercent(-5.25, true)
    expect(result).toBe('-5.25%')
  })

  it('formats without sign when specified', () => {
    const result = formatPercent(12.5, false)
    expect(result).toBe('12.50%')
  })

  it('formats zero without plus sign', () => {
    const result = formatPercent(0, true)
    expect(result).toBe('0.00%')
  })

  it('handles decimal precision', () => {
    const result = formatPercent(3.14159, true)
    expect(result).toBe('+3.14%')
  })
})

describe('formatDateTime', () => {
  it('formats ISO date string', () => {
    const result = formatDateTime('2024-01-15T09:30:00Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('formatDate', () => {
  it('formats date without time', () => {
    const result = formatDate('2024-01-15T09:30:00Z')
    expect(result).toBeTruthy()
    expect(result).not.toContain(':')
  })
})

describe('formatRelativeTime', () => {
  it('returns "Just now" for very recent times', () => {
    const now = new Date().toISOString()
    const result = formatRelativeTime(now)
    expect(result).toBe('Just now')
  })

  it('returns minutes ago for recent times', () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - 5)
    const result = formatRelativeTime(date.toISOString())
    expect(result).toMatch(/5m ago/)
  })

  it('returns hours ago for times within a day', () => {
    const date = new Date()
    date.setHours(date.getHours() - 3)
    const result = formatRelativeTime(date.toISOString())
    expect(result).toMatch(/3h ago/)
  })

  it('returns days ago for times within a week', () => {
    const date = new Date()
    date.setDate(date.getDate() - 2)
    const result = formatRelativeTime(date.toISOString())
    expect(result).toMatch(/2d ago/)
  })
})
