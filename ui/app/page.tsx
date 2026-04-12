import { FilterSidebar } from "@/components/FilterSidebar"
import { DataTable } from "@/components/DataTable"
import { mockStocks } from "@/lib/mock-data"

export default function ScreenerPage() {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar - hidden on mobile, toggled via drawer (not implemented yet for mobile but responsive layout works) */}
      <div className="hidden md:block w-72 shrink-0 h-full">
        <FilterSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
        <div className="flex flex-col space-y-4 mb-6">
          <h1 className="text-2xl font-bold text-foreground">VN Market Screener</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Real-time scanner across HOSE, HNX, and UPCOM. Use the filters to drill down into High Dividend, Undervalued, or Momentum stocks.
          </p>
        </div>

        {/* Data Table Wrapper */}
        <div className="w-full">
          <DataTable data={mockStocks} />
        </div>
      </div>
    </div>
  )
}
