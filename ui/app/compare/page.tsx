"use client"
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { mockStocks } from "@/lib/mock-data"
import { CompareChart } from "@/components/CompareChart"
import { Badge } from "@/components/ui/Badge"
import { ArrowLeft, ArrowUp, ArrowDown, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

function CompareContent() {
  const searchParams = useSearchParams()
  const tickersParam = searchParams?.get("tickers") || ""
  const tickers = tickersParam.split(",").filter(Boolean)

  const selectedStocks = React.useMemo(() => {
    return tickers.map(t => mockStocks.find(s => s.ticker === t)).filter(Boolean) as typeof mockStocks
  }, [tickers])

  if (tickers.length === 0 || selectedStocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-16 text-muted-foreground animate-in fade-in duration-500">
        <p className="text-lg font-medium text-foreground mb-4">No stocks selected to compare</p>
        <Link href="/">
           <Button><ArrowLeft className="w-4 h-4 mr-2" /> Back to Screener</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
           <Link href="/">
             <Button variant="outline" size="sm" className="rounded-full shadow-sm w-9 h-9 p-0 group">
                <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
             </Button>
           </Link>
           <div>
             <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 tracking-tight">
               Compare <Badge variant="secondary" className="px-3 py-1 font-mono">{tickers.length}</Badge> Stocks
             </h1>
             <p className="text-muted-foreground text-sm mt-1">Side-by-side analysis of your selected VN Market tickers.</p>
           </div>
        </div>

        {/* Visual Chart Comparison */}
        <div className="w-full h-[500px]">
           <CompareChart tickers={tickers} />
        </div>

        {/* Metric Matrix */}
        <div className="mt-8 rounded-xl border border-border bg-card shadow-sm overflow-x-auto">
           <table className="w-full text-sm text-left whitespace-nowrap">
             <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                   <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-48">Metric</th>
                   {selectedStocks.map(stock => (
                     <th key={stock.ticker} className="px-6 py-4 font-bold text-foreground text-base w-48 text-center border-l border-border/50">
                        {stock.ticker}
                        <div className="text-[10px] text-muted-foreground font-normal tracking-normal mt-0.5">{stock.exchange}</div>
                     </th>
                   ))}
                </tr>
             </thead>
             <tbody className="divide-y divide-border/50">
                
                {/* Price Row */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">Price (VND)</td>
                   {selectedStocks.map(stock => {
                      const isUp = stock.status === "up" || stock.status === "ceiling"
                      const isDown = stock.status === "down" || stock.status === "floor"
                      const colorClass = stock.status === "ceiling" ? "text-ceiling" : stock.status === "floor" ? "text-floor" : isUp ? "text-success" : isDown ? "text-danger" : "text-muted-foreground"
                      
                      return (
                         <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50">
                            <div className={"font-bold text-base " + colorClass}>{stock.price.toLocaleString()}</div>
                            <div className={"flex items-center justify-center text-[11px] mt-1 " + colorClass}>
                              {isUp ? <ArrowUp className="w-3 h-3 mr-0.5" /> : isDown ? <ArrowDown className="w-3 h-3 mr-0.5" /> : <Minus className="w-3 h-3 mr-0.5" />}
                              {Math.abs(stock.changePercent).toFixed(1)}%
                            </div>
                         </td>
                      )
                   })}
                </tr>

                {/* Market Cap */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">Market Cap (Billion)</td>
                   {selectedStocks.map(stock => (
                     <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50 font-mono">
                        {stock.marketCap.toLocaleString()}
                     </td>
                   ))}
                </tr>

                {/* P/E */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">P/E Ratio</td>
                   {selectedStocks.map(stock => (
                     <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50">
                        {stock.pe.toFixed(1)}
                     </td>
                   ))}
                </tr>

                {/* P/B */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">P/B Ratio</td>
                   {selectedStocks.map(stock => (
                     <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50">
                        {stock.pb.toFixed(1)}
                     </td>
                   ))}
                </tr>

                {/* ROE */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">ROE (%)</td>
                   {selectedStocks.map(stock => (
                     <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50">
                        <span className={stock.roe > 15 ? "text-success font-semibold" : "text-foreground"}>{stock.roe.toFixed(1)}%</span>
                     </td>
                   ))}
                </tr>

                {/* Sector */}
                <tr className="hover:bg-muted/20 transition-colors">
                   <td className="px-6 py-4 font-medium text-muted-foreground">Sector</td>
                   {selectedStocks.map(stock => (
                     <td key={stock.ticker} className="px-6 py-4 text-center border-l border-border/50 text-sm">
                        <Badge variant="outline">{stock.sector}</Badge>
                     </td>
                   ))}
                </tr>

             </tbody>
           </table>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <React.Suspense fallback={
       <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground text-sm font-medium animate-pulse">Assembling Analysis...</p>
       </div>
    }>
      <CompareContent />
    </React.Suspense>
  )
}
