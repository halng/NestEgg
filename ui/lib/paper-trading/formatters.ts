import { DEFAULT_LOCALE, DEFAULT_CURRENCY } from "./constants"

export const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  maximumFractionDigits: 0,
})

export const numberFormatter = new Intl.NumberFormat(DEFAULT_LOCALE)

export const percentFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString(DEFAULT_LOCALE)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(DEFAULT_LOCALE)
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString(DEFAULT_LOCALE)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}
