"use client"
import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { StockChart } from "@/components/StockChart"
import { mockChartDataMap, type Stock } from "@/lib/mock-data"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

interface DataTableProps {
  data: Stock[]
}

export function DataTable({ data }: DataTableProps) {
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(null)

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-secondary text-secondary-foreground sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold min-w-[80px]">Ticker</th>
              <th className="px-4 py-3 font-semibold pb-3">Price</th>
              <th className="px-4 py-3 font-semibold">Change %</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Vol (VND)</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Mcap (B)</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">P/E</th>
              <th className="px-4 py-3 font-semibold hidden xl:table-cell">ROE %</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((stock) => {
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
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-foreground group-hover:text-primary transition-colors flex flex-col">
                        <span>{stock.ticker}</span>
                        <span className="text-[10px] text-muted-foreground font-normal sm:hidden">{stock.exchange}</span>
                      </div>
                    </td>
                    <td className={"px-4 py-2.5 " + colorClass}>
                      {stock.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5">
                       <div className={"flex items-center " + colorClass}>
                        {isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : isDown ? <ArrowDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                        {Math.abs(stock.changePercent).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground font-mono text-xs">
                      {stock.volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-muted-foreground font-mono text-xs">
                      {stock.marketCap.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 hidden sm:table-cell text-muted-foreground">
                      {stock.pe.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5 hidden xl:table-cell text-muted-foreground">
                      {stock.roe.toFixed(1)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={isCeiling ? "ceiling" : isFloor ? "floor" : isUp ? "success" : isDown ? "danger" : "outline"}>
                        {stock.exchange}
                      </Badge>
                    </td>
                  </tr>
                  
                  {/* Expandable Chart Row */}
                  {selectedTicker === stock.ticker && (
                    <tr className="bg-muted/20 border-b border-border shadow-inner">
                      <td colSpan={8} className="p-0">
                        <div className="p-4 md:p-6 w-full h-[350px] animate-in fade-in slide-in-from-top-4 duration-300">
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
        
        {data.length === 0 && (
          <div className="w-full text-center p-8 text-muted-foreground">
            No stocks match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
