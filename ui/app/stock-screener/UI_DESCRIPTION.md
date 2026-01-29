# Stock Screener UI Mockup

Since the services cannot be run in this environment, here's a description of what the UI looks like:

## Home Page
- Clean landing page with "Welcome to NestEgg" heading
- Description: "Your privacy-first, offline-capable personal finance and asset management platform"
- Primary action button: "View Stock Universe" (links to /stock-screener)

## Stock Screener Page

### Header Section
- Title: "Stock Screener" (3xl, bold)
- Subtitle: "Explore X stocks from the market universe" (showing count)

### Sorting Controls Section
- White card with border
- Label: "Sort by:"
- Two buttons side by side:
  - "Symbol ↑/↓" - Shows arrow indicator when active
  - "Market Cap ↑/↓" - Shows arrow indicator when active
- Active button has dark background, inactive has light gray
- Clicking toggles between ascending/descending

### Stock List Section
- Responsive grid layout:
  - 1 column on mobile
  - 2 columns on tablet
  - 3 columns on desktop
- Each stock card displays:
  - Large bold ticker symbol (e.g., "AAPL")
  - Company name below (e.g., "Apple Inc.")
  - Bottom section with two columns:
    - Left: Exchange label + value (e.g., "NASDAQ")
    - Right: Market Cap label + formatted value (e.g., "$2.80T")
- Cards have subtle border, hover effect with shadow
- Dark mode support throughout

### States

#### Loading State
- Shows "Loading stocks..." centered text
- Maintains header

#### Empty State
- Icon (document icon)
- Heading: "No Market Data Available"
- Message: "No stock data is currently available. Please synchronize market data to view the stock universe."
- Centered in white card with border

#### Error State
- Red-tinted alert box
- Displays error message
- Maintains header

## Design System
- **Colors**: Zinc scale for neutrals, supports dark mode
- **Typography**: Geist font family
- **Spacing**: Consistent 4/6/8 spacing scale
- **Borders**: Subtle borders (zinc-200/zinc-800)
- **Shadows**: Light shadows on hover
- **Responsive**: Mobile-first approach

## API Integration
- Fetches from: `http://localhost:9009/api/v1/portfolio-management/stocks`
- Query params: `sortBy` and `sortOrder`
- Re-fetches when sort changes
- Handles loading, error, and empty states
