# Paper Trading UI Implementation Plan

> **Scope**: UI-only implementation with mock data  
> **Tech Stack**: Next.js 14+, React, TypeScript, Tailwind CSS, Recharts  
> **Status**: Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Architecture Overview](#3-architecture-overview)
4. [Phase 1: Must-Have Features (P0)](#4-phase-1-must-have-features-p0)
5. [Phase 2: Should-Have Features (P1)](#5-phase-2-should-have-features-p1)
6. [Phase 3: Nice-to-Have Features (P2)](#6-phase-3-nice-to-have-features-p2)
7. [File Structure](#7-file-structure)
8. [Mock Data Strategy](#8-mock-data-strategy)
9. [Component Specifications](#9-component-specifications)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Executive Summary

This plan outlines the implementation of a comprehensive Paper Trading platform UI with **45+ features** across three priority phases. All features will initially use mock data, allowing rapid UI development and user testing before backend integration.

**Key Deliverables:**
- Enhanced trade ticket with advanced order types
- Complete order management system
- Portfolio analytics dashboard
- Performance tracking with charts
- Educational onboarding flow
- Social/gamification features

---

## 2. Current State Analysis

### Existing Implementation

| Component | File | Status |
|-----------|------|--------|
| Main Page | `ui/app/paper-trading/page.tsx` | ✅ Implemented |
| API Layer | `ui/lib/paper-trading-api.ts` | ✅ Basic |
| Market Watch | Inline component | ✅ Basic |
| Trade Ticket | Inline component | ✅ Market orders only |
| Holdings Table | Inline component | ✅ Basic |
| Transaction Ledger | Inline component | ✅ Last 6 entries |

### Current Data Models

```typescript
// Existing interfaces in paper-trading-api.ts
interface PaperTradingSession {
  accountId: string
  startingCapital: number
  cashBalance: number
  totalPortfolioValue: number
  roiPercent: number
  marketWatch: PaperTradingMarketTicker[]
  holdings: PaperTradingHolding[]
  ledger: PaperTradingLedgerEntry[]
  mentorMessage: string
}
```

### Gaps to Address

- No limit/stop orders
- No order history page
- No pending orders view
- No portfolio analytics/charts
- No price alerts
- No educational content
- No social features

---

## 3. Architecture Overview

### Folder Structure (Target)

```
ui/
├── app/
│   └── paper-trading/
│       ├── page.tsx                    # Main dashboard (refactored)
│       ├── orders/
│       │   └── page.tsx                # Order history page
│       ├── analytics/
│       │   └── page.tsx                # Analytics dashboard
│       ├── alerts/
│       │   └── page.tsx                # Price alerts page
│       ├── journal/
│       │   └── page.tsx                # Trade journal
│       ├── leaderboard/
│       │   └── page.tsx                # Social leaderboard
│       └── competitions/
│           └── page.tsx                # Trading competitions
├── components/
│   └── paper-trading/
│       ├── TradeTicket.tsx             # Enhanced order form
│       ├── OrderTypeSelector.tsx       # Order type radio group
│       ├── QuantityInput.tsx           # Shares input with +/- buttons
│       ├── PriceInput.tsx              # Limit/stop price input
│       ├── TimeInForceSelect.tsx       # DAY/GTC/IOC selector
│       ├── OrderConfirmDialog.tsx      # Confirmation modal
│       ├── OrderSuccessToast.tsx       # Success notification
│       ├── PendingOrdersTable.tsx      # Active orders list
│       ├── OrderHistoryTable.tsx       # Full order history
│       ├── OrderFilters.tsx            # Date/status/ticker filters
│       ├── PortfolioChart.tsx          # Value over time line chart
│       ├── SectorAllocationChart.tsx   # Pie chart breakdown
│       ├── PerformanceMetrics.tsx      # Win rate, Sharpe, etc.
│       ├── HoldingsTable.tsx           # Enhanced holdings view
│       ├── MarketWatchGrid.tsx         # Stock cards grid
│       ├── PriceAlertForm.tsx          # Create alert form
│       ├── PriceAlertsList.tsx         # Active alerts list
│       ├── TradeJournalEntry.tsx       # Journal note card
│       ├── TradeJournalForm.tsx        # Add/edit journal
│       ├── LeaderboardTable.tsx        # Rankings table
│       ├── AchievementBadge.tsx        # Badge component
│       ├── AchievementsList.tsx        # User achievements
│       ├── CompetitionCard.tsx         # Competition preview
│       ├── OnboardingTour.tsx          # Interactive tutorial
│       ├── RiskQuiz.tsx                # Risk assessment
│       └── GlossaryTooltip.tsx         # Term definitions
└── lib/
    └── paper-trading/
        ├── mock-data.ts                # All mock data
        ├── mock-orders.ts              # Order mock functions
        ├── mock-analytics.ts           # Analytics mock data
        ├── mock-alerts.ts              # Alerts mock data
        ├── mock-social.ts              # Leaderboard/achievements
        ├── types.ts                    # All TypeScript interfaces
        ├── constants.ts                # Order types, time-in-force
        ├── formatters.ts               # Currency, number formatters
        ├── validators.ts               # Order validation logic
        └── calculations.ts             # P&L, metrics calculations
```

### State Management Strategy

For mock data phase, use React Context + useState:

```typescript
// ui/lib/paper-trading/PaperTradingContext.tsx
interface PaperTradingState {
  session: PaperTradingSession | null
  pendingOrders: Order[]
  orderHistory: Order[]
  alerts: PriceAlert[]
  analytics: PortfolioAnalytics | null
  achievements: Achievement[]
  journalEntries: JournalEntry[]
}
```

---

## 4. Phase 1: Must-Have Features (P0)

### 4.1 Enhanced Trade Ticket with Order Types

**Task ID**: P0-001  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 6

#### Acceptance Criteria
- [ ] User can select order type: Market, Limit, Stop, Stop-Limit
- [ ] Limit price input appears when Limit or Stop-Limit selected
- [ ] Stop price input appears when Stop or Stop-Limit selected
- [ ] Time-in-force selector (DAY, GTC, IOC, FOK)
- [ ] Real-time estimated value calculation
- [ ] Buy/Sell buttons with appropriate styling
- [ ] Validation prevents invalid orders (insufficient funds, etc.)

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-001-A | `components/paper-trading/TradeTicket.tsx` | Main trade form component |
| P0-001-B | `components/paper-trading/OrderTypeSelector.tsx` | Radio group for order types |
| P0-001-C | `components/paper-trading/QuantityInput.tsx` | Number input with +/- buttons |
| P0-001-D | `components/paper-trading/PriceInput.tsx` | Price input with currency format |
| P0-001-E | `components/paper-trading/TimeInForceSelect.tsx` | Dropdown selector |
| P0-001-F | `lib/paper-trading/validators.ts` | Order validation functions |

#### TypeScript Interfaces

```typescript
// lib/paper-trading/types.ts

export type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT" | "TRAILING_STOP"
export type OrderSide = "BUY" | "SELL"
export type TimeInForce = "DAY" | "GTC" | "IOC" | "FOK"
export type OrderStatus = "PENDING" | "FILLED" | "PARTIAL" | "CANCELLED" | "REJECTED"

export interface PlaceOrderRequest {
  ticker: string
  side: OrderSide
  orderType: OrderType
  shares: number
  limitPrice?: number
  stopPrice?: number
  trailPercent?: number
  timeInForce: TimeInForce
}

export interface OrderValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
```

---

### 4.2 Order Confirmation Dialog

**Task ID**: P0-002  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Modal appears before order submission
- [ ] Shows complete order summary (ticker, shares, price, type, estimated total)
- [ ] Shows impact on buying power
- [ ] Confirm and Cancel buttons
- [ ] Keyboard accessible (Enter to confirm, Escape to cancel)

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-002-A | `components/paper-trading/OrderConfirmDialog.tsx` | Confirmation modal |

---

### 4.3 Pending Orders View

**Task ID**: P0-003  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Table shows all pending (unfilled) orders
- [ ] Columns: Ticker, Side, Type, Shares, Limit/Stop Price, Created, Actions
- [ ] Modify button opens edit form
- [ ] Cancel button with confirmation
- [ ] Empty state when no pending orders

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-003-A | `components/paper-trading/PendingOrdersTable.tsx` | Pending orders table |
| P0-003-B | `components/paper-trading/ModifyOrderDialog.tsx` | Edit order modal |

#### Mock Data

```typescript
// lib/paper-trading/mock-orders.ts

export const mockPendingOrders: Order[] = [
  {
    id: "ord-001",
    ticker: "FPT",
    side: "BUY",
    orderType: "LIMIT",
    status: "PENDING",
    requestedShares: 100,
    filledShares: 0,
    limitPrice: 110000,
    timeInForce: "GTC",
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "ord-002",
    ticker: "VCB",
    side: "SELL",
    orderType: "STOP",
    status: "PENDING",
    requestedShares: 50,
    filledShares: 0,
    stopPrice: 85000,
    timeInForce: "DAY",
    createdAt: "2024-01-15T10:15:00Z",
  },
]
```

---

### 4.4 Order History Page

**Task ID**: P0-004  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] Dedicated page at `/paper-trading/orders`
- [ ] Table with all historical orders
- [ ] Columns: Date, Ticker, Side, Type, Status, Shares, Price, Total
- [ ] Filter by: Date range, Side, Status, Ticker
- [ ] Sortable columns
- [ ] Pagination (20 per page)
- [ ] Export to CSV button

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-004-A | `app/paper-trading/orders/page.tsx` | Order history page |
| P0-004-B | `components/paper-trading/OrderHistoryTable.tsx` | Full order history table |
| P0-004-C | `components/paper-trading/OrderFilters.tsx` | Filter controls |

#### Mock Data

```typescript
// lib/paper-trading/mock-orders.ts

export const mockOrderHistory: Order[] = [
  {
    id: "ord-100",
    ticker: "FPT",
    side: "BUY",
    orderType: "MARKET",
    status: "FILLED",
    requestedShares: 100,
    filledShares: 100,
    executedPrice: 112500,
    total: 11250000,
    createdAt: "2024-01-10T09:00:00Z",
    executedAt: "2024-01-10T09:00:05Z",
  },
  // ... 50+ more entries with variety
]
```

---

### 4.5 Portfolio Value Chart (P&L Over Time)

**Task ID**: P0-005  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Line chart showing portfolio value over time
- [ ] Time period selector: 1D, 1W, 1M, 3M, 6M, 1Y, ALL
- [ ] Hover tooltip shows exact value and date
- [ ] Green/red color based on profit/loss vs starting capital
- [ ] Responsive sizing

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-005-A | `components/paper-trading/PortfolioChart.tsx` | Main chart component |
| P0-005-B | `lib/paper-trading/mock-analytics.ts` | Mock time-series data |

#### Mock Data

```typescript
// lib/paper-trading/mock-analytics.ts

export function generatePortfolioHistory(days: number): PortfolioSnapshot[] {
  const history: PortfolioSnapshot[] = []
  let value = 100_000_000 // Starting capital
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * value * 0.02
    value = Math.max(value + change, value * 0.5)
    
    history.push({
      date: date.toISOString().split('T')[0],
      portfolioValue: Math.round(value),
      cashBalance: Math.round(value * 0.3),
      holdingsValue: Math.round(value * 0.7),
    })
  }
  return history
}
```

---

### 4.6 Sector Allocation Chart

**Task ID**: P0-006  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Pie/donut chart showing holdings by sector
- [ ] Legend with sector names and percentages
- [ ] Hover shows exact value
- [ ] Colors consistent with design system
- [ ] "No holdings" state

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-006-A | `components/paper-trading/SectorAllocationChart.tsx` | Pie chart component |

---

### 4.7 Mobile-Responsive Trade Ticket

**Task ID**: P0-007  
**Priority**: P0 (Must-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Bottom sheet on mobile (< 640px)
- [ ] Sticky "Trade" FAB button
- [ ] Touch-friendly quantity controls
- [ ] Full-width on tablet
- [ ] Collapsible advanced options

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P0-007-A | `components/paper-trading/MobileTradeSheet.tsx` | Mobile bottom sheet |
| P0-007-B | `components/paper-trading/TradeFAB.tsx` | Floating action button |

---

## 5. Phase 2: Should-Have Features (P1)

### 5.1 Trailing Stop Orders

**Task ID**: P1-001  
**Priority**: P1 (Should-Have)

#### Acceptance Criteria
- [ ] Trail percentage input (1-20%)
- [ ] Visual explanation of trailing stop behavior
- [ ] Preview of current trigger price

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-001-A | Update `TradeTicket.tsx` | Add trailing stop option |
| P1-001-B | `components/paper-trading/TrailingStopPreview.tsx` | Visual explanation |

---

### 5.2 Price Alerts

**Task ID**: P1-002  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] Create alert: Ticker, Condition (Above/Below/Cross), Target Price
- [ ] List of active alerts with status
- [ ] Delete/edit alerts
- [ ] Visual notification when alert would trigger (mock)
- [ ] Dedicated `/paper-trading/alerts` page

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-002-A | `app/paper-trading/alerts/page.tsx` | Alerts page |
| P1-002-B | `components/paper-trading/PriceAlertForm.tsx` | Create alert form |
| P1-002-C | `components/paper-trading/PriceAlertsList.tsx` | Alerts list |
| P1-002-D | `lib/paper-trading/mock-alerts.ts` | Mock alerts data |

---

### 5.3 Performance Metrics Dashboard

**Task ID**: P1-003  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Dedicated analytics page `/paper-trading/analytics`
- [ ] Key metrics: Total Return, Win Rate, Max Drawdown, Sharpe Ratio
- [ ] Profit Factor, Average Win, Average Loss
- [ ] Total Trades count
- [ ] Metric cards with trend indicators

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-003-A | `app/paper-trading/analytics/page.tsx` | Analytics page |
| P1-003-B | `components/paper-trading/PerformanceMetrics.tsx` | Metrics grid |
| P1-003-C | `lib/paper-trading/calculations.ts` | Metric calculations |

#### Mock Data

```typescript
// lib/paper-trading/mock-analytics.ts

export const mockPerformanceMetrics: PerformanceMetrics = {
  totalReturn: 12_500_000,
  totalReturnPercent: 12.5,
  dailyReturn: 0.8,
  weeklyReturn: 3.2,
  monthlyReturn: 8.5,
  maxDrawdown: -8.2,
  volatility: 15.3,
  sharpeRatio: 1.42,
  totalTrades: 47,
  winningTrades: 32,
  losingTrades: 15,
  winRate: 68.1,
  avgWinAmount: 850_000,
  avgLossAmount: 320_000,
  profitFactor: 2.65,
}
```

---

### 5.4 Trade Journal

**Task ID**: P1-004  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] Add notes to individual trades
- [ ] Journal page `/paper-trading/journal`
- [ ] Rich text editor for entries
- [ ] Tags/categories for entries
- [ ] Search journal entries
- [ ] Link journal to specific orders

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-004-A | `app/paper-trading/journal/page.tsx` | Journal page |
| P1-004-B | `components/paper-trading/TradeJournalEntry.tsx` | Journal entry card |
| P1-004-C | `components/paper-trading/TradeJournalForm.tsx` | Add/edit journal |

---

### 5.5 Position Sizing Calculator

**Task ID**: P1-005  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Input: Risk percentage (1-5% of portfolio)
- [ ] Input: Stop-loss distance
- [ ] Output: Recommended position size
- [ ] Warning if position exceeds risk tolerance

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-005-A | `components/paper-trading/PositionSizeCalculator.tsx` | Calculator widget |

---

### 5.6 Export Trades to CSV

**Task ID**: P1-006  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Export button on Order History page
- [ ] CSV includes all visible columns
- [ ] Respects current filters
- [ ] Filename includes date range

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-006-A | `lib/paper-trading/export.ts` | CSV export utility |

---

### 5.7 Dark/Light Mode Toggle

**Task ID**: P1-007  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Toggle in header/settings
- [ ] Persists to localStorage
- [ ] Smooth transition
- [ ] All charts respect theme

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-007-A | `components/paper-trading/ThemeToggle.tsx` | Theme toggle button |

---

### 5.8 Watchlist Integration

**Task ID**: P1-008  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Quick-trade button on watchlist items
- [ ] Opens trade ticket pre-filled with ticker
- [ ] Badge showing current position if held

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-008-A | Update `app/watchlist/page.tsx` | Add trade integration |

---

### 5.9 Dividend Simulation

**Task ID**: P1-009  
**Priority**: P1 (Should-Have)  
**Estimated Components**: 1

#### Acceptance Criteria
- [ ] Mock dividend calendar
- [ ] Auto-credit dividends to cash balance (mock)
- [ ] Dividend history in ledger

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P1-009-A | `lib/paper-trading/mock-dividends.ts` | Dividend simulation |

---

## 6. Phase 3: Nice-to-Have Features (P2)

### 6.1 Leaderboard

**Task ID**: P2-001  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Page `/paper-trading/leaderboard`
- [ ] Table: Rank, Username, ROI%, Portfolio Value
- [ ] Time period filter: Week, Month, All-time
- [ ] Current user highlighted
- [ ] Top 3 with special styling

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-001-A | `app/paper-trading/leaderboard/page.tsx` | Leaderboard page |
| P2-001-B | `components/paper-trading/LeaderboardTable.tsx` | Rankings table |
| P2-001-C | `lib/paper-trading/mock-social.ts` | Mock leaderboard data |

#### Mock Data

```typescript
// lib/paper-trading/mock-social.ts

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "TraderPro", roi: 45.2, portfolioValue: 145_200_000, trades: 124 },
  { rank: 2, username: "VNStocks", roi: 38.7, portfolioValue: 138_700_000, trades: 89 },
  { rank: 3, username: "BullMarket", roi: 32.1, portfolioValue: 132_100_000, trades: 156 },
  // ... more entries
]
```

---

### 6.2 Trading Competitions

**Task ID**: P2-002  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] List of available competitions
- [ ] Join/leave competition
- [ ] Competition-specific leaderboard
- [ ] Start/end dates
- [ ] Prize display (mock)

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-002-A | `app/paper-trading/competitions/page.tsx` | Competitions page |
| P2-002-B | `components/paper-trading/CompetitionCard.tsx` | Competition preview |
| P2-002-C | `components/paper-trading/CompetitionDetails.tsx` | Full competition view |

---

### 6.3 Achievement Badges

**Task ID**: P2-003  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Achievement categories: Trading, Learning, Social
- [ ] Unlocked vs locked state
- [ ] Progress indicator for in-progress achievements
- [ ] Toast notification when unlocked (mock)

#### Achievements List

| Achievement | Condition | Category |
|-------------|-----------|----------|
| First Trade | Complete first order | Trading |
| Diversifier | Hold 5+ different stocks | Trading |
| Profit Master | 10% portfolio gain | Trading |
| Risk Manager | Use stop-loss 10 times | Trading |
| Day Trader | 10 trades in one day | Trading |
| Long Term Investor | Hold stock 30+ days | Trading |
| Journal Keeper | Write 10 journal entries | Learning |
| Quiz Master | Complete risk assessment | Learning |
| Social Butterfly | Share a trade | Social |
| Top 10 | Reach leaderboard top 10 | Social |

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-003-A | `components/paper-trading/AchievementBadge.tsx` | Single badge |
| P2-003-B | `components/paper-trading/AchievementsList.tsx` | User achievements |
| P2-003-C | `lib/paper-trading/mock-achievements.ts` | Mock achievements |

---

### 6.4 Technical Indicators on Charts

**Task ID**: P2-004  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Toggle indicators: SMA, EMA, RSI, MACD, Bollinger Bands
- [ ] Configurable periods
- [ ] Separate indicator panel for RSI/MACD

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-004-A | `components/paper-trading/TechnicalIndicators.tsx` | Indicator selector |
| P2-004-B | `lib/paper-trading/indicators.ts` | Indicator calculations |

---

### 6.5 Onboarding Tutorial

**Task ID**: P2-005  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] Welcome modal for first-time users
- [ ] Step-by-step tour highlighting UI elements
- [ ] Skip option
- [ ] Progress indicator
- [ ] Completion achievement

#### Tour Steps

1. Welcome to Paper Trading
2. Your Portfolio Summary
3. Market Watch - Select a Stock
4. Trade Ticket - Place Your First Order
5. Holdings - Track Your Positions
6. Transaction History
7. You're Ready!

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-005-A | `components/paper-trading/OnboardingTour.tsx` | Tour component |
| P2-005-B | `components/paper-trading/TourStep.tsx` | Individual step |
| P2-005-C | `lib/paper-trading/onboarding.ts` | Tour configuration |

---

### 6.6 Risk Assessment Quiz

**Task ID**: P2-006  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] 5-7 question quiz
- [ ] Determines risk tolerance: Conservative, Moderate, Aggressive
- [ ] Results influence position sizing suggestions
- [ ] Can retake quiz

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-006-A | `components/paper-trading/RiskQuiz.tsx` | Quiz component |
| P2-006-B | `lib/paper-trading/risk-profile.ts` | Quiz logic |

---

### 6.7 Glossary Tooltips

**Task ID**: P2-007  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Hover tooltips on financial terms
- [ ] Terms: P/E, ROI, Market Cap, Stop-Loss, etc.
- [ ] Link to learn more

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-007-A | `components/paper-trading/GlossaryTooltip.tsx` | Tooltip component |
| P2-007-B | `lib/paper-trading/glossary.ts` | Term definitions |

---

### 6.8 News Integration

**Task ID**: P2-008  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] News feed widget
- [ ] Filter by held stocks
- [ ] Mock news articles
- [ ] Link to full article (mock)

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-008-A | `components/paper-trading/NewsFeed.tsx` | News widget |
| P2-008-B | `lib/paper-trading/mock-news.ts` | Mock news data |

---

### 6.9 Multiple Portfolios

**Task ID**: P2-009  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 2

#### Acceptance Criteria
- [ ] Create named portfolios (e.g., "Growth", "Value", "Test")
- [ ] Switch between portfolios
- [ ] Each has separate balance and holdings
- [ ] Compare portfolio performance

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-009-A | `components/paper-trading/PortfolioSwitcher.tsx` | Portfolio selector |
| P2-009-B | `components/paper-trading/CreatePortfolioDialog.tsx` | Create dialog |

---

### 6.10 Strategy Backtesting

**Task ID**: P2-010  
**Priority**: P2 (Nice-to-Have)  
**Estimated Components**: 3

#### Acceptance Criteria
- [ ] Define simple rules (e.g., buy when RSI < 30)
- [ ] Run against historical data (mock)
- [ ] Show hypothetical results
- [ ] Compare to buy-and-hold

#### Implementation Tasks

| Task | File | Description |
|------|------|-------------|
| P2-010-A | `components/paper-trading/BacktestForm.tsx` | Strategy builder |
| P2-010-B | `components/paper-trading/BacktestResults.tsx` | Results display |
| P2-010-C | `lib/paper-trading/backtest.ts` | Backtest engine |

---

## 7. File Structure

### New Files to Create

```
ui/
├── app/paper-trading/
│   ├── orders/page.tsx           # P0-004
│   ├── analytics/page.tsx        # P1-003
│   ├── alerts/page.tsx           # P1-002
│   ├── journal/page.tsx          # P1-004
│   ├── leaderboard/page.tsx      # P2-001
│   └── competitions/page.tsx     # P2-002
│
├── components/paper-trading/
│   │── TradeTicket.tsx           # P0-001
│   ├── OrderTypeSelector.tsx     # P0-001
│   ├── QuantityInput.tsx         # P0-001
│   ├── PriceInput.tsx            # P0-001
│   ├── TimeInForceSelect.tsx     # P0-001
│   ├── OrderConfirmDialog.tsx    # P0-002
│   ├── PendingOrdersTable.tsx    # P0-003
│   ├── ModifyOrderDialog.tsx     # P0-003
│   ├── OrderHistoryTable.tsx     # P0-004
│   ├── OrderFilters.tsx          # P0-004
│   ├── PortfolioChart.tsx        # P0-005
│   ├── SectorAllocationChart.tsx # P0-006
│   ├── MobileTradeSheet.tsx      # P0-007
│   ├── TradeFAB.tsx              # P0-007
│   ├── TrailingStopPreview.tsx   # P1-001
│   ├── PriceAlertForm.tsx        # P1-002
│   ├── PriceAlertsList.tsx       # P1-002
│   ├── PerformanceMetrics.tsx    # P1-003
│   ├── TradeJournalEntry.tsx     # P1-004
│   ├── TradeJournalForm.tsx      # P1-004
│   ├── PositionSizeCalculator.tsx# P1-005
│   ├── ThemeToggle.tsx           # P1-007
│   ├── LeaderboardTable.tsx      # P2-001
│   ├── CompetitionCard.tsx       # P2-002
│   ├── CompetitionDetails.tsx    # P2-002
│   ├── AchievementBadge.tsx      # P2-003
│   ├── AchievementsList.tsx      # P2-003
│   ├── TechnicalIndicators.tsx   # P2-004
│   ├── OnboardingTour.tsx        # P2-005
│   ├── TourStep.tsx              # P2-005
│   ├── RiskQuiz.tsx              # P2-006
│   ├── GlossaryTooltip.tsx       # P2-007
│   ├── NewsFeed.tsx              # P2-008
│   ├── PortfolioSwitcher.tsx     # P2-009
│   ├── CreatePortfolioDialog.tsx # P2-009
│   ├── BacktestForm.tsx          # P2-010
│   └── BacktestResults.tsx       # P2-010
│
└── lib/paper-trading/
    ├── types.ts                  # All interfaces
    ├── constants.ts              # Enums, constants
    ├── mock-data.ts              # Session mock
    ├── mock-orders.ts            # Orders mock
    ├── mock-analytics.ts         # Analytics mock
    ├── mock-alerts.ts            # Alerts mock
    ├── mock-social.ts            # Leaderboard mock
    ├── mock-achievements.ts      # Achievements mock
    ├── mock-news.ts              # News mock
    ├── formatters.ts             # Currency/number
    ├── validators.ts             # Order validation
    ├── calculations.ts           # Metrics calc
    ├── indicators.ts             # Technical analysis
    ├── export.ts                 # CSV export
    ├── onboarding.ts             # Tour config
    ├── risk-profile.ts           # Quiz logic
    ├── glossary.ts               # Terms
    └── backtest.ts               # Backtest engine
```

---

## 8. Mock Data Strategy

### 8.1 Data Generation Principles

1. **Realistic Values**: Use actual Vietnam stock tickers, realistic prices
2. **Consistent State**: Mock functions should maintain state across calls
3. **Deterministic Seeds**: Allow reproducible data for testing
4. **Edge Cases**: Include empty states, error states, boundary values

### 8.2 Mock API Layer

Create a mock API layer that mirrors real API structure:

```typescript
// lib/paper-trading/mock-api.ts

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true"

export async function fetchSession(userId: string): Promise<PaperTradingSession> {
  if (USE_MOCK) {
    return mockSession
  }
  return realFetchSession(userId)
}

export async function placeOrder(userId: string, order: PlaceOrderRequest): Promise<Order> {
  if (USE_MOCK) {
    return simulateOrderExecution(order)
  }
  return realPlaceOrder(userId, order)
}
```

### 8.3 Local Storage Persistence

For mock data, persist state to localStorage:

```typescript
// lib/paper-trading/mock-storage.ts

const STORAGE_KEY = "nestegg_paper_trading_mock"

export function saveMockState(state: MockState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadMockState(): MockState | null {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : null
}
```

---

## 9. Component Specifications

### 9.1 TradeTicket Component

```typescript
interface TradeTicketProps {
  marketWatch: PaperTradingMarketTicker[]
  selectedTicker: string | null
  cashBalance: number
  holdings: PaperTradingHolding[]
  onOrderSubmit: (order: PlaceOrderRequest) => Promise<void>
  onTickerSelect: (ticker: string) => void
  disabled?: boolean
}
```

**States:**
- Default: Market order selected, quantity = 100
- Limit: Shows limit price input
- Stop: Shows stop price input
- Stop-Limit: Shows both inputs
- Trailing Stop: Shows trail percentage slider

### 9.2 Color Scheme

| Element | Light Mode | Dark Mode | CSS Variable |
|---------|------------|-----------|--------------|
| Profit/Up | `#10b981` | `#34d399` | `--color-success` |
| Loss/Down | `#ef4444` | `#f87171` | `--color-danger` |
| Ceiling | `#8b5cf6` | `#a78bfa` | `--color-ceiling` |
| Floor | `#06b6d4` | `#22d3ee` | `--color-floor` |
| Primary | `#10b981` | `#10b981` | `--color-primary` |
| Muted | `#6b7280` | `#9ca3af` | `--color-muted` |

---

## 10. Testing Strategy

### 10.1 Unit Tests

- All calculation functions in `lib/paper-trading/calculations.ts`
- All validation functions in `lib/paper-trading/validators.ts`
- Mock data generators

### 10.2 Component Tests

- TradeTicket form validation
- Order confirmation flow
- Chart rendering with mock data

### 10.3 E2E Tests (Cypress)

```typescript
// cypress/e2e/paper-trading.cy.ts

describe("Paper Trading", () => {
  it("places a market order", () => {
    cy.login()
    cy.visit("/paper-trading")
    cy.get("[data-testid=ticker-select]").select("FPT")
    cy.get("[data-testid=quantity-input]").clear().type("100")
    cy.get("[data-testid=buy-button]").click()
    cy.get("[data-testid=confirm-dialog]").should("be.visible")
    cy.get("[data-testid=confirm-button]").click()
    cy.contains("Order placed successfully")
  })
  
  it("places a limit order", () => {
    cy.login()
    cy.visit("/paper-trading")
    cy.get("[data-testid=order-type-limit]").click()
    cy.get("[data-testid=limit-price-input]").should("be.visible")
    cy.get("[data-testid=limit-price-input]").type("110000")
    cy.get("[data-testid=buy-button]").click()
    cy.get("[data-testid=confirm-dialog]").contains("Limit Order")
  })
})
```

---

## Summary

### Task Count by Phase

| Phase | Tasks | Components | Pages |
|-------|-------|------------|-------|
| P0 (Must-Have) | 7 major tasks | ~15 components | 1 page |
| P1 (Should-Have) | 9 major tasks | ~12 components | 3 pages |
| P2 (Nice-to-Have) | 10 major tasks | ~18 components | 2 pages |
| **Total** | **26 tasks** | **~45 components** | **6 pages** |

### Recommended Execution Order

1. **Start**: P0-001 (Enhanced Trade Ticket) - Foundation for all trading
2. **Then**: P0-002-003 (Confirm Dialog + Pending Orders) - Complete order flow
3. **Then**: P0-004 (Order History Page) - Full order visibility
4. **Then**: P0-005-006 (Charts) - Portfolio visualization
5. **Then**: P0-007 (Mobile) - Responsive design
6. **Phase 2**: Start with P1-002 (Alerts) and P1-003 (Analytics)
7. **Phase 3**: Gamification features last

---

*Document Version: 1.0*  
*Created: July 2026*  
*Last Updated: July 2026*
