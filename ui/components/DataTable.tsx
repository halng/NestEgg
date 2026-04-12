"use client"
import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { StockChart } from "@/components/StockChart"
import { Checkbox } from "@/components/ui/Checkbox"
import { Button } from "@/components/ui/Button"
import { mockChartDataMap, type Stock } from "@/lib/mock-data"
import { ArrowDown, ArrowUp, Minus, SearchX, LineChart } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

interface DataTableProps {
  data: Stock[]
}

export function DataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)
  const [selectedForCompare, setSelectedForCompare] = React.useState<Set<string>>(new Set())
  
  let searchParams: URLSearchParams | null = null;
  try {
    searchParams = useSearchParams()
  } catch (e) {
    // dev ignore
  }
  const query = searchParams?.get("q")?.toLowerCase() || ""

  const filteredData = React.useMemo(() => {
    if (!query) return data;
    return data.filter(stock => 
      stock.ticker.toLowerCase().includes(query) || 
      stock.name.toLowerCase().includes(query) ||
      stock.sector.toLowerCase().includes(query)
    )
  }, [data, query])

  const toggleCompare = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation()
    const newSet = new Set(selectedForCompare)
    if (newSet.has(ticker)) newSet.delete(ticker)
    else newSet.add(ticker)
    setSelectedForCompare(newSet)
  }

  const handleCompareAction = () => {
    if (selectedForCompare.size < 1) return;
    const tickers = Array.from(selectedForCompare).join(",")
    router.push("/compare?tickers=" + tickers)
  }

  return (
    <div className="w-full relative pb-16">
      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground sticky top-0 z-10 shadow-sm border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold min-w-[40px] text-center">Sel</th>
              <th className="px-4 py-3 font-semibold min-w-[80px]">Ticker</th>
              <th className="px-4 py-3 font-semibold pb-3">Price</th>
              <th className="px-4 py-3 font-semibold">Change %</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Vol (VND)</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Mcap (B)</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">P/E</th>
              <th className="px-4 py-3 font-semibold hidden xl:table-cell">ROE %</th>
              <th className="px-4 py-3 font-semibold">Exchange</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.map((stock) => {
              const isCeiling = stock.status === "ceiling"
              const isFloor = stock.status === "floor"
              const isUp = stock.status === "up" || isCeiling
              const isDown = stock.status === "down" || isFloor
              
              let colorClass = "text-muted-foreground"
              if (isCeiling) colorClass = "text-ceiling font-semibold tracking-wide"
              else if (isFloor) colorClass = "text-floor font-semibold tracking-wide"
              else if (isUp) colorClass = "text-success font-medium"
              else if (isDown) colorClass = "text-danger font-medium"

              return (
                <React.Fragment key={stock.ticker}>
                  <tr 
                    className="hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedTicker(selectedTicker === stock.ticker ? null : stock.ticker)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => toggleCompare(e, stock.ticker)}>
                      <Checkbox checked={selectedForCompare.has(stock.ticker)} readOnly />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors flex flex-col">
                        <span className="text-[15px] tracking-tight">{stock.ticker}</span>
                        <span className="text-[10px] text-muted-foreground font-normal sm:hidden">{stock.exchange}</span>
                        <span className="text-[11px] text-muted-foreground font-normal hidden lg:inline-block max-w-[120px] truncate">{stock.name}</span>
                      </div>
                    </td>
                    <td className={"px-4 py-3 text-[15px] " + colorClass}>
                      {stock.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                       <div className={"flex items-center text-[15px] " + colorClass}>
                        {isUp ? <ArrowUp className="w-3.5 h-3.5 mr-1" /> : isDown ? <ArrowDown className="w-3.5 h-3.5 mr-1" /> : <Minus className="w-3.5 h-3.5 mr-1" />}
                        {Math.abs(stock.changePercent).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                      {stock.volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                      {stock.marketCap.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-foreground font-medium text-[13px]">
                      {stock.pe.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-foreground font-medium text-[13px]">
                      {stock.roe.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={isCeiling ? "ceiling" : isFloor ? "floor" : isUp ? "success" : isDown ? "danger" : "outline"}>
                        {stock.exchange}
                      </Badge>
                    </td>
                  </tr>
                  
                  {/* Expandable Chart Row */}
                  {selectedTicker === stock.ticker && (
                    <tr className="bg-muted/10 border-b border-border shadow-inner">
                      <td colSpan={9} className="p-0">
                        <div className="p-4 md:p-6 w-full h-[380px] animate-in fade-in slide-in-from-top-4 duration-300">
                          <StockChart data={mockChartDataMap[stock.ticker] || []} ticker={stock.ticker} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center p-16 text-muted-foreground animate-in fade-in duration-500">
            <SearchX className="h-10 w-10 mb-4 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No stocks found.</p>
            <p className="text-sm">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Floating Compare Action Bar */}
      {selectedForCompare.size > 0 && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-2xl flex items-center space-x-4 border border-border/50">
               <span className="text-sm font-semibold whitespace-nowrap">
                  {selectedForCompare.size} Selected
               </span>
               <div className="w-[1px] h-5 bg-background/20" />
               <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full bg-background/10 border-none hover:bg-background/20 text-background hover:text-white"
                onClick={handleCompareAction}
               >
                 <LineChart className="w-4 h-4 mr-2" />
                 Compare
               </Button>
            </div>
         </div>
      )}
    </div>
  )
}
