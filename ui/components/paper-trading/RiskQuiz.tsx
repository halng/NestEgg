"use client"

import { useState, useMemo } from "react"
import {
  Shield,
  TrendingUp,
  Zap,
  ChevronLeft,
  RotateCcw,
  X,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  RISK_QUIZ_QUESTIONS,
  RISK_PROFILES,
  calculateRiskProfile,
  getRiskProfileState,
  saveRiskProfile,
  clearRiskProfile,
} from "@/lib/paper-trading/risk-profile"
import type { RiskProfileResult, RiskTolerance } from "@/lib/paper-trading/types"

interface RiskQuizProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (result: RiskProfileResult) => void
}

type QuizPhase = "intro" | "questions" | "results"

const TOLERANCE_ICONS: Record<RiskTolerance, React.ReactNode> = {
  conservative: <Shield className="h-8 w-8" />,
  moderate: <TrendingUp className="h-8 w-8" />,
  aggressive: <Zap className="h-8 w-8" />,
}

const TOLERANCE_COLORS: Record<RiskTolerance, string> = {
  conservative: "text-blue-500 bg-blue-500/10",
  moderate: "text-yellow-500 bg-yellow-500/10",
  aggressive: "text-red-500 bg-red-500/10",
}

function getInitialState(): { phase: QuizPhase; result: RiskProfileResult | null } {
  if (typeof window === "undefined") {
    return { phase: "intro", result: null }
  }
  const existing = getRiskProfileState()
  if (existing) {
    return {
      phase: "results",
      result: {
        ...RISK_PROFILES[existing.tolerance],
        score: existing.score,
      },
    }
  }
  return { phase: "intro", result: null }
}

export function RiskQuiz({ isOpen, onClose, onComplete }: RiskQuizProps) {
  const initialState = useMemo(() => getInitialState(), [])
  const [phase, setPhase] = useState<QuizPhase>(initialState.phase)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<RiskProfileResult | null>(initialState.result)

  const handleStartQuiz = () => {
    setPhase("questions")
    setCurrentQuestion(0)
    setAnswers({})
    setResult(null)
  }

  const handleSelectAnswer = (questionId: string, score: number) => {
    const newAnswers = { ...answers, [questionId]: score }
    setAnswers(newAnswers)

    setTimeout(() => {
      if (currentQuestion < RISK_QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        const profileResult = calculateRiskProfile(newAnswers)
        setResult(profileResult)
        saveRiskProfile(profileResult)
        setPhase("results")
        onComplete?.(profileResult)
      }
    }, 300)
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleRetake = () => {
    clearRiskProfile()
    handleStartQuiz()
  }

  const progress = useMemo(() => {
    return ((currentQuestion + 1) / RISK_QUIZ_QUESTIONS.length) * 100
  }, [currentQuestion])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg mx-4 rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 fade-in-0 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {phase === "intro" && <IntroScreen onStart={handleStartQuiz} />}

        {phase === "questions" && (
          <QuestionScreen
            question={RISK_QUIZ_QUESTIONS[currentQuestion]}
            currentIndex={currentQuestion}
            totalQuestions={RISK_QUIZ_QUESTIONS.length}
            selectedAnswer={answers[RISK_QUIZ_QUESTIONS[currentQuestion].id]}
            progress={progress}
            onSelect={handleSelectAnswer}
            onBack={handleBack}
            canGoBack={currentQuestion > 0}
          />
        )}

        {phase === "results" && result && (
          <ResultsScreen result={result} onRetake={handleRetake} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-6">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-primary/10 p-4">
          <Shield className="h-10 w-10 text-primary" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Risk Assessment Quiz</h2>
        <p className="text-muted-foreground">
          Answer a few questions to help us understand your investment style and risk tolerance.
          We will use this to personalize position size recommendations.
        </p>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 mb-6">
        <h4 className="font-semibold mb-3 text-sm">What you will learn:</h4>
        <ul className="space-y-2">
          {[
            "Your risk tolerance profile",
            "Recommended position sizes",
            "Personalized trading guidance",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
        <span>📝</span>
        <span>{RISK_QUIZ_QUESTIONS.length} questions · Takes ~2 minutes</span>
      </div>

      <Button onClick={onStart} className="w-full h-11">
        Start Assessment
      </Button>
    </div>
  )
}

interface QuestionScreenProps {
  question: (typeof RISK_QUIZ_QUESTIONS)[0]
  currentIndex: number
  totalQuestions: number
  selectedAnswer?: number
  progress: number
  onSelect: (questionId: string, score: number) => void
  onBack: () => void
  canGoBack: boolean
}

function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  progress,
  onSelect,
  onBack,
  canGoBack,
}: QuestionScreenProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-6">{question.question}</h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.score
          return (
            <button
              key={option.value}
              onClick={() => onSelect(question.id, option.score)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <span className="text-sm">{option.label}</span>
            </button>
          )
        })}
      </div>

      {canGoBack && (
        <Button variant="ghost" onClick={onBack} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      )}
    </div>
  )
}

interface ResultsScreenProps {
  result: RiskProfileResult
  onRetake: () => void
  onClose: () => void
}

function ResultsScreen({ result, onRetake, onClose }: ResultsScreenProps) {
  const toleranceLabel = result.tolerance.charAt(0).toUpperCase() + result.tolerance.slice(1)

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div
          className={`inline-flex rounded-full p-4 mb-4 ${TOLERANCE_COLORS[result.tolerance]}`}
        >
          {TOLERANCE_ICONS[result.tolerance]}
        </div>
        <h2 className="text-2xl font-bold mb-1">Your Risk Profile</h2>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {toleranceLabel} Investor
        </Badge>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 mb-4">
        <p className="text-sm text-muted-foreground">{result.description}</p>
      </div>

      <div className="rounded-xl border border-border p-4 mb-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Recommendations
        </h4>
        <p className="text-sm text-muted-foreground mb-4">{result.recommendation}</p>

        <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
          <span className="text-sm font-medium">Max Position Size</span>
          <span className="text-lg font-bold text-primary">
            {result.maxPositionSizePercent}%
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-muted/30 p-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your Score</span>
          <span className="font-mono font-semibold">
            {result.score} / {RISK_QUIZ_QUESTIONS.length * 4}
          </span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all ${
              result.tolerance === "conservative"
                ? "bg-blue-500"
                : result.tolerance === "moderate"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${(result.score / (RISK_QUIZ_QUESTIONS.length * 4)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Conservative</span>
          <span>Moderate</span>
          <span>Aggressive</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetake} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Retake Quiz
        </Button>
        <Button onClick={onClose} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  )
}

interface RiskQuizTriggerProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
}

function getInitialProfile(): RiskTolerance | null {
  if (typeof window === "undefined") return null
  const profile = getRiskProfileState()
  return profile?.tolerance ?? null
}

export function RiskQuizTrigger({ className = "", variant = "outline" }: RiskQuizTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const initialProfile = useMemo(() => getInitialProfile(), [])
  const [existingProfile] = useState<RiskTolerance | null>(initialProfile)

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`gap-2 ${className}`}
      >
        <Shield className="h-4 w-4" />
        {existingProfile ? `${existingProfile.charAt(0).toUpperCase() + existingProfile.slice(1)} Profile` : "Risk Assessment"}
      </Button>

      <RiskQuiz isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
