"use client"
import { DataTable } from "@/components/DataTable"
import { mockStocks } from "@/lib/mock-data"
import { Button } from "@/components/ui/Button"
import { Plus, BellRing } from "lucide-react"

export default function WatchlistPage() {
  // Take top 5 for watchlist mockup
  const watchlist = mockStocks.slice(0, 5)

  return (
    <div className="p-4 md:p-8 bg-background min-h-full pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Watchlist</h1>
            <p className="text-muted-foreground text-sm mt-1">Tracking your favorite VN Market stocks.</p>
          </div>
          
          <div className="flex items-center space-x-2">
             <Button variant="outline"><BellRing className="w-4 h-4 mr-2" /> Alerts</Button>
             <Button><Plus className="w-4 h-4 mr-2" /> Add Ticker</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Quick Stats */}
          <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Value</p>
              <h3 className="text-xl font-bold text-foreground">420,500,000 VND</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold text-sm">+2.4%</div>
          </div>
          
           <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Top Performer</p>
              <h3 className="text-xl font-bold text-foreground">SSI</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-ceiling/20 flex items-center justify-center text-ceiling font-bold text-sm">+6.8%</div>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Watchlist Tech</p>
              <h3 className="text-xl font-bold text-foreground">Bullish</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">65</div>
          </div>
        </div>

        <div className="w-full">
          <DataTable data={watchlist} />
        </div>
        
      </div>
    </div>
  )
}
