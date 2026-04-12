"use client"
import * as React from "react"
import { Checkbox } from "@/components/ui/Checkbox"
import { Slider } from "@/components/ui/Slider"
import { Badge } from "@/components/ui/Badge"
import { Filter } from "lucide-react"

const EXCHANGES = ["HOSE", "HNX", "UPCOM"]
const SECTORS = ["Banking", "Real Estate", "Technology", "Basic Materials", "Financial Services", "Energy", "Retail", "Industrials"]

export function FilterSidebar() {
  return (
    <aside className="w-full h-full bg-card border-r border-border flex flex-col hide-scrollbar overflow-y-auto p-4 md:p-5">
      <div className="flex items-center space-x-2 font-bold mb-6 text-foreground">
        <Filter className="w-4 h-4 text-primary" />
        <h2>Screener Filters</h2>
      </div>

      {/* Exchanges */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">Exchange</h3>
        <div className="space-y-2.5">
          {EXCHANGES.map(ex => (
            <label key={ex} className="flex items-center space-x-3 cursor-pointer group">
              <Checkbox defaultChecked />
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{ex}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Basic Metrics (Sliders / Inputs) */}
      <div className="mb-6">
         <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">Valuation</h3>
         
         <div className="mb-4">
           <div className="flex justify-between text-xs mb-1.5">
             <span className="text-muted-foreground">P/E Ratio</span>
             <span className="text-foreground font-mono">0 - 50</span>
           </div>
           <Slider defaultValue={25} max={100} />
         </div>

         <div className="mb-4">
           <div className="flex justify-between text-xs mb-1.5">
             <span className="text-muted-foreground">P/B Ratio</span>
             <span className="text-foreground font-mono">0 - 10</span>
           </div>
           <Slider defaultValue={5} max={20} />
         </div>
      </div>

      {/* Growth/Return */}
      <div className="mb-6">
         <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">Profitability</h3>
         
         <div className="mb-4">
           <div className="flex justify-between text-xs mb-1.5">
             <span className="text-muted-foreground">ROE (%)</span>
             <span className="text-foreground font-mono">&gt; 15%</span>
           </div>
           <Slider defaultValue={15} max={50} />
         </div>
      </div>

      {/* Sectors */}
      <div className="mb-6">
        <h3 className="text-xs uppercase font-semibold text-muted-foreground mb-3 tracking-wider">Sector</h3>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map(sec => (
             <Badge key={sec} variant="outline" className="cursor-pointer hover:bg-secondary hover:text-secondary-foreground transition-colors">
               {sec}
             </Badge>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
         <button className="w-full bg-primary text-primary-foreground font-medium rounded-md py-2 text-sm hover:bg-primary/90 transition-colors shadow-sm">
           Apply Filters
         </button>
         <button className="w-full text-muted-foreground font-medium rounded-md py-2 text-sm hover:text-foreground transition-colors mt-2">
           Reset All
         </button>
      </div>

    </aside>
  )
}
