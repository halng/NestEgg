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
  sector: string
  exchange: "HOSE" | "HNX" | "UPCOM"
  status: "up" | "down" | "ceiling" | "floor" | "unchanged"
}

// Generate some sample chart data
const generateChartData = (basePrice: number) => {
  return Array.from({ length: 30 }).map((_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return {
      date: "2026-03-" + day,
      price: basePrice + (Math.random() * basePrice * 0.1 - basePrice * 0.05),
      volume: Math.floor(Math.random() * 5000000) + 1000000
    };
  })
}

export const mockStocks: Stock[] = [
  { ticker: "FPT", name: "FPT Corporation", price: 112500, changePercent: 2.1, volume: 5400200, marketCap: 142000, pe: 18.5, pb: 4.2, roe: 28.4, sector: "Technology", exchange: "HOSE", status: "up" },
  { ticker: "VCB", name: "Vietcombank", price: 92000, changePercent: 0.5, volume: 2100400, marketCap: 520000, pe: 15.2, pb: 3.1, roe: 21.0, sector: "Banking", exchange: "HOSE", status: "up" },
  { ticker: "HPG", name: "Hoa Phat Group", price: 31200, changePercent: -1.2, volume: 15400200, marketCap: 180000, pe: 12.4, pb: 1.8, roe: 15.2, sector: "Basic Materials", exchange: "HOSE", status: "down" },
  { ticker: "SSI", name: "SSI Securities", price: 36500, changePercent: 6.8, volume: 12500200, marketCap: 55000, pe: 14.1, pb: 2.2, roe: 16.5, sector: "Financial Services", exchange: "HOSE", status: "ceiling" },
  { ticker: "MWG", name: "Mobile World Inv.", price: 48900, changePercent: -6.9, volume: 6400200, marketCap: 71000, pe: 22.5, pb: 2.8, roe: 12.1, sector: "Retail", exchange: "HOSE", status: "floor" },
  { ticker: "PVS", name: "PetroVietnam Tech", price: 38200, changePercent: 1.5, volume: 3400200, marketCap: 18200, pe: 10.5, pb: 1.1, roe: 11.2, sector: "Energy", exchange: "HNX", status: "up" },
  { ticker: "BSR", name: "Binh Son Refining", price: 19500, changePercent: 0.0, volume: 8400200, marketCap: 60400, pe: 8.2, pb: 1.4, roe: 17.8, sector: "Energy", exchange: "UPCOM", status: "unchanged" },
  { ticker: "VHM", name: "Vinhomes", price: 42100, changePercent: -0.5, volume: 4500200, marketCap: 183000, pe: 7.5, pb: 1.0, roe: 14.2, sector: "Real Estate", exchange: "HOSE", status: "down" },
  { ticker: "VIC", name: "Vingroup", price: 44500, changePercent: 1.2, volume: 3200200, marketCap: 170000, pe: 45.2, pb: 1.5, roe: 3.2, sector: "Real Estate", exchange: "HOSE", status: "up" },
  { ticker: "BID", name: "BIDV", price: 48200, changePercent: 0.8, volume: 2300200, marketCap: 275000, pe: 14.8, pb: 2.4, roe: 17.5, sector: "Banking", exchange: "HOSE", status: "up" },
  { ticker: "TCB", name: "Techcombank", price: 41500, changePercent: 2.5, volume: 8500200, marketCap: 146000, pe: 7.8, pb: 1.3, roe: 18.4, sector: "Banking", exchange: "HOSE", status: "up" },
  { ticker: "IDC", name: "IDICO Corp", price: 54200, changePercent: 3.1, volume: 1800200, marketCap: 17800, pe: 11.5, pb: 2.5, roe: 24.1, sector: "Real Estate", exchange: "HNX", status: "up" },
  { ticker: "GEX", name: "GELEX Group", price: 22800, changePercent: -2.1, volume: 9500200, marketCap: 19400, pe: 16.5, pb: 1.2, roe: 8.4, sector: "Industrials", exchange: "HOSE", status: "down" },
  { ticker: "VND", name: "VNDIRECT", price: 21500, changePercent: 1.8, volume: 11200200, marketCap: 26200, pe: 13.5, pb: 1.8, roe: 14.1, sector: "Financial Services", exchange: "HOSE", status: "up" },
  { ticker: "DGC", name: "Duc Giang Chem", price: 112000, changePercent: 4.5, volume: 1400200, marketCap: 42500, pe: 9.8, pb: 3.5, roe: 38.5, sector: "Basic Materials", exchange: "HOSE", status: "up" },
]

export const mockChartDataMap: Record<string, ReturnType<typeof generateChartData>> = {}
mockStocks.forEach(s => {
  mockChartDataMap[s.ticker] = generateChartData(s.price)
})
