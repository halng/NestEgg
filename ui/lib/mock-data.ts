export interface ChartDataPoint {
  date: string
  price: number
  volume: number
}

export interface Stock {
  ticker: string
  name: string
  price: number
  changePercent: number
  volume: number
  marketCap: number // in billions VND
  pe: number
  pb: number
  roe: number
  dividendYield: number
  revenueGrowth: number
  netMargin: number
  beta: number
  analystRating: "Strong Buy" | "Buy" | "Hold" | "Reduce"
  signal: "Breakout" | "Value" | "Income" | "Quality" | "Watch"
  sector: string
  exchange: "HOSE" | "HNX" | "UPCOM"
  status: "up" | "down" | "ceiling" | "floor" | "unchanged"
  score: number
  historicalData: ChartDataPoint[]
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// Deterministic sample chart data keeps the UI and tests stable across renders.
const generateChartData = (basePrice: number, seed: number): ChartDataPoint[] => {
  return Array.from({ length: 30 }).map((_, i) => {
    const wave = Math.sin((i + seed) / 3) * 0.035
    const trend = (i - 14) * 0.0025
    const pulse = Math.cos((i + seed) / 2) * 0.012
    return {
      date: "2026-03-" + (i + 1).toString().padStart(2, "0"),
      price: Math.round(basePrice * clamp(1 + wave + trend + pulse, 0.88, 1.18)),
      volume: Math.floor(1_000_000 + Math.abs(Math.sin(i + seed)) * 8_500_000 + seed * 125_000),
    }
  })
}

const baseStocks = [
  { ticker: "FPT", name: "FPT Corporation", price: 112500, changePercent: 2.1, volume: 5400200, marketCap: 142000, pe: 18.5, pb: 4.2, roe: 28.4, dividendYield: 1.8, revenueGrowth: 23.4, netMargin: 16.8, beta: 0.92, analystRating: "Strong Buy", signal: "Quality", sector: "Technology", exchange: "HOSE", status: "up", score: 94 },
  { ticker: "VCB", name: "Vietcombank", price: 92000, changePercent: 0.5, volume: 2100400, marketCap: 520000, pe: 15.2, pb: 3.1, roe: 21.0, dividendYield: 0.0, revenueGrowth: 12.1, netMargin: 35.2, beta: 0.78, analystRating: "Buy", signal: "Quality", sector: "Banking", exchange: "HOSE", status: "up", score: 89 },
  { ticker: "HPG", name: "Hoa Phat Group", price: 31200, changePercent: -1.2, volume: 15400200, marketCap: 180000, pe: 12.4, pb: 1.8, roe: 15.2, dividendYield: 2.3, revenueGrowth: 8.7, netMargin: 9.6, beta: 1.24, analystRating: "Buy", signal: "Value", sector: "Basic Materials", exchange: "HOSE", status: "down", score: 77 },
  { ticker: "SSI", name: "SSI Securities", price: 36500, changePercent: 6.8, volume: 12500200, marketCap: 55000, pe: 14.1, pb: 2.2, roe: 16.5, dividendYield: 1.4, revenueGrowth: 29.2, netMargin: 22.4, beta: 1.42, analystRating: "Buy", signal: "Breakout", sector: "Financial Services", exchange: "HOSE", status: "ceiling", score: 86 },
  { ticker: "MWG", name: "Mobile World Inv.", price: 48900, changePercent: -6.9, volume: 6400200, marketCap: 71000, pe: 22.5, pb: 2.8, roe: 12.1, dividendYield: 1.0, revenueGrowth: 5.8, netMargin: 3.7, beta: 1.17, analystRating: "Hold", signal: "Watch", sector: "Retail", exchange: "HOSE", status: "floor", score: 58 },
  { ticker: "PVS", name: "PetroVietnam Tech", price: 38200, changePercent: 1.5, volume: 3400200, marketCap: 18200, pe: 10.5, pb: 1.1, roe: 11.2, dividendYield: 3.2, revenueGrowth: 13.5, netMargin: 7.8, beta: 1.08, analystRating: "Buy", signal: "Income", sector: "Energy", exchange: "HNX", status: "up", score: 74 },
  { ticker: "BSR", name: "Binh Son Refining", price: 19500, changePercent: 0.0, volume: 8400200, marketCap: 60400, pe: 8.2, pb: 1.4, roe: 17.8, dividendYield: 4.1, revenueGrowth: 4.4, netMargin: 6.2, beta: 1.31, analystRating: "Hold", signal: "Income", sector: "Energy", exchange: "UPCOM", status: "unchanged", score: 72 },
  { ticker: "VHM", name: "Vinhomes", price: 42100, changePercent: -0.5, volume: 4500200, marketCap: 183000, pe: 7.5, pb: 1.0, roe: 14.2, dividendYield: 0.0, revenueGrowth: -2.8, netMargin: 24.9, beta: 1.09, analystRating: "Buy", signal: "Value", sector: "Real Estate", exchange: "HOSE", status: "down", score: 70 },
  { ticker: "VIC", name: "Vingroup", price: 44500, changePercent: 1.2, volume: 3200200, marketCap: 170000, pe: 45.2, pb: 1.5, roe: 3.2, dividendYield: 0.0, revenueGrowth: 18.7, netMargin: 2.1, beta: 1.33, analystRating: "Hold", signal: "Watch", sector: "Real Estate", exchange: "HOSE", status: "up", score: 55 },
  { ticker: "BID", name: "BIDV", price: 48200, changePercent: 0.8, volume: 2300200, marketCap: 275000, pe: 14.8, pb: 2.4, roe: 17.5, dividendYield: 0.0, revenueGrowth: 14.2, netMargin: 28.1, beta: 0.83, analystRating: "Buy", signal: "Quality", sector: "Banking", exchange: "HOSE", status: "up", score: 82 },
  { ticker: "TCB", name: "Techcombank", price: 41500, changePercent: 2.5, volume: 8500200, marketCap: 146000, pe: 7.8, pb: 1.3, roe: 18.4, dividendYield: 0.0, revenueGrowth: 10.5, netMargin: 31.4, beta: 0.91, analystRating: "Strong Buy", signal: "Value", sector: "Banking", exchange: "HOSE", status: "up", score: 88 },
  { ticker: "IDC", name: "IDICO Corp", price: 54200, changePercent: 3.1, volume: 1800200, marketCap: 17800, pe: 11.5, pb: 2.5, roe: 24.1, dividendYield: 5.4, revenueGrowth: 17.6, netMargin: 20.5, beta: 1.11, analystRating: "Buy", signal: "Income", sector: "Real Estate", exchange: "HNX", status: "up", score: 84 },
  { ticker: "GEX", name: "GELEX Group", price: 22800, changePercent: -2.1, volume: 9500200, marketCap: 19400, pe: 16.5, pb: 1.2, roe: 8.4, dividendYield: 2.0, revenueGrowth: 7.1, netMargin: 5.8, beta: 1.36, analystRating: "Hold", signal: "Watch", sector: "Industrials", exchange: "HOSE", status: "down", score: 61 },
  { ticker: "VND", name: "VNDIRECT", price: 21500, changePercent: 1.8, volume: 11200200, marketCap: 26200, pe: 13.5, pb: 1.8, roe: 14.1, dividendYield: 1.2, revenueGrowth: 21.8, netMargin: 19.4, beta: 1.39, analystRating: "Buy", signal: "Breakout", sector: "Financial Services", exchange: "HOSE", status: "up", score: 79 },
  { ticker: "DGC", name: "Duc Giang Chem", price: 112000, changePercent: 4.5, volume: 1400200, marketCap: 42500, pe: 9.8, pb: 3.5, roe: 38.5, dividendYield: 3.8, revenueGrowth: 16.4, netMargin: 25.7, beta: 1.18, analystRating: "Strong Buy", signal: "Quality", sector: "Basic Materials", exchange: "HOSE", status: "up", score: 91 },
] as const

export const mockStocks: Stock[] = baseStocks.map((stock, index) => ({
  ...stock,
  analystRating: stock.analystRating as Stock["analystRating"],
  signal: stock.signal as Stock["signal"],
  exchange: stock.exchange as Stock["exchange"],
  status: stock.status as Stock["status"],
  historicalData: generateChartData(stock.price, index + 1),
}))

export const mockChartDataMap: Record<string, ChartDataPoint[]> = {}
mockStocks.forEach((stock) => {
  mockChartDataMap[stock.ticker] = stock.historicalData
})

export const marketBreadth = {
  advancing: 282,
  declining: 174,
  unchanged: 91,
  ceiling: 28,
  floor: 12,
  totalLiquidity: 18650,
  foreignNetFlow: 742,
  vnIndex: 1328.42,
  vnIndexChange: 0.84,
}
