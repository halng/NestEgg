export const ORDER_TYPES = [
  { value: "MARKET", label: "Market", description: "Execute immediately at current price" },
  { value: "LIMIT", label: "Limit", description: "Execute at specified price or better" },
  { value: "STOP", label: "Stop", description: "Trigger market order when price reaches stop" },
  { value: "STOP_LIMIT", label: "Stop-Limit", description: "Trigger limit order when price reaches stop" },
  { value: "TRAILING_STOP", label: "Trailing Stop", description: "Dynamic stop that follows price" },
] as const

export const TIME_IN_FORCE_OPTIONS = [
  { value: "DAY", label: "Day", description: "Valid until market close" },
  { value: "GTC", label: "GTC", description: "Good 'til cancelled" },
  { value: "IOC", label: "IOC", description: "Immediate or cancel" },
  { value: "FOK", label: "FOK", description: "Fill or kill" },
] as const

export const SECTOR_COLORS = {
  Banking: "#3b82f6",
  Technology: "#8b5cf6",
  "Real Estate": "#f59e0b",
  Energy: "#ef4444",
  Consumer: "#10b981",
  Industrial: "#6366f1",
  Healthcare: "#ec4899",
  Materials: "#14b8a6",
  Utilities: "#f97316",
  Other: "#6b7280",
} as const

export const DEFAULT_LOCALE = "vi-VN"
export const DEFAULT_CURRENCY = "VND"
export const STARTING_CAPITAL = 100_000_000
