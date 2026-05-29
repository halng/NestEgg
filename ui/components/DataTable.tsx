"use client"

import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { StockChart } from "@/components/StockChart"
import { Checkbox } from "@/components/ui/Checkbox"
import { Button } from "@/components/ui/Button"
import { mockChartDataMap, type Stock } from "@/lib/mock-data"
import { fetchTradingSuggestion, type TradingSuggestion } from "@/lib/agent-api"
import { buildMockTradingSuggestion } from "@/lib/mock-agent-data"
import { ArrowDown, ArrowUp, BarChart3, BrainCircuit, ChevronDown, LineChart, Loader2, Minus, SearchX, ShieldCheck, Sparkles, Star } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

interface DataTableProps {
  data: Stock[]
}

type SortKey = "score" | "changePercent" | "volume" | "marketCap" | "pe" | "roe"

const formatCurrency = (value: number) => value.toLocaleString("vi-VN")
const formatCompact = (value: number) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)

export function DataTable({ data }: DataTableProps) {
  const router = useRouter()
  const [selectedTicker, setSelectedTicker] = React.useState<string | null>(data[0]?.ticker ?? null)
  const [selectedForCompare, setSelectedForCompare] = React.useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = React.useState<SortKey>("score")

  const searchParams = useSearchParams()
  const query = searchParams?.get("q")?.toLowerCase() || ""

  const filteredData = React.useMemo(() => {
    const matchesQuery = !query
      ? data
      : data.filter((stock) =>
          stock.ticker.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query) ||
          stock.sector.toLowerCase().includes(query) ||
          stock.signal.toLowerCase().includes(query)
        )

    return [...matchesQuery].sort((a, b) => b[sortKey] - a[sortKey])
  }, [data, query, sortKey])

  const activeStock = filteredData.find((stock) => stock.ticker === selectedTicker) ?? filteredData[0]

  const toggleCompare = (e: React.MouseEvent, ticker: string) => {
    e.stopPropagation()
    const newSet = new Set(selectedForCompare)
    if (newSet.has(ticker)) newSet.delete(ticker)
    else newSet.add(ticker)
    setSelectedForCompare(newSet)
  }

  const handleCompareAction = () => {
    if (selectedForCompare.size < 1) return
    const tickers = Array.from(selectedForCompare).join(",")
    router.push("/compare?tickers=" + tickers)
  }

  const statusColor = (stock: Stock) => {
    if (stock.status === "ceiling") return "text-ceiling font-semibold tracking-wide"
    if (stock.status === "floor") return "text-floor font-semibold tracking-wide"
    if (stock.status === "up") return "text-success font-medium"
    if (stock.status === "down") return "text-danger font-medium"
    return "text-muted-foreground"
  }

  return (
    <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_360px]" data-testid="stock-data-table">
      <div className="relative min-w-0 pb-16">
        <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-3 shadow-2xl shadow-black/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Live universe</p>
            <h2 className="text-lg font-bold text-foreground">{filteredData.length} matching equities</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["score", "Best Score"],
              ["changePercent", "Momentum"],
              ["volume", "Liquidity"],
              ["roe", "ROE"],
              ["pe", "P/E"],
            ] as [SortKey, string][]).map(([key, label]) => (
              <Button key={key} size="sm" variant={sortKey === key ? "default" : "outline"} className="rounded-full" onClick={() => setSortKey(key)}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-secondary/70 text-xs uppercase text-muted-foreground shadow-sm backdrop-blur">
              <tr>
                <th className="min-w-[40px] px-4 py-3 text-center font-semibold">Sel</th>
                <th className="min-w-[210px] px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Change %</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Signal</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Liquidity</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Mcap (B)</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">P/E</th>
                <th className="hidden px-4 py-3 font-semibold xl:table-cell">ROE %</th>
                <th className="px-4 py-3 font-semibold">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((stock) => {
                const isUp = stock.status === "up" || stock.status === "ceiling"
                const isDown = stock.status === "down" || stock.status === "floor"
                const colorClass = statusColor(stock)

                return (
                  <React.Fragment key={stock.ticker}>
                    <tr
                      className="group cursor-pointer transition-colors hover:bg-muted/50 data-[active=true]:bg-primary/5"
                      data-active={activeStock?.ticker === stock.ticker}
                      onClick={() => setSelectedTicker(activeStock?.ticker === stock.ticker ? null : stock.ticker)}
                    >
                      <td className="px-4 py-3 text-center" onClick={(e) => toggleCompare(e, stock.ticker)}>
                        <Checkbox checked={selectedForCompare.has(stock.ticker)} readOnly />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary ring-1 ring-primary/20">
                            {stock.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[15px] font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">{stock.ticker}</span>
                              <Badge variant="outline" className="rounded-full border-border px-2 py-0 text-[10px] text-muted-foreground">{stock.exchange}</Badge>
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{stock.name} · {stock.sector}</div>
                          </div>
                        </div>
                      </td>
                      <td className={"px-4 py-3 text-[15px] " + colorClass}>{formatCurrency(stock.price)}</td>
                      <td className="px-4 py-3">
                        <div className={"flex items-center text-[15px] " + colorClass}>
                          {isUp ? <ArrowUp className="mr-1 h-3.5 w-3.5" /> : isDown ? <ArrowDown className="mr-1 h-3.5 w-3.5" /> : <Minus className="mr-1 h-3.5 w-3.5" />}
                          {Math.abs(stock.changePercent).toFixed(1)}%
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell"><Badge variant={stock.signal === "Breakout" ? "success" : "secondary"} className="rounded-full">{stock.signal}</Badge></td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{formatCompact(stock.volume)}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground lg:table-cell">{stock.marketCap.toLocaleString()}</td>
                      <td className="hidden px-4 py-3 text-[13px] font-medium text-foreground sm:table-cell">{stock.pe.toFixed(1)}</td>
                      <td className="hidden px-4 py-3 text-[13px] font-medium text-foreground xl:table-cell">{stock.roe.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-14 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${stock.score}%` }} /></div>
                          <span className="font-mono text-xs text-foreground">{stock.score}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </td>
                    </tr>
                    {activeStock?.ticker === stock.ticker && (
                      <tr className="bg-background/70 xl:hidden">
                        <td colSpan={10} className="p-4">
                          <StockInsight stock={stock} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="flex h-72 flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <SearchX className="mb-4 h-10 w-10 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">No stocks found</h3>
              <p className="mt-2 max-w-md text-sm">No tickers matched “{query}”. Try a ticker, sector, signal, or clear your search.</p>
            </div>
          )}
        </div>

        {selectedForCompare.size > 0 && (
          <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border bg-card/95 px-4 py-3 shadow-2xl backdrop-blur animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-r border-border pr-4">
              <LineChart className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{selectedForCompare.size} Selected</span>
            </div>
            <Button onClick={handleCompareAction} size="sm" className="rounded-full px-5">Compare</Button>
          </div>
        )}
      </div>

      <div className="xl:block">
        {activeStock ? <StockInsight stock={activeStock} /> : null}
      </div>
    </div>
  )
}

function StockInsight({ stock }: { stock: Stock }) {
  const [agentState, setAgentState] = React.useState<{ ticker: string; suggestion: TradingSuggestion | null; isLoading: boolean; error: string | null }>({
    ticker: stock.ticker,
    suggestion: null,
    isLoading: true,
    error: null,
  })

  if (agentState.ticker !== stock.ticker) {
    setAgentState({ ticker: stock.ticker, suggestion: null, isLoading: true, error: null })
  }

  React.useEffect(() => {
    const controller = new AbortController()

    fetchTradingSuggestion(stock.ticker, controller.signal)
      .then((suggestion) => {
        if (!controller.signal.aborted) setAgentState({ ticker: stock.ticker, suggestion, isLoading: false, error: null })
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setAgentState({
          ticker: stock.ticker,
          suggestion: buildMockTradingSuggestion(stock),
          isLoading: false,
          error: error instanceof Error ? error.message : "Using local agent preview",
        })
      })

    return () => controller.abort()
  }, [stock])

  const metrics = [
    ["P/B", stock.pb.toFixed(1) + "x"],
    ["Dividend", stock.dividendYield.toFixed(1) + "%"],
    ["Growth", stock.revenueGrowth.toFixed(1) + "%"],
    ["Beta", stock.beta.toFixed(2)],
  ]

  return (
    <div className="sticky top-20 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
      <div className="border-b border-border bg-gradient-to-br from-primary/20 via-card to-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><Badge variant="outline" className="rounded-full">{stock.exchange}</Badge><Badge variant="success" className="rounded-full">{stock.analystRating}</Badge></div>
            <h3 className="mt-3 text-2xl font-black text-foreground">{stock.ticker}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="rounded-2xl bg-background/70 p-3 text-center ring-1 ring-border">
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="text-2xl font-black text-primary">{stock.score}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border/80 bg-background/60 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-1 font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[320px] p-4"><StockChart data={mockChartDataMap[stock.ticker]} ticker={stock.ticker} /></div>

      <div className="grid gap-3 border-t border-border p-4">
        <div className="flex items-start gap-3 rounded-2xl bg-background/70 p-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Why it ranks</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{stock.signal} profile with {stock.roe.toFixed(1)}% ROE, {stock.revenueGrowth.toFixed(1)}% revenue growth, and {formatCompact(stock.volume)} shares traded.</p>
          </div>
        </div>

        <AgentSuggestionCard suggestion={agentState.suggestion} isLoading={agentState.isLoading} error={agentState.error} />

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="rounded-full"><Star className="h-4 w-4" /> Save</Button>
          <Button variant="outline" size="sm" className="rounded-full"><ShieldCheck className="h-4 w-4" /> Alert</Button>
          <Button size="sm" className="rounded-full"><BarChart3 className="h-4 w-4" /> Deep dive</Button>
        </div>
      </div>
    </div>
  )
}

function AgentSuggestionCard({ suggestion, isLoading, error }: { suggestion: TradingSuggestion | null; isLoading: boolean; error: string | null }) {
  if (isLoading && !suggestion) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Asking NestEgg agents for a trading suggestion…
      </div>
    )
  }

  if (!suggestion) {
    return (
      <div className="rounded-2xl border border-border bg-background/70 p-3 text-xs text-muted-foreground">
        Agent suggestion is unavailable for this ticker.
      </div>
    )
  }

  const topReports = suggestion.analystReports.slice(0, 2)

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3" data-testid="agent-suggestion-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <BrainCircuit className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">TradingAgents suggestion</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{suggestion.thesis}</p>
          </div>
        </div>
        <Badge variant={suggestion.action === "BUY" || suggestion.action === "ACCUMULATE" ? "success" : suggestion.action === "SELL" || suggestion.action === "REDUCE" ? "danger" : "secondary"} className="rounded-full">
          {suggestion.action}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-background/70 p-2 ring-1 ring-border/70">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Conviction</div>
          <div className="mt-1 font-bold text-primary">{suggestion.conviction}</div>
        </div>
        <div className="rounded-xl bg-background/70 p-2 ring-1 ring-border/70">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk</div>
          <div className="mt-1 font-bold text-foreground">{suggestion.riskAssessment.riskLevel}</div>
        </div>
        <div className="rounded-xl bg-background/70 p-2 ring-1 ring-border/70">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Target</div>
          <div className="mt-1 font-bold text-foreground">{suggestion.targetWeightPercent}%</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {topReports.map((report) => (
          <div key={report.role} className="flex items-center justify-between gap-3 rounded-xl bg-background/60 px-3 py-2 text-xs">
            <span className="font-medium text-foreground">{report.role}</span>
            <span className="text-muted-foreground">{report.stance} · {report.score}</span>
          </div>
        ))}
      </div>

      {error ? <p className="mt-3 text-[11px] text-muted-foreground">Live API unavailable; showing local preview.</p> : null}
    </div>
  )
}
