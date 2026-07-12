"use client"

import { useState, useCallback, useMemo } from "react"
import { Sparkles, GraduationCap, Rocket, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { TourStep } from "./TourStep"
import {
  TOUR_STEPS,
  shouldShowOnboarding,
  completeTour,
} from "@/lib/paper-trading/onboarding"

interface OnboardingTourProps {
  onComplete?: () => void
  forceShow?: boolean
}

type TourPhase = "idle" | "welcome" | "touring" | "completed"

function getInitialPhase(forceShow: boolean): TourPhase {
  if (forceShow) return "welcome"
  if (typeof window !== "undefined" && shouldShowOnboarding()) return "welcome"
  return "idle"
}

export function OnboardingTour({ onComplete, forceShow = false }: OnboardingTourProps) {
  const initialPhase = useMemo(() => getInitialPhase(forceShow), [forceShow])
  const [phase, setPhase] = useState<TourPhase>(initialPhase)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleStartTour = () => {
    setPhase("touring")
    setCurrentStepIndex(0)
  }

  const handleSkipTour = useCallback(() => {
    completeTour(dontShowAgain)
    setPhase("idle")
    onComplete?.()
  }, [dontShowAgain, onComplete])

  const handleCompleteTour = useCallback(() => {
    setPhase("completed")
  }, [])

  const handleFinishTour = useCallback(() => {
    completeTour(dontShowAgain)
    setPhase("idle")
    onComplete?.()
  }, [dontShowAgain, onComplete])

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      handleCompleteTour()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  if (phase === "idle") return null

  if (phase === "welcome") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
        <div className="relative w-full max-w-md mx-4 rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in-0">
          <button
            onClick={handleSkipTour}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Welcome to Paper Trading!
              <Sparkles className="inline-block ml-2 h-5 w-5 text-yellow-500" />
            </h2>
            <p className="text-muted-foreground">
              Practice trading with virtual money in a risk-free environment. Would you like a
              quick tour of the platform?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: "📊", label: "Track Portfolio" },
              { icon: "📈", label: "Trade Stocks" },
              { icon: "📚", label: "Learn Trading" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-xs text-muted-foreground text-center">{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Button onClick={handleStartTour} className="w-full h-11 gap-2">
              <Rocket className="h-4 w-4" />
              Start Tour
            </Button>
            <Button variant="outline" onClick={handleSkipTour} className="w-full">
              Skip for now
            </Button>
          </div>

          <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <Checkbox
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">Do not show this again</span>
          </label>
        </div>
      </div>
    )
  }

  if (phase === "touring") {
    const currentStep = TOUR_STEPS[currentStepIndex]
    return (
      <TourStep
        step={currentStep}
        currentStep={currentStepIndex + 1}
        totalSteps={TOUR_STEPS.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkipTour}
        isFirst={currentStepIndex === 0}
        isLast={currentStepIndex === TOUR_STEPS.length - 1}
      />
    )
  }

  if (phase === "completed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0">
        <div className="relative w-full max-w-md mx-4 rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in-0">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-success/10 p-4">
              <span className="text-5xl">🎉</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className="text-muted-foreground mb-4">
              You have completed the tour and unlocked the Paper Trader achievement!
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
              <span className="text-xl">🏆</span>
              <span className="font-semibold text-primary">Paper Trader</span>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4 mb-6">
            <h4 className="font-semibold mb-2 text-sm">Quick Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start with small trades to learn the interface</li>
              <li>• Use stop-loss orders to manage risk</li>
              <li>• Track your trades in the journal</li>
            </ul>
          </div>

          <Button onClick={handleFinishTour} className="w-full h-11">
            Start Trading!
          </Button>

          <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
            <Checkbox
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <span className="text-sm text-muted-foreground">Do not show tour on next visit</span>
          </label>
        </div>
      </div>
    )
  }

  return null
}

interface StartTourButtonProps {
  className?: string
}

export function StartTourButton({ className = "" }: StartTourButtonProps) {
  const [showTour, setShowTour] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowTour(true)}
        className={`gap-2 ${className}`}
      >
        <GraduationCap className="h-4 w-4" />
        Take Tour
      </Button>

      {showTour && (
        <OnboardingTour forceShow={true} onComplete={() => setShowTour(false)} />
      )}
    </>
  )
}
