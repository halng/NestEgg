"use client"

import { DEFAULT_CURRENCY } from "@/lib/paper-trading/constants"

interface PriceInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  label?: string
  disabled?: boolean
}

export function PriceInput({ value, onChange, placeholder = "0", label, disabled }: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "")
    onChange(rawValue ? parseInt(rawValue) : undefined)
  }

  const displayValue = value ? value.toLocaleString("vi-VN") : ""

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm text-muted-foreground">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label || "Price"}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 pr-14 font-mono text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {DEFAULT_CURRENCY}
        </span>
      </div>
    </div>
  )
}
