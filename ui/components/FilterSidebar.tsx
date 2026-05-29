"use client"

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Slider } from "@/components/ui/Slider"
import { useAuth } from "@/components/auth/AuthProvider"
import { Bell, BookmarkPlus, LockKeyhole, RotateCcw, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react"

const EXCHANGES = ["HOSE", "HNX", "UPCOM"]
const SECTORS = ["Banking", "Technology", "Energy", "Real Estate", "Retail", "Industrials", "Materials", "Financials"]
const SCREENERS = ["Dividend Champions", "Undervalued Growth", "High Momentum", "Foreign Inflow", "Low Beta"]

export function FilterSidebar() {
  const { hasPermission } = useAuth()
  const canUseAiScreens = hasPermission("useAiScreens")

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card/80 p-4 backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Screener Filters
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">Find your edge</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Blend valuation, quality, liquidity, and technical triggers.</p>
        </div>
        <button className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground" aria-label="Save filters">
          <BookmarkPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> AI Strategy Builder
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Try: “profitable banks with ROE above 15%, low P/B, and heavy liquidity.”</p>
        <Button size="sm" className="mt-3 w-full rounded-full" disabled={!canUseAiScreens}>{canUseAiScreens ? "Generate screen" : "Upgrade for AI"}</Button>
        {!canUseAiScreens ? (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><LockKeyhole className="h-3 w-3" /> Pro authorization required.</p>
        ) : null}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saved Screeners</h3>
        <div className="flex flex-wrap gap-2">
          {SCREENERS.map((screen) => (
            <Badge key={screen} variant="outline" className="cursor-pointer rounded-full border-border/80 bg-background/50 px-3 py-1 text-muted-foreground hover:border-primary/40 hover:text-primary">
              {screen}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6 overflow-y-auto pr-1">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exchange</h3>
          <div className="grid grid-cols-3 gap-2">
            {EXCHANGES.map((exchange) => (
              <label key={exchange} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background/60 px-2 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/50">
                <Checkbox defaultChecked={exchange === "HOSE"} /> {exchange}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Valuation</h3>
          <div className="space-y-5 rounded-2xl border border-border bg-background/50 p-4">
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">P/E Ratio</span><span className="font-mono text-foreground">&lt; 15x</span></div>
              <Slider defaultValue={15} max={50} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">P/B Ratio</span><span className="font-mono text-foreground">&lt; 2.5x</span></div>
              <Slider defaultValue={25} max={60} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Dividend Yield</span><span className="font-mono text-foreground">&gt; 3%</span></div>
              <Slider defaultValue={30} max={100} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quality & Momentum</h3>
          <div className="space-y-5 rounded-2xl border border-border bg-background/50 p-4">
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">ROE (%)</span><span className="font-mono text-foreground">&gt; 15%</span></div>
              <Slider defaultValue={15} max={50} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Revenue Growth</span><span className="font-mono text-foreground">&gt; 10%</span></div>
              <Slider defaultValue={10} max={60} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-card p-3 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-3.5 w-3.5 text-success" /> Breakout signal</span>
              <Checkbox defaultChecked />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sector</h3>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((sector) => (
              <Badge key={sector} variant="outline" className="cursor-pointer rounded-full px-3 py-1 hover:bg-secondary hover:text-secondary-foreground">
                {sector}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Bell className="h-4 w-4 text-primary" /> Alert me when</div>
          <p className="mt-2 text-xs text-muted-foreground">New ticker matches this screen or a selected stock crosses valuation targets.</p>
        </div>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <Button className="w-full rounded-full">Apply Filters</Button>
        <Button variant="ghost" className="mt-2 w-full rounded-full text-muted-foreground"><RotateCcw className="h-4 w-4" /> Reset All</Button>
      </div>
    </aside>
  )
}
