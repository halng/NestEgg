"use client"

import { Minus, Plus } from "lucide-react"

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 999999,
  step = 100,
  disabled,
}: QuantityInputProps) {
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0
    onChange(Math.max(min, Math.min(newValue, max)))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        aria-label="Quantity"
        className="h-10 flex-1 rounded-lg border border-border bg-input px-3 text-center font-mono text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
