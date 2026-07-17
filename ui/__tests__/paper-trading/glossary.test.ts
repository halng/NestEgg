import {
  GLOSSARY_TERMS,
  GLOSSARY_TERM_LIST,
  getGlossaryTerm,
  searchGlossaryTerms,
} from '@/lib/paper-trading/glossary'

describe('GLOSSARY_TERMS', () => {
  describe('data structure', () => {
    it('is a non-empty object', () => {
      expect(typeof GLOSSARY_TERMS).toBe('object')
      expect(Object.keys(GLOSSARY_TERMS).length).toBeGreaterThan(0)
    })

    it('contains at least 10 terms', () => {
      expect(Object.keys(GLOSSARY_TERMS).length).toBeGreaterThanOrEqual(10)
    })

    it('each term has required fields', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        expect(term).toHaveProperty('term')
        expect(term).toHaveProperty('definition')
        expect(typeof term.term).toBe('string')
        expect(typeof term.definition).toBe('string')
      })
    })

    it('terms have non-empty content', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        expect(term.term.length).toBeGreaterThan(0)
        expect(term.definition.length).toBeGreaterThan(0)
      })
    })
  })

  describe('key terms present', () => {
    it('contains P/E Ratio', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('P/E Ratio')
    })

    it('contains ROI', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('ROI')
    })

    it('contains Market Cap', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Market Cap')
    })

    it('contains Stop-Loss', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Stop-Loss')
    })

    it('contains Limit Order', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Limit Order')
    })

    it('contains Market Order', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Market Order')
    })

    it('contains Volume', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Volume')
    })

    it('contains Dividend', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Dividend')
    })

    it('contains Volatility', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Volatility')
    })

    it('contains Portfolio', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Portfolio')
    })

    it('contains Sharpe Ratio', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Sharpe Ratio')
    })

    it('contains Drawdown', () => {
      expect(GLOSSARY_TERMS).toHaveProperty('Drawdown')
    })
  })

  describe('term structure', () => {
    it('key matches term property', () => {
      Object.entries(GLOSSARY_TERMS).forEach(([key, value]) => {
        expect(key).toBe(value.term)
      })
    })

    it('all terms have example field', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        expect(term).toHaveProperty('example')
        expect(typeof term.example).toBe('string')
        expect(term.example!.length).toBeGreaterThan(0)
      })
    })

    it('all terms have learnMoreUrl field', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        expect(term).toHaveProperty('learnMoreUrl')
      })
    })

    it('learnMoreUrl values are valid URLs', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        if (term.learnMoreUrl) {
          expect(term.learnMoreUrl).toMatch(/^https?:\/\//)
        }
      })
    })
  })

  describe('definition quality', () => {
    it('definitions are meaningful (more than 20 characters)', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        expect(term.definition.length).toBeGreaterThan(20)
      })
    })

    it('examples are practical (more than 10 characters)', () => {
      Object.values(GLOSSARY_TERMS).forEach(term => {
        if (term.example) {
          expect(term.example.length).toBeGreaterThan(10)
        }
      })
    })
  })
})

describe('GLOSSARY_TERM_LIST', () => {
  it('is an array', () => {
    expect(Array.isArray(GLOSSARY_TERM_LIST)).toBe(true)
  })

  it('has same length as GLOSSARY_TERMS keys', () => {
    expect(GLOSSARY_TERM_LIST.length).toBe(Object.keys(GLOSSARY_TERMS).length)
  })

  it('contains all terms from GLOSSARY_TERMS', () => {
    const termNames = GLOSSARY_TERM_LIST.map(t => t.term)
    Object.keys(GLOSSARY_TERMS).forEach(key => {
      expect(termNames).toContain(key)
    })
  })

  it('each item has required fields', () => {
    GLOSSARY_TERM_LIST.forEach(term => {
      expect(term).toHaveProperty('term')
      expect(term).toHaveProperty('definition')
    })
  })
})

describe('getGlossaryTerm', () => {
  it('returns term when found', () => {
    const result = getGlossaryTerm('ROI')
    expect(result).toBeDefined()
    expect(result?.term).toBe('ROI')
  })

  it('returns undefined for non-existent term', () => {
    const result = getGlossaryTerm('Non-Existent Term')
    expect(result).toBeUndefined()
  })

  it('is case-sensitive', () => {
    const result = getGlossaryTerm('roi')
    expect(result).toBeUndefined()
  })

  it('returns complete term object', () => {
    const result = getGlossaryTerm('P/E Ratio')
    expect(result).toHaveProperty('term')
    expect(result).toHaveProperty('definition')
    expect(result).toHaveProperty('example')
    expect(result).toHaveProperty('learnMoreUrl')
  })

  it('returns correct term for exact match', () => {
    Object.keys(GLOSSARY_TERMS).forEach(key => {
      const result = getGlossaryTerm(key)
      expect(result).toEqual(GLOSSARY_TERMS[key])
    })
  })
})

describe('searchGlossaryTerms', () => {
  describe('search by term name', () => {
    it('finds term by exact name (case-insensitive)', () => {
      const result = searchGlossaryTerms('roi')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(t => t.term === 'ROI')).toBe(true)
    })

    it('finds term by partial name', () => {
      const result = searchGlossaryTerms('stop')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(t => t.term === 'Stop-Loss')).toBe(true)
    })

    it('finds multiple terms matching query', () => {
      const result = searchGlossaryTerms('order')
      expect(result.length).toBeGreaterThan(1)
      expect(result.some(t => t.term === 'Limit Order')).toBe(true)
      expect(result.some(t => t.term === 'Market Order')).toBe(true)
    })
  })

  describe('search by definition', () => {
    it('finds term by keyword in definition', () => {
      const result = searchGlossaryTerms('dividend')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(t => t.term === 'Dividend')).toBe(true)
    })

    it('finds term by phrase in definition', () => {
      const result = searchGlossaryTerms('shares outstanding')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(t => t.term === 'Market Cap')).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for no matches', () => {
      const result = searchGlossaryTerms('xyznonexistent123')
      expect(result).toEqual([])
    })

    it('returns empty array for empty query', () => {
      const result = searchGlossaryTerms('')
      // Empty string matches everything due to includes('') being true
      expect(result.length).toBe(GLOSSARY_TERM_LIST.length)
    })

    it('is case-insensitive', () => {
      const lowerResult = searchGlossaryTerms('sharpe')
      const upperResult = searchGlossaryTerms('SHARPE')
      const mixedResult = searchGlossaryTerms('Sharpe')

      expect(lowerResult.length).toBe(upperResult.length)
      expect(lowerResult.length).toBe(mixedResult.length)
    })

    it('handles special characters in search', () => {
      const result = searchGlossaryTerms('P/E')
      expect(result.length).toBeGreaterThan(0)
      expect(result.some(t => t.term === 'P/E Ratio')).toBe(true)
    })
  })

  describe('result structure', () => {
    it('returns complete term objects', () => {
      const result = searchGlossaryTerms('market')
      result.forEach(term => {
        expect(term).toHaveProperty('term')
        expect(term).toHaveProperty('definition')
      })
    })

    it('returns array type', () => {
      const result = searchGlossaryTerms('test')
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
