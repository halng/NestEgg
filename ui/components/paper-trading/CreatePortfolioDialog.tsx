"use client"

import { useState } from "react"
import { X, Briefcase, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/paper-trading/formatters"
import {
  PORTFOLIO_STRATEGIES,
  type PortfolioStrategy,
} from "@/lib/paper-trading/mock-portfolios"

interface CreatePortfolioDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: {
    name: string
    description?: string
    strategy?: PortfolioStrategy
    startingCapital: number
  }) => void
  existingNames: string[]
}

// Preset capital amounts in VND
const CAPITAL_PRESETS = [
  { label: "50M", value: 50_000_000 },
  { label: "100M", value: 100_000_000 },
  { label: "200M", value: 200_000_000 },
  { label: "500M", value: 500_000_000 },
]

export function CreatePortfolioDialog({
  isOpen,
  onClose,
  onCreate,
  existingNames,
}: CreatePortfolioDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [strategy, setStrategy] = useState<PortfolioStrategy | "">("")
  const [capitalInput, setCapitalInput] = useState("100000000")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const startingCapital = parseInt(capitalInput.replace(/\D/g, ""), 10) || 0
  const nameError = existingNames.includes(name.trim().toLowerCase())
    ? "A portfolio with this name already exists"
    : name.trim().length < 2
      ? "Name must be at least 2 characters"
      : null
  const capitalError = startingCapital < 1_000_000
    ? "Minimum capital is 1,000,000 VND"
    : null

  const isValid = name.trim().length >= 2 && !nameError && !capitalError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    try {
      onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        strategy: strategy || undefined,
        startingCapital,
      })
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setStrategy("")
    setCapitalInput("100000000")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const formatCapitalInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    setCapitalInput(numericValue)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Portfolio</h2>
              <p className="text-sm text-muted-foreground">Start a new paper trading portfolio</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1 hover:bg-muted transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Portfolio Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Growth Portfolio, Test Strategy"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              maxLength={50}
              required
            />
            {name && nameError && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {nameError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Describe your investment strategy or goals..."
              rows={2}
              className="w-full rounded-lg border border-border bg-input p-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              maxLength={200}
            />
          </div>

          {/* Strategy */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Strategy</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PORTFOLIO_STRATEGIES.map((strat) => (
                <button
                  key={strat.value}
                  type="button"
                  onClick={() => setStrategy(strategy === strat.value ? "" : strat.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition ${
                    strategy === strat.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xl">{strat.icon}</span>
                  <span className="text-sm font-medium">{strat.label}</span>
                </button>
              ))}
            </div>
            {strategy && (
              <p className="text-xs text-muted-foreground mt-1">
                {PORTFOLIO_STRATEGIES.find(s => s.value === strategy)?.description}
              </p>
            )}
          </div>

          {/* Starting Capital */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Starting Capital <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={startingCapital.toLocaleString("vi-VN")}
                onChange={(e) => formatCapitalInput(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-12 text-foreground font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="100,000,000"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                VND
              </span>
            </div>
            
            {/* Presets */}
            <div className="flex gap-2 mt-2">
              {CAPITAL_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setCapitalInput(preset.value.toString())}
                  className={`flex-1 rounded-lg border py-1.5 text-sm font-medium transition ${
                    startingCapital === preset.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {capitalError && (
              <p className="text-xs text-danger flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {capitalError}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-background/60 p-4 border border-border">
            <h4 className="text-sm font-medium mb-3">Portfolio Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{name.trim() || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy</span>
                <span className="font-medium">
                  {strategy ? PORTFOLIO_STRATEGIES.find(s => s.value === strategy)?.label : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Capital</span>
                <span className="font-mono font-medium">{formatCurrency(startingCapital)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Confirmation dialog for portfolio deletion
interface DeletePortfolioDialogProps {
  isOpen: boolean
  portfolioName: string
  onClose: () => void
  onConfirm: () => void
}

export function DeletePortfolioDialog({
  isOpen,
  portfolioName,
  onClose,
  onConfirm,
}: DeletePortfolioDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 mb-3">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h2 className="text-lg font-bold">Delete Portfolio?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Are you sure you want to delete <strong>{portfolioName}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
