export interface AgentReport {
  role: string
  stance: string
  score: number
  summary: string
  evidence: string[]
}

export interface ResearchDebate {
  bullishCase: string
  bearishCase: string
  synthesis: string
}

export interface RiskAssessment {
  riskLevel: string
  riskScore: number
  suggestedStopLossPercent: number
  constraints: string[]
}

export interface PortfolioDecision {
  action: string
  approved: boolean
  targetWeightPercent: number
  rationale: string
}

export interface TradingSuggestion {
  ticker: string
  name: string
  analysisDate: string
  action: string
  conviction: number
  targetWeightPercent: number
  thesis: string
  keyRisks: string[]
  analystReports: AgentReport[]
  researchDebate: ResearchDebate
  traderReport: AgentReport
  riskAssessment: RiskAssessment
  portfolioDecision: PortfolioDecision
  disclaimer: string
}

interface ApiResponse<T> {
  status: number
  message: string
  data: T
  isSuccess: boolean
  timestamp: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend"

export async function fetchTradingSuggestion(ticker: string, signal?: AbortSignal): Promise<TradingSuggestion> {
  const response = await fetch(`${API_BASE_URL}/agents/suggestions?ticker=${encodeURIComponent(ticker)}`, {
    headers: {
      Accept: "text/event-stream",
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Unable to fetch trading suggestion for ${ticker}`)
  }

  const responseText = await response.text()
  const payload = parseSuggestionResponse(responseText)

  if (isApiResponse(payload)) {
    if (!payload.isSuccess) {
      throw new Error(payload.message || `Unable to fetch trading suggestion for ${ticker}`)
    }

    return payload.data
  }

  return payload
}

function parseSuggestionResponse(responseText: string): TradingSuggestion | ApiResponse<TradingSuggestion> {
  const eventData = responseText
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n")
    .trim()

  return JSON.parse(eventData || responseText) as TradingSuggestion | ApiResponse<TradingSuggestion>
}

function isApiResponse(payload: TradingSuggestion | ApiResponse<TradingSuggestion>): payload is ApiResponse<TradingSuggestion> {
  return typeof (payload as ApiResponse<TradingSuggestion>).isSuccess === "boolean"
}
