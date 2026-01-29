# Stock Screener Feature

## Overview

The Stock Screener allows users to view and explore the stock universe with sorting capabilities. This feature displays all available stocks from locally cached snapshots.

## Features

### Display Stock Information
Each stock displays:
- **Ticker Symbol**: Unique identifier for the stock
- **Company Name**: Full company name
- **Exchange**: Trading exchange
- **Market Capitalization**: Market cap with formatted display (T/B/M)

### Sorting Capabilities
Users can sort stocks by:
- **Symbol (Alphabetical)**: A-Z or Z-A
- **Market Capitalization**: Ascending or Descending

Click on a sort button to apply it. Click again to reverse the order.

### Empty State
If no market data is available locally, the system displays a clear message:
> "No stock data is currently available. Please synchronize market data to view the stock universe."

## API Endpoints

### Get Stock List
```
GET /api/v1/portfolio-management/stocks
```

**Query Parameters:**
- `sortBy` (optional, default: "symbol"): Sort field - either "symbol" or "marketCap"
- `sortOrder` (optional, default: "asc"): Sort direction - either "asc" or "desc"

**Response:**
```json
{
  "code": 200,
  "message": "Stock list retrieved successfully",
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "marketCap": 2800000000000
    }
  ],
  "success": true,
  "timestamp": "2025-01-29T07:56:10.181Z"
}
```

## Technical Implementation

### Backend (Spring Boot)
- **Controller**: `StockScreenerController` - REST endpoint for stock list
- **Service**: `StockScreenerService` - Business logic for retrieving and sorting stocks
- **DTO**: `StockOverviewView` - Data transfer object for API responses
- **Entities**: 
  - `StockOverview` - Main stock information
  - `StockRatio` - Financial ratios including market capitalization

### Frontend (Next.js)
- **Route**: `/stock-screener`
- **Component**: `page.tsx` - Main stock screener page with client-side rendering
- **Features**:
  - Fetches data from API on mount and when sorting changes
  - Loading state while fetching
  - Error handling with user-friendly messages
  - Empty state when no data available
  - Responsive grid layout (1/2/3 columns)
  - Dark mode support

## Data Flow

1. User navigates to `/stock-screener`
2. Frontend fetches stocks from backend API
3. Backend retrieves `StockOverview` entities from database
4. Backend joins with `StockRatio` to get market cap
5. Backend sorts data based on requested criteria
6. Backend returns formatted `StockOverviewView` list
7. Frontend displays stocks in responsive grid
8. User can click sort buttons to re-fetch with new sorting

## Notes

- Stock data is **not real-time** - it comes from locally cached snapshots
- Stocks are uniquely identified by `symbol + exchange`
- Market cap formatting: Trillion (T), Billion (B), Million (M)
- Sorting is deterministic and performed server-side
- Empty stock list shows helpful message about data synchronization
