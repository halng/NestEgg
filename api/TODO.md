# API TODO

## Current market baseline for the stock screener

### Core/common features (must-have)
- [ ] Symbol master data for ticker, exchange, sector, industry, trading status, and lot size
- [ ] Historical OHLCV data for daily screening plus intraday snapshots for real-time market views
- [ ] Fundamental datasets for financial statements, valuation ratios, profitability, growth, leverage, and dividend history
- [ ] Corporate action and event feeds for earnings dates, ex-dividend dates, splits, rights issues, and filings
- [ ] Screening engine that supports compound filters, sorting, ranking, pagination, and reusable presets
- [ ] Compare service that returns normalized metrics for multiple tickers in a single response
- [ ] Chart and snapshot endpoints for mini charts, detail charts, and key-stat cards
- [ ] News/catalyst aggregation service that can be filtered by ticker, sector, and date range
- [ ] Persistence for saved screens, watchlists, alert rules, notes, and default column layouts
- [ ] Notification pipeline for price, technical, and screener-match alerts
- [ ] Export endpoints for CSV/Excel downloads and shareable screener configurations
- [ ] Background jobs for data ingestion, recalculation, cache refresh, and alert evaluation
- [ ] Data quality checks for stale feeds, missing fields, and corporate action reconciliation
- [ ] Access control and rate limiting for personalized features and heavier screening workloads

### Differentiating features (nice-to-have / competitive edge)
- [ ] Ownership datasets for insider trades, institutional holdings, and foreign ownership limits where supported
- [ ] Market breadth and heatmap aggregates by exchange, sector, and custom watchlists
