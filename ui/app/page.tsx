import { FilterSidebar } from "@/components/FilterSidebar"
import { DataTable } from "@/components/DataTable"
import { marketBreadth, mockStocks } from "@/lib/mock-data"
import { Activity, ArrowUpRight, BadgeDollarSign, BrainCircuit, CandlestickChart, Globe2, Sparkles, TrendingUp } from "lucide-react"
import { Suspense } from "react"

const leaders = [...mockStocks].sort((a, b) => b.score - a.score).slice(0, 4)
const sectors = Array.from(new Set(mockStocks.map((stock) => stock.sector))).slice(0, 6)

export default function ScreenerPage() {
  const totalMarketCap = mockStocks.reduce((sum, stock) => sum + stock.marketCap, 0)

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="hidden h-full w-80 shrink-0 lg:block">
        <FilterSidebar />
      </div>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_32rem),var(--background)] p-4 pb-24 md:p-6 md:pb-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-border bg-card/70 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-7">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Feature-rich stock intelligence
                </div>
                <div>
                  <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground md:text-6xl">
                    Screen, compare, and monitor Vietnam’s market in one command center.
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                    Combine factor filters, visual market breadth, AI-assisted screen ideas, comparison workflows, and alert-ready watchlists for HOSE, HNX, and UPCOM equities.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <HeroMetric icon={CandlestickChart} label="VN-Index" value={marketBreadth.vnIndex.toLocaleString()} delta={`+${marketBreadth.vnIndexChange}%`} positive />
                  <HeroMetric icon={BadgeDollarSign} label="Liquidity" value={`${marketBreadth.totalLiquidity.toLocaleString()}B`} delta="VND" />
                  <HeroMetric icon={Globe2} label="Foreign Flow" value={`+${marketBreadth.foreignNetFlow}B`} delta="Net buy" positive />
                  <HeroMetric icon={Activity} label="Coverage" value={mockStocks.length.toString()} delta={`${(totalMarketCap / 1000).toFixed(0)}T mcap`} />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border bg-background/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Market Pulse</p>
                    <h2 className="text-xl font-bold text-foreground">Breadth snapshot</h2>
                  </div>
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-3">
                  <BreadthRow label="Advancing" value={marketBreadth.advancing} total={marketBreadth.advancing + marketBreadth.declining + marketBreadth.unchanged} color="bg-success" />
                  <BreadthRow label="Declining" value={marketBreadth.declining} total={marketBreadth.advancing + marketBreadth.declining + marketBreadth.unchanged} color="bg-danger" />
                  <BreadthRow label="Unchanged" value={marketBreadth.unchanged} total={marketBreadth.advancing + marketBreadth.declining + marketBreadth.unchanged} color="bg-muted-foreground" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-ceiling/25 bg-ceiling/10 p-4"><p className="text-xs text-muted-foreground">Ceiling movers</p><p className="mt-1 text-2xl font-black text-ceiling">{marketBreadth.ceiling}</p></div>
                  <div className="rounded-2xl border border-floor/25 bg-floor/10 p-4"><p className="text-xs text-muted-foreground">Floor movers</p><p className="mt-1 text-2xl font-black text-floor">{marketBreadth.floor}</p></div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="rounded-3xl border border-border bg-card/70 p-4 shadow-xl shadow-black/10 backdrop-blur">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Smart presets</p>
                  <h2 className="text-xl font-bold text-foreground">Start from an investing playbook</h2>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {sectors.map((sector) => <span key={sector} className="rounded-full border border-border px-3 py-1">{sector}</span>)}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <PresetCard title="Quality compounders" description="High ROE, resilient margin, and analyst conviction." icon={TrendingUp} />
                <PresetCard title="Value with catalysts" description="Low valuation with positive earnings momentum." icon={BadgeDollarSign} />
                <PresetCard title="Momentum breakouts" description="Volume-led movers near technical confirmation." icon={ArrowUpRight} />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/70 p-4 shadow-xl shadow-black/10 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Top ranked</p>
              <div className="mt-3 space-y-3">
                {leaders.map((stock) => (
                  <div key={stock.ticker} className="flex items-center justify-between rounded-2xl bg-background/70 p-3 ring-1 ring-border">
                    <div><p className="font-bold text-foreground">{stock.ticker}</p><p className="text-xs text-muted-foreground">{stock.signal} · {stock.sector}</p></div>
                    <div className="text-right"><p className="font-mono text-sm text-primary">{stock.score}</p><p className="text-xs text-success">+{Math.max(stock.changePercent, 0).toFixed(1)}%</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-muted" />}>
            <DataTable data={mockStocks} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function HeroMetric({ icon: Icon, label, value, delta, positive }: { icon: typeof Activity; label: string; value: string; delta: string; positive?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between text-muted-foreground"><span className="text-xs uppercase tracking-wider">{label}</span><Icon className="h-4 w-4" /></div>
      <div className="flex items-end justify-between gap-2"><p className="text-2xl font-black text-foreground">{value}</p><span className={positive ? "text-xs font-semibold text-success" : "text-xs text-muted-foreground"}>{delta}</span></div>
    </div>
  )
}

function BreadthRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono text-foreground">{value}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${color}`} style={{ width: `${(value / total) * 100}%` }} /></div>
    </div>
  )
}

function PresetCard({ title, description, icon: Icon }: { title: string; description: string; icon: typeof Activity }) {
  return (
    <button className="group rounded-2xl border border-border bg-background/60 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="mt-4 font-bold text-foreground group-hover:text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </button>
  )
}
