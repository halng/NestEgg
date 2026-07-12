import {
  MOCK_NEWS_ARTICLES,
  SENTIMENT_CONFIG,
  CATEGORY_CONFIG,
  filterNewsByTickers,
  filterNewsByCategory,
} from '@/lib/paper-trading/mock-news'
import type { NewsCategory, NewsSentiment } from '@/lib/paper-trading/types'

describe('MOCK_NEWS_ARTICLES', () => {
  describe('data structure', () => {
    it('contains at least 10 articles', () => {
      expect(MOCK_NEWS_ARTICLES.length).toBeGreaterThanOrEqual(10)
    })

    it('each article has required properties', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(article).toHaveProperty('id')
        expect(article).toHaveProperty('title')
        expect(article).toHaveProperty('summary')
        expect(article).toHaveProperty('source')
        expect(article).toHaveProperty('publishedAt')
        expect(article).toHaveProperty('category')
        expect(article).toHaveProperty('sentiment')
        expect(article).toHaveProperty('tickers')
        expect(typeof article.id).toBe('string')
        expect(typeof article.title).toBe('string')
        expect(typeof article.summary).toBe('string')
        expect(typeof article.source).toBe('string')
        expect(typeof article.publishedAt).toBe('string')
        expect(Array.isArray(article.tickers)).toBe(true)
      })
    })

    it('articles have unique ids', () => {
      const ids = MOCK_NEWS_ARTICLES.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('categories', () => {
    it('has articles in all categories', () => {
      const categories = new Set(MOCK_NEWS_ARTICLES.map(a => a.category))
      expect(categories.has('market')).toBe(true)
      expect(categories.has('company')).toBe(true)
      expect(categories.has('analysis')).toBe(true)
    })

    it('all categories are valid', () => {
      const validCategories: NewsCategory[] = ['market', 'company', 'analysis']
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(validCategories).toContain(article.category)
      })
    })
  })

  describe('sentiments', () => {
    it('has articles with all sentiment types', () => {
      const sentiments = new Set(MOCK_NEWS_ARTICLES.map(a => a.sentiment))
      expect(sentiments.has('bullish')).toBe(true)
      expect(sentiments.has('bearish')).toBe(true)
      expect(sentiments.has('neutral')).toBe(true)
    })

    it('all sentiments are valid', () => {
      const validSentiments: NewsSentiment[] = ['bullish', 'bearish', 'neutral']
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(validSentiments).toContain(article.sentiment)
      })
    })
  })

  describe('tickers', () => {
    it('some articles have associated tickers', () => {
      const articlesWithTickers = MOCK_NEWS_ARTICLES.filter(a => a.tickers.length > 0)
      expect(articlesWithTickers.length).toBeGreaterThan(0)
    })

    it('some articles have no tickers (general market news)', () => {
      const articlesWithoutTickers = MOCK_NEWS_ARTICLES.filter(a => a.tickers.length === 0)
      expect(articlesWithoutTickers.length).toBeGreaterThan(0)
    })

    it('ticker symbols are uppercase strings', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        article.tickers.forEach(ticker => {
          expect(typeof ticker).toBe('string')
          expect(ticker).toBe(ticker.toUpperCase())
        })
      })
    })
  })

  describe('publishedAt', () => {
    it('all timestamps are valid ISO dates', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        const date = new Date(article.publishedAt)
        expect(date.toString()).not.toBe('Invalid Date')
      })
    })
  })

  describe('content', () => {
    it('titles are non-empty', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(article.title.length).toBeGreaterThan(0)
      })
    })

    it('summaries are non-empty', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(article.summary.length).toBeGreaterThan(0)
      })
    })

    it('sources are non-empty', () => {
      MOCK_NEWS_ARTICLES.forEach(article => {
        expect(article.source.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('SENTIMENT_CONFIG', () => {
  it('has config for all sentiment types', () => {
    expect(SENTIMENT_CONFIG).toHaveProperty('bullish')
    expect(SENTIMENT_CONFIG).toHaveProperty('bearish')
    expect(SENTIMENT_CONFIG).toHaveProperty('neutral')
  })

  it('each sentiment has required properties', () => {
    const sentiments: NewsSentiment[] = ['bullish', 'bearish', 'neutral']
    sentiments.forEach(sentiment => {
      const config = SENTIMENT_CONFIG[sentiment]
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
      expect(config).toHaveProperty('bgColor')
      expect(typeof config.label).toBe('string')
      expect(typeof config.color).toBe('string')
      expect(typeof config.bgColor).toBe('string')
    })
  })

  it('labels are human-readable', () => {
    expect(SENTIMENT_CONFIG.bullish.label).toBe('Bullish')
    expect(SENTIMENT_CONFIG.bearish.label).toBe('Bearish')
    expect(SENTIMENT_CONFIG.neutral.label).toBe('Neutral')
  })
})

describe('CATEGORY_CONFIG', () => {
  it('has config for all category types', () => {
    expect(CATEGORY_CONFIG).toHaveProperty('market')
    expect(CATEGORY_CONFIG).toHaveProperty('company')
    expect(CATEGORY_CONFIG).toHaveProperty('analysis')
  })

  it('each category has required properties', () => {
    const categories: NewsCategory[] = ['market', 'company', 'analysis']
    categories.forEach(category => {
      const config = CATEGORY_CONFIG[category]
      expect(config).toHaveProperty('label')
      expect(config).toHaveProperty('color')
      expect(typeof config.label).toBe('string')
      expect(typeof config.color).toBe('string')
    })
  })

  it('labels are human-readable', () => {
    expect(CATEGORY_CONFIG.market.label).toBe('Market')
    expect(CATEGORY_CONFIG.company.label).toBe('Company')
    expect(CATEGORY_CONFIG.analysis.label).toBe('Analysis')
  })
})

describe('filterNewsByTickers', () => {
  it('returns all news when ticker list is empty', () => {
    const result = filterNewsByTickers(MOCK_NEWS_ARTICLES, [])
    expect(result).toEqual(MOCK_NEWS_ARTICLES)
  })

  it('returns articles with matching tickers', () => {
    const result = filterNewsByTickers(MOCK_NEWS_ARTICLES, ['FPT'])
    
    result.forEach(article => {
      const hasMatchingTicker = article.tickers.includes('FPT') || article.tickers.length === 0
      expect(hasMatchingTicker).toBe(true)
    })
  })

  it('includes general market news (no tickers) when filtering', () => {
    const result = filterNewsByTickers(MOCK_NEWS_ARTICLES, ['UNKNOWN_TICKER'])
    const generalNews = result.filter(a => a.tickers.length === 0)
    expect(generalNews.length).toBeGreaterThan(0)
  })

  it('filters by multiple tickers', () => {
    const result = filterNewsByTickers(MOCK_NEWS_ARTICLES, ['FPT', 'VCB'])
    
    result.forEach(article => {
      const hasMatchingTicker = 
        article.tickers.includes('FPT') || 
        article.tickers.includes('VCB') || 
        article.tickers.length === 0
      expect(hasMatchingTicker).toBe(true)
    })
  })

  it('returns empty array when filtering empty news array', () => {
    const result = filterNewsByTickers([], ['FPT'])
    expect(result).toEqual([])
  })
})

describe('filterNewsByCategory', () => {
  it('returns all news when category is "all"', () => {
    const result = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'all')
    expect(result).toEqual(MOCK_NEWS_ARTICLES)
  })

  it('returns only market category articles', () => {
    const result = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'market')
    result.forEach(article => {
      expect(article.category).toBe('market')
    })
  })

  it('returns only company category articles', () => {
    const result = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'company')
    result.forEach(article => {
      expect(article.category).toBe('company')
    })
  })

  it('returns only analysis category articles', () => {
    const result = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'analysis')
    result.forEach(article => {
      expect(article.category).toBe('analysis')
    })
  })

  it('returns at least one article per category', () => {
    const categories: NewsCategory[] = ['market', 'company', 'analysis']
    categories.forEach(category => {
      const result = filterNewsByCategory(MOCK_NEWS_ARTICLES, category)
      expect(result.length).toBeGreaterThan(0)
    })
  })

  it('all articles are accounted for by categories', () => {
    const market = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'market')
    const company = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'company')
    const analysis = filterNewsByCategory(MOCK_NEWS_ARTICLES, 'analysis')

    const totalFiltered = market.length + company.length + analysis.length
    expect(totalFiltered).toBe(MOCK_NEWS_ARTICLES.length)
  })

  it('returns empty array when filtering empty news array', () => {
    const result = filterNewsByCategory([], 'market')
    expect(result).toEqual([])
  })
})

describe('combined filtering', () => {
  it('filters by both ticker and category', () => {
    const byTicker = filterNewsByTickers(MOCK_NEWS_ARTICLES, ['FPT'])
    const result = filterNewsByCategory(byTicker, 'company')

    result.forEach(article => {
      expect(article.category).toBe('company')
      const hasMatchingTicker = article.tickers.includes('FPT') || article.tickers.length === 0
      expect(hasMatchingTicker).toBe(true)
    })
  })
})
