"use client"

import { TimeInForce } from "@/lib/paper-trading/types"
import { TIME_IN_FORCE_OPTIONS } from "@/lib/paper-trading/constants"

interface TimeInForceSelectProps {
  value: TimeInForce
  onChange: (value: TimeInForce) => void
  disabled?: boolean
}

export function TimeInForceSelect({ value, onChange, disabled }: TimeInForceSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-muted-foreground">Time in Force</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeInForce)}
        disabled={disabled}
        aria-label="Time in Force"
        className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        {TIME_IN_FORCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>
    </div>
  )
}
