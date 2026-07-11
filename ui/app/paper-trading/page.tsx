"use client"

import { RequireAuth } from "@/components/auth/RequireAuth"
import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/Button"
import { fetchPaperTradingSession, placePaperTradingOrder, resetPaperTradingAccount, type PaperTradingMarketTicker, type PaperTradingSession } from "@/lib/paper-trading-api"
import { Activity, AlertTriangle, Bot, History, LineChart, RefreshCcw, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_PAPER_TRADING_LOCALE || "vi-VN"
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_PAPER_TRADING_CURRENCY || "VND"

export default function PaperTradingPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to paper trade" fallbackDescription="Paper trading uses your protected virtual account, holdings, and transaction ledger from the NestEgg backend.">
      <PaperTradingWorkspace />
    </RequireAuth>
  )
}

function PaperTradingWorkspace() {
  const { user } = useAuth()
  const [session, setSession] = useState<PaperTradingSession | null>(null)
  const [selectedTicker, setSelectedTicker] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [message, setMessage] = useState("Loading your paper trading account from the backend...")
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    const controller = new AbortController()
    fetchPaperTradingSession(user.id, controller.signal)
      .then((data) => {
        setSession(data)
        setSelectedTicker(data.marketWatch[0]?.ticker ?? "")
        setMessage(data.mentorMessage)
      })
      .catch((error: Error) => setMessage(error.message))
    return () => controller.abort()
  }, [user])

  const selectedStock = useMemo(() => session?.marketWatch.find((stock) => stock.ticker === selectedTicker) ?? session?.marketWatch[0], [selectedTicker, session])
  const formatLocale = DEFAULT_LOCALE
  const currency = useMemo(() => new Intl.NumberFormat(formatLocale, { style: "currency", currency: DEFAULT_CURRENCY, maximumFractionDigits: 0 }), [formatLocale])
  const number = useMemo(() => new Intl.NumberFormat(formatLocale), [formatLocale])
  const orderValue = (selectedStock?.price ?? 0) * quantity

  const refreshSession = (nextSession: PaperTradingSession) => {
    setSession(nextSession)
    setSelectedTicker((current) => current || nextSession.marketWatch[0]?.ticker || "")
    setMessage(nextSession.mentorMessage)
  }

  const submitOrder = async (side: "BUY" | "SELL") => {
    if (!user || !selectedStock || quantity <= 0) return
    setIsBusy(true)
    try {
      refreshSession(await placePaperTradingOrder(user.id, { ticker: selectedStock.ticker, shares: quantity, side }))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed")
    } finally {
      setIsBusy(false)
    }
  }

  const resetAccount = async () => {
    if (!user) return
    setIsBusy(true)
    try {
      refreshSession(await resetPaperTradingAccount(user.id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset failed")
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <section className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-2xl shadow-black/20 backdrop-blur xl:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Paper trading lab</div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">Practice Vietnam market execution with a real backend ledger.</h1>
              <p className="mt-4 max-w-3xl text-muted-foreground md:text-lg">Starting capital, cash, holdings, orders, and transaction history are loaded from the API and persisted to the database for your logged-in user.</p>
            </div>
            <Button variant="outline" onClick={resetAccount} disabled={isBusy || !session}><RefreshCcw /> Start Over</Button>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Metric icon={Wallet} label="Purchasing Power" value={currency.format(session?.cashBalance ?? 0)} />
            <Metric icon={LineChart} label="Total Portfolio Value" value={currency.format(session?.totalPortfolioValue ?? 0)} />
            <Metric icon={TrendingUp} label="Overall ROI" value={`${(session?.roiPercent ?? 0) >= 0 ? "+" : ""}${(session?.roiPercent ?? 0).toFixed(2)}%`} tone={(session?.roiPercent ?? 0) >= 0 ? "text-success" : "text-danger"} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <h2 className="text-xl font-bold">Market Watch</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(session?.marketWatch ?? []).slice(0, 8).map((stock) => <MarketCard key={stock.ticker} stock={stock} active={stock.ticker === selectedTicker} onTrade={() => setSelectedTicker(stock.ticker)} currencyFormatter={currency} />)}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Trade Ticket</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Market order</span></div>
            <div className="mt-4 rounded-2xl bg-background/70 p-4 ring-1 ring-border">
              <select value={selectedTicker} onChange={(event) => setSelectedTicker(event.target.value)} className="w-full rounded-xl bg-input p-3 text-foreground outline-none ring-1 ring-border focus:ring-primary">
                {(session?.marketWatch ?? []).map((stock) => <option key={stock.ticker} value={stock.ticker}>{stock.ticker} · {stock.name ?? "Listed company"}</option>)}
              </select>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-muted-foreground">Shares<input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-1 w-full rounded-xl bg-input p-3 text-foreground outline-none ring-1 ring-border focus:ring-primary" /></label>
                <div className="rounded-xl border border-border p-3"><p className="text-sm text-muted-foreground">Estimated value</p><p className="mt-1 font-mono text-lg font-bold">{currency.format(orderValue)}</p></div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3"><Button variant="success" disabled={isBusy || !selectedStock} onClick={() => submitOrder("BUY")}>Buy</Button><Button variant="danger" disabled={isBusy || !selectedStock} onClick={() => submitOrder("SELL")}>Sell</Button><Button variant="outline" disabled={!selectedStock} onClick={() => setMessage(`What-if: buying ${number.format(quantity)} ${selectedStock?.ticker} shares would use ${currency.format(orderValue)} of backend-reported purchasing power.`)}><Bot /> What-if</Button></div>
            </div>
            <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/10 p-4"><div className="flex items-start gap-3"><Bot className="mt-1 h-5 w-5 text-primary" /><div><p className="font-bold text-primary">AI Mentor Panel</p><p className="mt-1 text-sm leading-6 text-foreground">{message}</p></div></div></div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <h2 className="text-xl font-bold">Portfolio Holdings</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Ticker</th><th className="p-3">Shares</th><th className="p-3">Avg Cost</th><th className="p-3">Current</th><th className="p-3">P/L</th><th className="p-3">Sector</th></tr></thead><tbody>{(session?.holdings ?? []).map((row) => <tr key={row.ticker} className="border-t border-border"><td className="p-3 font-bold">{row.ticker}</td><td className="p-3 font-mono">{number.format(row.shares)}</td><td className="p-3">{currency.format(row.averageCost)}</td><td className="p-3">{currency.format(row.currentPrice)}</td><td className={`p-3 font-semibold ${row.unrealizedPnl >= 0 ? "text-success" : "text-danger"}`}>{currency.format(row.unrealizedPnl)}</td><td className="p-3">{row.sector ?? "Unknown"}</td></tr>)}</tbody></table>
              {session?.holdings.length === 0 && <p className="rounded-2xl bg-background/70 p-6 text-center text-muted-foreground">No holdings yet. Your backend account starts with cash only.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-4">
            <div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">Transaction Ledger</h2></div>
            <div className="mt-4 space-y-3">{(session?.ledger ?? []).slice(0, 6).map((entry) => <div key={entry.id} className="rounded-2xl bg-background/70 p-3 ring-1 ring-border"><div className="flex items-center justify-between"><span className={entry.side === "BUY" ? "font-bold text-success" : "font-bold text-danger"}>{entry.side} {entry.ticker}</span><span className="text-xs text-muted-foreground">{new Date(entry.executedAt).toLocaleString(formatLocale)}</span></div><p className="mt-1 text-sm text-muted-foreground">{number.format(entry.shares)} shares @ {currency.format(entry.price)} · {currency.format(entry.total)}</p></div>)}{session?.ledger.length === 0 && <p className="text-sm text-muted-foreground">No ledger entries yet. Trades will persist here after execution.</p>}</div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Feature icon={ShieldCheck} title="Database-backed account" text="The API creates one virtual account per logged-in user with 100,000,000 VND starting capital and no initial holdings." />
          <Feature icon={Activity} title="Backend tickers" text="The market watch is served from backend stock overview records, with deterministic prices until a live feed is connected." />
          <Feature icon={AlertTriangle} title="Transactional orders" text="Buy, sell, reset, holdings, cash, and ledger state are executed server-side instead of being only in browser memory." />
        </section>
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value, tone = "text-foreground" }: { icon: typeof Wallet; label: string; value: string; tone?: string }) {
  return <div className="rounded-2xl border border-border bg-background/60 p-4"><div className="mb-3 flex items-center justify-between text-muted-foreground"><span className="text-xs uppercase tracking-wider">{label}</span><Icon className="h-4 w-4" /></div><p className={`text-2xl font-black ${tone}`}>{value}</p></div>
}

function MarketCard({ stock, active, onTrade, currencyFormatter }: { stock: PaperTradingMarketTicker; active: boolean; onTrade: () => void; currencyFormatter: Intl.NumberFormat }) {
  return <button onClick={onTrade} className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-background/60 hover:border-primary/50"}`}><div className="flex items-start justify-between"><div><p className="text-lg font-black">{stock.ticker}</p><p className="text-xs text-muted-foreground">{stock.exchange ?? "VN"} · {stock.sector ?? "Unknown"}</p></div><span className={stock.changePercent >= 0 ? "text-sm font-bold text-success" : "text-sm font-bold text-danger"}>{stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%</span></div><div className="mt-4 flex items-end justify-between"><p className="font-mono font-bold">{currencyFormatter.format(stock.price)}</p><span className="text-xs text-primary">Trade</span></div></button>
}

function Feature({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="rounded-3xl border border-border bg-card/70 p-5"><Icon className="h-5 w-5 text-primary" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>
}
