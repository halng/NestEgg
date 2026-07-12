"use client"

import { OrderType } from "@/lib/paper-trading/types"

interface OrderTypeSelectorProps {
  value: OrderType
  onChange: (type: OrderType) => void
  disabled?: boolean
}

export function OrderTypeSelector({ value, onChange, disabled }: OrderTypeSelectorProps) {
  const orderTypes = [
    { value: "MARKET", label: "Market", description: "Execute immediately" },
    { value: "LIMIT", label: "Limit", description: "Set your price" },
    { value: "STOP", label: "Stop", description: "Trigger at price" },
    { value: "STOP_LIMIT", label: "Stop-Limit", description: "Stop + Limit" },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Order type">
      {orderTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          role="radio"
          aria-checked={value === type.value}
          onClick={() => onChange(type.value as OrderType)}
          disabled={disabled}
          className={`rounded-xl p-3 text-left transition border ${
            value === type.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background/60 hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <p className="font-semibold text-sm">{type.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
        </button>
      ))}
    </div>
  )
}
