import type {
  RiskQuizQuestion,
  RiskProfileResult,
  RiskProfileState,
  RiskTolerance,
} from "./types"

const RISK_PROFILE_STORAGE_KEY = "paper-trading-risk-profile"

export const RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: "portfolio-drop",
    question: "How would you react if your portfolio dropped 20% in a month?",
    options: [
      { value: "sell-all", label: "Sell everything immediately to prevent more losses", score: 1 },
      { value: "sell-some", label: "Sell some holdings but keep core positions", score: 2 },
      { value: "hold", label: "Hold steady and wait for recovery", score: 3 },
      { value: "buy-more", label: "See it as an opportunity to buy more at lower prices", score: 4 },
    ],
  },
  {
    id: "investment-goal",
    question: "What's your primary investment goal?",
    options: [
      { value: "preserve", label: "Preserve my capital with minimal risk", score: 1 },
      { value: "income", label: "Generate steady income from dividends", score: 2 },
      { value: "growth", label: "Grow my wealth over time with moderate risk", score: 3 },
      { value: "aggressive", label: "Maximize growth, accepting higher volatility", score: 4 },
    ],
  },
  {
    id: "time-horizon",
    question: "How long do you plan to keep your money invested?",
    options: [
      { value: "short", label: "Less than 1 year", score: 1 },
      { value: "medium-short", label: "1-3 years", score: 2 },
      { value: "medium-long", label: "3-7 years", score: 3 },
      { value: "long", label: "More than 7 years", score: 4 },
    ],
  },
  {
    id: "experience",
    question: "How much investment experience do you have?",
    options: [
      { value: "none", label: "None - I'm completely new to investing", score: 1 },
      { value: "beginner", label: "Beginner - I've made a few trades", score: 2 },
      { value: "intermediate", label: "Intermediate - I understand basic strategies", score: 3 },
      { value: "advanced", label: "Advanced - I actively manage my portfolio", score: 4 },
    ],
  },
  {
    id: "savings-portion",
    question: "What portion of your total savings is this investment?",
    options: [
      { value: "most", label: "More than 75% of my savings", score: 1 },
      { value: "half", label: "50-75% of my savings", score: 2 },
      { value: "some", label: "25-50% of my savings", score: 3 },
      { value: "little", label: "Less than 25% of my savings", score: 4 },
    ],
  },
  {
    id: "volatility-comfort",
    question: "How comfortable are you with daily price fluctuations?",
    options: [
      { value: "uncomfortable", label: "Very uncomfortable - I check prices constantly", score: 1 },
      { value: "slightly", label: "Slightly uncomfortable - I prefer stability", score: 2 },
      { value: "moderate", label: "Moderately comfortable - I accept some volatility", score: 3 },
      { value: "very", label: "Very comfortable - volatility doesn't bother me", score: 4 },
    ],
  },
]

export const RISK_PROFILES: Record<RiskTolerance, Omit<RiskProfileResult, "score">> = {
  conservative: {
    tolerance: "conservative",
    maxPositionSizePercent: 5,
    description:
      "You prefer stability and capital preservation over high returns. You're uncomfortable with significant losses and value peace of mind.",
    recommendation:
      "Focus on blue-chip stocks, dividend-paying companies, and diversified positions. Limit individual stock positions to 5% of your portfolio and always use stop-loss orders.",
  },
  moderate: {
    tolerance: "moderate",
    maxPositionSizePercent: 10,
    description:
      "You seek a balance between growth and stability. You can tolerate some volatility for potentially higher returns but prefer to avoid extreme risks.",
    recommendation:
      "Build a diversified portfolio with a mix of growth and value stocks. Consider position sizes up to 10% for high-conviction trades, and use stop-loss orders on more volatile positions.",
  },
  aggressive: {
    tolerance: "aggressive",
    maxPositionSizePercent: 20,
    description:
      "You're comfortable with significant volatility in pursuit of higher returns. You have experience managing risk and can handle substantial drawdowns.",
    recommendation:
      "You can take larger positions up to 20% in high-conviction opportunities. Consider growth stocks and momentum strategies, but maintain discipline with risk management.",
  },
}

export function calculateRiskProfile(answers: Record<string, number>): RiskProfileResult {
  const scores = Object.values(answers)
  const totalScore = scores.reduce((sum, score) => sum + score, 0)
  const maxPossibleScore = RISK_QUIZ_QUESTIONS.length * 4
  const normalizedScore = totalScore / maxPossibleScore

  let tolerance: RiskTolerance
  if (normalizedScore <= 0.4) {
    tolerance = "conservative"
  } else if (normalizedScore <= 0.7) {
    tolerance = "moderate"
  } else {
    tolerance = "aggressive"
  }

  return {
    ...RISK_PROFILES[tolerance],
    score: totalScore,
  }
}

export function getRiskProfileState(): RiskProfileState | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(RISK_PROFILE_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // localStorage not available or parse error
  }

  return null
}

export function saveRiskProfile(result: RiskProfileResult): void {
  if (typeof window === "undefined") return

  const state: RiskProfileState = {
    tolerance: result.tolerance,
    score: result.score,
    completedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(RISK_PROFILE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage not available
  }
}

export function clearRiskProfile(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(RISK_PROFILE_STORAGE_KEY)
  } catch {
    // localStorage not available
  }
}

export function getPositionSizeRecommendation(tolerance: RiskTolerance): number {
  return RISK_PROFILES[tolerance].maxPositionSizePercent
}
