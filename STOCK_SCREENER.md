# Stock Screener Feature

## Overview

The Stock Screener feature enables users to discover publicly listed stocks that meet specific financial criteria using deterministic, explainable screening logic.

## Architecture

### Backend (Spring Boot)

**Components:**
- `StockScreenerController` - REST API endpoint at `/stocks/screen`
- `StockScreenerService` - Business logic for filtering stocks
- `ScreeningCriteria` DTO - Request parameters for filtering
- `StockScreeningResult` DTO - Response data with stock information

**Data Sources:**
- `StockOverview` - Stock basic information (symbol, name, industry, exchange, rating, etc.)
- `StockFinancialRatio` - Financial ratios (P/E, P/B, ROE, ROA, dividend, etc.)

**Key Features:**
- ✅ No live API calls during screening (offline-first)
- ✅ Reproducible results with snapshot data
- ✅ Graceful handling of missing/partial data
- ✅ Filters by multiple criteria (industry, exchange, financial ratios)
- ✅ Only includes actively traded stocks

### Frontend (Next.js)

**Components:**
- `/screener` page - Main stock screener interface
- `ScreenerFilters` - Filter input form
- `ScreenerResults` - Results table with stock data
- API client utility - HTTP communication with backend

**Features:**
- ✅ Responsive design with Tailwind CSS
- ✅ Loading states during screening
- ✅ Error handling with user-friendly messages
- ✅ Empty state when no stocks match criteria
- ✅ Real-time form validation

## Available Screening Criteria

### Basic Filters
- **Industry** - Filter by industry sector (e.g., Technology, Finance)
- **Exchange** - Filter by stock exchange (e.g., NASDAQ, NYSE)

### Rating Filters
- **Min/Max Rating** - Stock rating range (0-5 scale)

### Performance Filters
- **Min/Max Year-over-Year Change (%)** - Annual price change percentage

### Financial Ratio Filters
- **Min/Max P/E Ratio** - Price-to-Earnings ratio
- **Min/Max P/B Ratio** - Price-to-Book ratio
- **Min/Max ROE (%)** - Return on Equity percentage
- **Min/Max ROA (%)** - Return on Assets percentage
- **Min/Max Dividend** - Dividend amount

## Testing Instructions

### Prerequisites
- Java 24
- Node.js 20+
- PostgreSQL 15.4 (via Docker)
- Spring Boot 4.0.0 (requires internet access to snapshot repositories)

### Start Backend

1. Start PostgreSQL:
```bash
cd api
docker compose -f docker/docker-compose.yml up -d
```

2. Run Spring Boot application:
```bash
cd api
./gradlew bootRun
```

**Note:** The backend requires access to Spring Boot snapshot repositories. If you encounter network issues, the application may fail to start.

### Start Frontend

1. Install dependencies:
```bash
cd ui
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Access the application:
- Home: http://localhost:3000
- Stock Screener: http://localhost:3000/screener

### Testing Scenarios

1. **Empty Criteria** - Click "Apply Filters" with no criteria to see all actively traded stocks

2. **Industry Filter** - Enter "Technology" in Industry field and apply

3. **Financial Ratio Filter** - Set Min ROE to 20, Max P/E to 30, and apply

4. **Combined Filters** - Use multiple criteria together

5. **Error Handling** - Stop the backend and try to apply filters to see graceful error handling

6. **Reset Functionality** - Fill in filters and click "Reset" to clear all fields

## API Endpoint

### POST /stocks/screen

**Request Body:**
```json
{
  "industry": "Technology",
  "exchange": "NASDAQ",
  "minRating": 4.0,
  "maxRating": 5.0,
  "minDeltaInYear": 10.0,
  "maxDeltaInYear": 50.0,
  "minPriceToEarning": 10.0,
  "maxPriceToEarning": 30.0,
  "minPriceToBook": 2.0,
  "maxPriceToBook": 5.0,
  "minRoe": 15.0,
  "maxRoe": 100.0,
  "minRoa": 10.0,
  "maxRoa": 50.0,
  "minDividend": 1.0,
  "maxDividend": 10.0
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Stock screening completed successfully",
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "industry": "Technology",
      "exchange": "NASDAQ",
      "rating": 4.5,
      "deltaInYear": 25.5,
      "priceToEarning": 28.5,
      "priceToBook": 35.2,
      "roe": 147.4,
      "roa": 22.1,
      "dividend": 0.96
    }
  ],
  "isSuccess": true,
  "timestamp": "2026-01-29T08:00:00Z"
}
```

## Non-Functional Requirements Met

✅ **Data Integrity** - Results are reproducible with the same data snapshot
✅ **Performance** - In-memory filtering scales to thousands of stocks
✅ **Reliability** - Missing data handled gracefully without crashes
✅ **Offline-First** - No live API calls during screening
✅ **Graceful Degradation** - All failures degrade gracefully with error messages

## Out of Scope

The following features are intentionally excluded from the initial implementation:
- Real-time price updates
- Technical indicators (moving averages, RSI, etc.)
- Charting capabilities
- News or sentiment analysis
- AI-driven recommendations

## Screenshots

### Homepage
![Homepage](https://github.com/user-attachments/assets/e5a7565d-1099-4006-b514-f6dfd1088920)

### Stock Screener Interface
![Stock Screener](https://github.com/user-attachments/assets/2d2de8e1-c85e-4530-8483-0927bd56c945)

### Error Handling
![Error State](https://github.com/user-attachments/assets/9dc2864d-7adb-449b-89b8-873a1a1096f9)

## Future Enhancements

- Export screening results to CSV
- Save custom screening criteria
- Historical screening comparisons
- Advanced filtering with custom formulas
- Integration with portfolio management
