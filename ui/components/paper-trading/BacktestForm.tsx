"use client"

import { useState } from "react"
import {
  Play,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/paper-trading/formatters"
import {
  type BacktestStrategy,
  type BacktestRule,
  type BacktestIndicator,
  type BacktestCondition,
  BACKTEST_INDICATORS,
  BACKTEST_CONDITIONS,
  PRESET_STRATEGIES,
  validateStrategy,
} from "@/lib/paper-trading/backtest"
import { mockMarketWatch } from "@/lib/paper-trading/mock-data"

interface BacktestFormProps {
  onRunBacktest: (strategy: BacktestStrategy) => void
  isRunning?: boolean
}

// Default date range (last 6 months)
const getDefaultDates = () => {
  const end = new Date()
  const start = new Date()
  start.setMonth(start.getMonth() - 6)
  
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  }
}

const defaultDates = getDefaultDates()

// Capital presets
const CAPITAL_PRESETS = [
  { label: "50M", value: 50_000_000 },
  { label: "100M", value: 100_000_000 },
  { label: "200M", value: 200_000_000 },
]

export function BacktestForm({ onRunBacktest, isRunning }: BacktestFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showPresets, setShowPresets] = useState(false)
  
  // Strategy state
  const [name, setName] = useState("")
  const [ticker, setTicker] = useState("")
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)
  const [initialCapital, setInitialCapital] = useState(100_000_000)
  const [rules, setRules] = useState<BacktestRule[]>([])

  const strategy: BacktestStrategy = {
    name,
    ticker,
    startDate,
    endDate,
    initialCapital,
    rules,
  }

  const validation = validateStrategy(strategy)

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        type: "entry",
        indicator: "rsi",
        condition: "below",
        value: 30,
        action: "buy",
      },
    ])
  }

  const handleUpdateRule = (index: number, updates: Partial<BacktestRule>) => {
    setRules(rules.map((rule, i) => (i === index ? { ...rule, ...updates } : rule)))
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleApplyPreset = (preset: typeof PRESET_STRATEGIES[0]) => {
    setName(preset.name)
    setRules(preset.rules)
    setShowPresets(false)
    setStep(2) // Move to configuration step
  }

  const handleSubmit = () => {
    if (validation.isValid) {
      onRunBacktest(strategy)
    }
  }

  const canProceedToStep2 = ticker && name.trim()
  const canProceedToStep3 = rules.length > 0

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h2 className="text-lg font-bold">Strategy Backtester</h2>
        <p className="text-sm text-muted-foreground">
          Build and test trading strategies against historical data
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex border-b border-border">
        {[
          { num: 1, label: "Setup" },
          { num: 2, label: "Rules" },
          { num: 3, label: "Review" },
        ].map((s, i) => (
          <button
            key={s.num}
            onClick={() => {
              if (s.num === 1) setStep(1)
              if (s.num === 2 && canProceedToStep2) setStep(2)
              if (s.num === 3 && canProceedToStep2 && canProceedToStep3) setStep(3)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition border-b-2 ${
              step === s.num
                ? "border-primary text-primary bg-primary/5"
                : step > s.num
                ? "border-success text-success"
                : "border-transparent text-muted-foreground"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              step === s.num
                ? "bg-primary text-primary-foreground"
                : step > s.num
                ? "bg-success text-success-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Basic Setup */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Preset Strategies */}
            <div className="space-y-2">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Sparkles className="h-4 w-4" />
                Use preset strategy
                {showPresets ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {showPresets && (
                <div className="grid gap-2 mt-3">
                  {PRESET_STRATEGIES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      className="flex flex-col items-start rounded-lg border border-border p-3 text-left hover:border-primary hover:bg-primary/5 transition"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Strategy Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Strategy Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., RSI Reversal Strategy"
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Ticker Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Select Stock</label>
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Choose a stock...</option>
                {mockMarketWatch.map((stock) => (
                  <option key={stock.ticker} value={stock.ticker}>
                    {stock.ticker} - {stock.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Backtest Period
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Initial Capital */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Initial Capital
              </label>
              <div className="flex gap-2">
                {CAPITAL_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setInitialCapital(preset.value)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                      initialCapital === preset.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Starting with {formatCurrency(initialCapital)}
              </p>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
              className="w-full mt-4"
            >
              Continue to Rules
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Strategy Rules */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Trading Rules</h3>
                <p className="text-sm text-muted-foreground">
                  Define when to enter and exit positions
                </p>
              </div>
              <Button onClick={handleAddRule} size="sm">
                <Plus className="h-4 w-4" />
                Add Rule
              </Button>
            </div>

            {rules.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground mb-3">No rules defined yet</p>
                <Button onClick={handleAddRule} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Your First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <RuleBuilder
                    key={index}
                    rule={rule}
                    index={index}
                    onUpdate={(updates) => handleUpdateRule(index, updates)}
                    onRemove={() => handleRemoveRule(index)}
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="flex-1"
              >
                Review Strategy
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Run */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Summary Card */}
            <div className="rounded-xl bg-background/60 border border-border p-4 space-y-3">
              <h3 className="font-semibold">{name}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Stock</span>
                  <p className="font-medium">{ticker}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capital</span>
                  <p className="font-medium font-mono">{formatCurrency(initialCapital)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Period</span>
                  <p className="font-medium">{startDate} to {endDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rules</span>
                  <p className="font-medium">{rules.length} rules</p>
                </div>
              </div>
            </div>

            {/* Rules Summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Strategy Rules</h4>
              {rules.map((rule, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    rule.type === "entry"
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-danger/10 text-danger border border-danger/20"
                  }`}
                >
                  <span className="font-medium">{rule.type === "entry" ? "ENTRY" : "EXIT"}:</span>{" "}
                  {getRuleDescription(rule)}
                </div>
              ))}
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-danger">Strategy has issues</p>
                    <ul className="text-sm text-danger/80 mt-1 list-disc list-inside">
                      {validation.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!validation.isValid || isRunning}
                className="flex-1"
              >
                {isRunning ? (
                  <>Running...</>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Backtest
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Rule Builder Component
interface RuleBuilderProps {
  rule: BacktestRule
  index: number
  onUpdate: (updates: Partial<BacktestRule>) => void
  onRemove: () => void
}

function RuleBuilder({ rule, index, onUpdate, onRemove }: RuleBuilderProps) {
  const indicatorMeta = BACKTEST_INDICATORS.find((i) => i.value === rule.indicator)
  const availableConditions = BACKTEST_CONDITIONS.filter((c) =>
    c.indicators.includes(rule.indicator)
  )

  return (
    <div className={`rounded-xl border p-4 ${
      rule.type === "entry" ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          rule.type === "entry"
            ? "bg-success text-success-foreground"
            : "bg-danger text-danger-foreground"
        }`}>
          Rule {index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Rule Type */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Type</label>
          <select
            value={rule.type}
            onChange={(e) => onUpdate({ type: e.target.value as "entry" | "exit" })}
            className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
          >
            <option value="entry">Entry</option>
            <option value="exit">Exit</option>
          </select>
        </div>

        {/* Indicator */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Indicator</label>
          <select
            value={rule.indicator}
            onChange={(e) => {
              const newIndicator = e.target.value as BacktestIndicator
              const meta = BACKTEST_INDICATORS.find((i) => i.value === newIndicator)
              onUpdate({
                indicator: newIndicator,
                value: meta?.defaultValue || 0,
                secondaryValue: meta?.secondaryValue,
              })
            }}
            className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
          >
            {BACKTEST_INDICATORS.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label.split(" ")[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Condition</label>
          <select
            value={rule.condition}
            onChange={(e) => onUpdate({ condition: e.target.value as BacktestCondition })}
            className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
          >
            {availableConditions.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {rule.indicator === "sma_cross" ? "Fast/Slow" : "Value"}
          </label>
          {rule.indicator === "sma_cross" ? (
            <div className="flex gap-1">
              <input
                type="number"
                value={rule.value}
                onChange={(e) => onUpdate({ value: parseInt(e.target.value) || 0 })}
                className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
                placeholder="Fast"
              />
              <input
                type="number"
                value={rule.secondaryValue || 50}
                onChange={(e) => onUpdate({ secondaryValue: parseInt(e.target.value) || 0 })}
                className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
                placeholder="Slow"
              />
            </div>
          ) : (
            <input
              type="number"
              value={rule.value}
              onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
              className="h-9 w-full rounded-lg border border-border bg-input px-2 text-sm outline-none focus:border-primary"
            />
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        {indicatorMeta?.description}
      </p>
    </div>
  )
}

// Helper to generate rule description
function getRuleDescription(rule: BacktestRule): string {
  const indicatorMeta = BACKTEST_INDICATORS.find((i) => i.value === rule.indicator)
  const conditionMeta = BACKTEST_CONDITIONS.find((c) => c.value === rule.condition)

  let valueStr = rule.value.toString()
  if (rule.indicator === "sma_cross") {
    valueStr = `SMA${rule.value}/SMA${rule.secondaryValue || 50}`
  } else if (rule.indicator === "price_change") {
    valueStr = `${rule.value}%`
  } else if (rule.indicator === "price_level") {
    valueStr = formatCurrency(rule.value)
  }

  return `When ${indicatorMeta?.label.split(" ")[0] || rule.indicator} ${
    conditionMeta?.label.toLowerCase() || rule.condition
  } ${valueStr} → ${rule.action.toUpperCase()}`
}
