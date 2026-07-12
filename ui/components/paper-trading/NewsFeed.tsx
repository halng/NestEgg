"use client"

import { useState, useMemo } from "react"
import { 
  Newspaper, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import type { NewsArticle, NewsCategory, NewsSentiment } from "@/lib/paper-trading/types"
import { 
  MOCK_NEWS_ARTICLES, 
  SENTIMENT_CONFIG, 
  CATEGORY_CONFIG,
  filterNewsByTickers,
  filterNewsByCategory 
} from "@/lib/paper-trading/mock-news"
import { formatRelativeTime } from "@/lib/paper-trading/formatters"

interface NewsFeedProps {
  heldTickers?: string[]
  maxItems?: number
  onViewAll?: () => void
}

const SENTIMENT_ICONS: Record<NewsSentiment, typeof TrendingUp> = {
  bullish: TrendingUp,
  bearish: TrendingDown,
  neutral: Minus,
}

type FilterType = 'all' | NewsCategory | 'portfolio'

export function NewsFeed({ 
  heldTickers = [], 
  maxItems = 5,
  onViewAll 
}: NewsFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredNews = useMemo(() => {
    let news = MOCK_NEWS_ARTICLES

    if (activeFilter === 'portfolio') {
      news = filterNewsByTickers(news, heldTickers)
    } else if (activeFilter !== 'all') {
      news = filterNewsByCategory(news, activeFilter)
    }

    return news.slice(0, maxItems)
  }, [activeFilter, heldTickers, maxItems])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'portfolio', label: 'My Stocks' },
    { value: 'market', label: 'Market' },
    { value: 'company', label: 'Company' },
    { value: 'analysis', label: 'Analysis' },
  ]

  const NewsCard = ({ article }: { article: NewsArticle }) => {
    const isExpanded = expandedId === article.id
    const sentimentConfig = SENTIMENT_CONFIG[article.sentiment]
    const categoryConfig = CATEGORY_CONFIG[article.category]
    const SentimentIcon = SENTIMENT_ICONS[article.sentiment]

    return (
      <div 
        className={`rounded-xl border border-border bg-card transition hover:border-primary/30 ${
          isExpanded ? 'border-primary/30' : ''
        }`}
      >
        <button
          onClick={() => setExpandedId(isExpanded ? null : article.id)}
          className="w-full text-left p-4"
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${sentimentConfig.bgColor} shrink-0`}>
              <SentimentIcon className={`h-4 w-4 ${sentimentConfig.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm leading-tight line-clamp-2">
                {article.title}
              </h4>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-medium ${categoryConfig.color}`}>
                  {categoryConfig.label}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {article.source}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(article.publishedAt)}
                </span>
              </div>

              {/* Tickers */}
              {article.tickers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {article.tickers.map(ticker => (
                    <span 
                      key={ticker}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-border/50 pt-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {article.summary}
            </p>
            
            <div className="flex items-center justify-between mt-4">
              <Badge 
                variant={
                  article.sentiment === 'bullish' ? 'success' : 
                  article.sentiment === 'bearish' ? 'danger' : 
                  'secondary'
                }
              >
                {sentimentConfig.label}
              </Badge>
              
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="h-3 w-3" />
                Read More
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <span className="font-semibold">Market News</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-7 w-7 p-0"
            title="Refresh news"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2 overflow-x-auto">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setActiveFilter(option.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition whitespace-nowrap ${
              activeFilter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {option.label}
            {option.value === 'portfolio' && heldTickers.length > 0 && (
              <span className="ml-1">({heldTickers.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* News List */}
      <div className="p-4 space-y-3">
        {filteredNews.length > 0 ? (
          <>
            {filteredNews.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
            
            {/* View All Link */}
            {onViewAll && MOCK_NEWS_ARTICLES.length > maxItems && (
              <button
                onClick={onViewAll}
                className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition flex items-center justify-center gap-1"
              >
                View All News
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No news available</p>
            <p className="text-sm text-muted-foreground/70">
              {activeFilter === 'portfolio' 
                ? 'No news for your held stocks' 
                : 'Check back later for updates'}
            </p>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="px-4 py-2 border-t border-border/50 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        Auto-refreshing every 5 minutes
      </div>
    </div>
  )
}
