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

**Validation:**
- Invalid `sortBy` values return 400 Bad Request
- Invalid `sortOrder` values return 400 Bad Request

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
- **Controller**: `StockScreenerController` - REST endpoint for stock list with CORS enabled
- **Service**: `StockScreenerService` - Business logic for retrieving and sorting stocks
  - Optimized to avoid N+1 query problem by fetching all data in batch
  - Parameter validation with clear error messages
- **DTO**: `StockOverviewView` - Data transfer object for API responses
- **Entities**: 
  - `StockOverview` - Main stock information
  - `StockRatio` - Financial ratios including market capitalization

### Frontend (Next.js)
- **Route**: `/stock-screener`
- **Component**: `page.tsx` - Main stock screener page with client-side rendering
- **Configuration**: Uses `NEXT_PUBLIC_API_URL` environment variable
- **Features**:
  - Fetches data from API on mount and when sorting changes
  - Loading state while fetching
  - Error handling with user-friendly messages
  - Empty state when no data available
  - Responsive grid layout (1/2/3 columns)
  - Dark mode support
  - Proper React hooks usage (useCallback for dependency management)

## Configuration

### Environment Variables
Create a `.env.local` file in the `ui` directory (see `.env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:9009/api/v1/portfolio-management
```

## Data Flow

1. User navigates to `/stock-screener`
2. Frontend fetches stocks from backend API using environment-configured URL
3. Backend validates query parameters
4. Backend retrieves all `StockOverview` entities from database
5. Backend retrieves all `StockRatio` entities in a single query (optimized)
6. Backend creates a map of market caps and joins data in memory
7. Backend sorts data based on requested criteria
8. Backend returns formatted `StockOverviewView` list
9. Frontend displays stocks in responsive grid
10. User can click sort buttons to re-fetch with new sorting

## Performance Optimizations

1. **Batch Fetching**: All stock ratios fetched in one query to avoid N+1 problem
2. **Server-Side Sorting**: Sorting performed on backend for consistency
3. **Filtered Results**: Only active, non-deleted stocks returned
4. **Optimized Re-renders**: React useCallback prevents unnecessary re-fetches

## Security Features

1. **CORS Configuration**: Controlled cross-origin access
2. **Parameter Validation**: Input validation prevents invalid queries
3. **Error Handling**: Safe error messages without exposing internals

## Notes

- Stock data is **not real-time** - it comes from locally cached snapshots
- Stocks are uniquely identified by `symbol + exchange`
- Market cap formatting: Trillion (T), Billion (B), Million (M)
- Sorting is deterministic and performed server-side
- Empty stock list shows helpful message about data synchronization
