import type { TourStepConfig, OnboardingState } from "./types"

const ONBOARDING_STORAGE_KEY = "paper-trading-onboarding"

export const TOUR_STEPS: TourStepConfig[] = [
  {
    id: "welcome",
    title: "Welcome to Paper Trading",
    description:
      "Practice trading with virtual money in a risk-free environment. This tutorial will guide you through the key features to help you get started.",
    targetSelector: "[data-tour='welcome']",
    position: "bottom",
  },
  {
    id: "portfolio-summary",
    title: "Your Portfolio Summary",
    description:
      "Here you can see your total portfolio value, cash balance, and daily performance at a glance. Track your gains and losses in real-time.",
    targetSelector: "[data-tour='portfolio-summary']",
    position: "bottom",
  },
  {
    id: "market-watch",
    title: "Market Watch - Select a Stock",
    description:
      "Browse available stocks and their current prices. Click on any stock to select it for trading. Watch for price changes and market trends.",
    targetSelector: "[data-tour='market-watch']",
    position: "right",
  },
  {
    id: "trade-ticket",
    title: "Trade Ticket - Place Your First Order",
    description:
      "This is where you execute trades. Choose between market, limit, or stop orders. Set your quantity and click Buy or Sell to place an order.",
    targetSelector: "[data-tour='trade-ticket']",
    position: "left",
  },
  {
    id: "holdings",
    title: "Holdings - Track Your Positions",
    description:
      "View all your current stock positions here. Monitor unrealized gains/losses and decide when to sell for profit or cut losses.",
    targetSelector: "[data-tour='holdings']",
    position: "top",
  },
  {
    id: "transactions",
    title: "Transaction History",
    description:
      "Review all your past trades and transactions. Learn from your trading history to improve your strategy over time.",
    targetSelector: "[data-tour='transactions']",
    position: "top",
  },
  {
    id: "ready",
    title: "You're Ready!",
    description:
      "Congratulations! You now know the basics of paper trading. Start with small trades, learn the market patterns, and build your confidence before trading with real money.",
    targetSelector: "[data-tour='ready']",
    position: "bottom",
  },
]

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return { hasCompletedTour: false, dontShowAgain: false }
  }

  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // localStorage not available or parse error
  }

  return { hasCompletedTour: false, dontShowAgain: false }
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage not available
  }
}

export function completeTour(dontShowAgain: boolean): void {
  saveOnboardingState({
    hasCompletedTour: true,
    dontShowAgain,
    completedAt: new Date().toISOString(),
  })
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  } catch {
    // localStorage not available
  }
}

export function shouldShowOnboarding(): boolean {
  const state = getOnboardingState()
  return !state.hasCompletedTour && !state.dontShowAgain
}
