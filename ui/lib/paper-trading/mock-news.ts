import type { NewsArticle, NewsCategory, NewsSentiment } from './types'

// Helper to generate relative timestamps
function getTimeAgo(hours: number): string {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

export const MOCK_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'FPT Reports Strong Q4 Earnings, Beats Expectations',
    summary: 'FPT Corporation announced quarterly earnings that exceeded analyst expectations, driven by strong growth in its IT services and digital transformation segments. Revenue grew 25% year-over-year, with the company citing increased demand for cloud and AI solutions.',
    source: 'VN Finance',
    publishedAt: getTimeAgo(0.5),
    category: 'company',
    sentiment: 'bullish',
    tickers: ['FPT'],
    imageUrl: undefined,
  },
  {
    id: 'news-2',
    title: 'Banking Sector Faces Headwinds as Interest Rates Rise',
    summary: 'Major Vietnamese banks are experiencing margin pressure as the State Bank of Vietnam signals a more hawkish monetary policy stance. Analysts suggest this could impact net interest margins for VCB and TCB in the coming quarters.',
    source: 'Market Watch VN',
    publishedAt: getTimeAgo(2),
    category: 'market',
    sentiment: 'bearish',
    tickers: ['VCB', 'TCB'],
    imageUrl: undefined,
  },
  {
    id: 'news-3',
    title: 'Vietnam Stock Market Analysis: Key Levels to Watch',
    summary: 'Technical analysis suggests VN-Index is approaching a critical resistance level at 1,280 points. Market breadth remains positive with advancing stocks outnumbering declining stocks. Trading volume has increased 15% compared to the 20-day average.',
    source: 'Chart Masters',
    publishedAt: getTimeAgo(4),
    category: 'analysis',
    sentiment: 'neutral',
    tickers: [],
    imageUrl: undefined,
  },
  {
    id: 'news-4',
    title: 'Tech Stocks Rally on AI Investment Surge',
    summary: 'Vietnamese technology stocks surged today following announcements of major AI investments. FPT Corporation leads the rally with plans to invest $200M in AI infrastructure over the next three years.',
    source: 'Tech Asia',
    publishedAt: getTimeAgo(6),
    category: 'market',
    sentiment: 'bullish',
    tickers: ['FPT'],
    imageUrl: undefined,
  },
  {
    id: 'news-5',
    title: 'Real Estate Market Shows Signs of Recovery',
    summary: 'Vietnam\'s real estate sector is showing early signs of recovery with major developers reporting improved sales figures. VHM and VIC shares have gained momentum as property transaction volumes increase in Ho Chi Minh City.',
    source: 'Property VN',
    publishedAt: getTimeAgo(8),
    category: 'market',
    sentiment: 'bullish',
    tickers: ['VHM', 'VIC'],
    imageUrl: undefined,
  },
  {
    id: 'news-6',
    title: 'HPG Steel Production Hits Record High',
    summary: 'Hoa Phat Group reported record steel production volumes in the latest quarter, benefiting from infrastructure spending and export demand. The company expects continued growth in the domestic construction sector.',
    source: 'Industrial News',
    publishedAt: getTimeAgo(10),
    category: 'company',
    sentiment: 'bullish',
    tickers: ['HPG'],
    imageUrl: undefined,
  },
  {
    id: 'news-7',
    title: 'Foreign Investors Turn Net Buyers After Three-Month Outflow',
    summary: 'International institutional investors have returned to the Vietnamese market, recording net buying of $50M last week. Analysts attribute this to attractive valuations and improving economic fundamentals.',
    source: 'Global Markets VN',
    publishedAt: getTimeAgo(14),
    category: 'market',
    sentiment: 'bullish',
    tickers: [],
    imageUrl: undefined,
  },
  {
    id: 'news-8',
    title: 'MWG Expands E-commerce Platform to Rural Areas',
    summary: 'Mobile World Group is accelerating its e-commerce expansion into rural Vietnam. The company plans to open 500 new pickup points and enhance its last-mile delivery network by year-end.',
    source: 'Retail Asia',
    publishedAt: getTimeAgo(18),
    category: 'company',
    sentiment: 'neutral',
    tickers: ['MWG'],
    imageUrl: undefined,
  },
  {
    id: 'news-9',
    title: 'Utilities Sector Under Pressure from Rising Coal Prices',
    summary: 'Vietnamese power utilities face margin compression as global coal prices remain elevated. Analysts recommend caution on the sector until fuel costs stabilize.',
    source: 'Energy Weekly',
    publishedAt: getTimeAgo(22),
    category: 'analysis',
    sentiment: 'bearish',
    tickers: [],
    imageUrl: undefined,
  },
  {
    id: 'news-10',
    title: 'VCB Launches New Digital Banking Features',
    summary: 'Vietcombank unveiled its next-generation mobile banking platform featuring AI-powered financial planning tools and instant loan approvals. The bank aims to capture the growing digital-first customer segment.',
    source: 'Banking Today',
    publishedAt: getTimeAgo(26),
    category: 'company',
    sentiment: 'bullish',
    tickers: ['VCB'],
    imageUrl: undefined,
  },
  {
    id: 'news-11',
    title: 'Weekly Market Outlook: Mixed Signals Ahead',
    summary: 'This week\'s market outlook remains mixed as investors weigh global economic concerns against strong domestic fundamentals. Key events include the monetary policy meeting and several corporate earnings releases.',
    source: 'Market Analysis VN',
    publishedAt: getTimeAgo(30),
    category: 'analysis',
    sentiment: 'neutral',
    tickers: [],
    imageUrl: undefined,
  },
  {
    id: 'news-12',
    title: 'TCB Reports Strong Loan Growth in SME Segment',
    summary: 'Techcombank announced 30% year-over-year growth in SME lending, driven by government support programs and digital loan processing improvements. Asset quality metrics remain healthy.',
    source: 'VN Finance',
    publishedAt: getTimeAgo(36),
    category: 'company',
    sentiment: 'bullish',
    tickers: ['TCB'],
    imageUrl: undefined,
  },
]

// Sentiment display configuration
export const SENTIMENT_CONFIG: Record<NewsSentiment, { label: string; color: string; bgColor: string }> = {
  bullish: { label: 'Bullish', color: 'text-success', bgColor: 'bg-success/10' },
  bearish: { label: 'Bearish', color: 'text-danger', bgColor: 'bg-danger/10' },
  neutral: { label: 'Neutral', color: 'text-muted-foreground', bgColor: 'bg-muted' },
}

// Category display configuration
export const CATEGORY_CONFIG: Record<NewsCategory, { label: string; color: string }> = {
  market: { label: 'Market', color: 'text-blue-500' },
  company: { label: 'Company', color: 'text-purple-500' },
  analysis: { label: 'Analysis', color: 'text-amber-500' },
}

// Helper to filter news by tickers
export function filterNewsByTickers(news: NewsArticle[], tickers: string[]): NewsArticle[] {
  if (tickers.length === 0) return news
  return news.filter(article => 
    article.tickers.length === 0 || 
    article.tickers.some(t => tickers.includes(t))
  )
}

// Helper to filter news by category
export function filterNewsByCategory(news: NewsArticle[], category: NewsCategory | 'all'): NewsArticle[] {
  if (category === 'all') return news
  return news.filter(article => article.category === category)
}
