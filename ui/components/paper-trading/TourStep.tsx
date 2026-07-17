"use client"

/* eslint-disable react-hooks/set-state-in-effect */
import { useLayoutEffect, useState, useCallback, useRef, useSyncExternalStore } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { TourStepConfig, TourStepPosition } from "@/lib/paper-trading/types"

interface TourStepProps {
  step: TourStepConfig
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

interface Position {
  top: number
  left: number
  arrowPosition: TourStepPosition
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback)
  window.addEventListener("scroll", callback)
  return () => {
    window.removeEventListener("resize", callback)
    window.removeEventListener("scroll", callback)
  }
}

function getSnapshot() {
  return { width: window.innerWidth, height: window.innerHeight }
}

function getServerSnapshot() {
  return { width: 0, height: 0 }
}

export function TourStep({
  step,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  isFirst,
  isLast,
}: TourStepProps) {
  const [position, setPosition] = useState<Position | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const hasScrolled = useRef(false)

  useSyncExternalStore(subscribeToResize, getSnapshot, getServerSnapshot)

  const computePosition = useCallback((): { position: Position; rect: DOMRect | null } => {
    const target = document.querySelector(step.targetSelector)
    if (!target) {
      return {
        position: {
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 160,
          arrowPosition: step.position,
        },
        rect: null,
      }
    }

    const rect = target.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 180
    const gap = 16
    const padding = 20

    let top: number
    let left: number

    switch (step.position) {
      case "top":
        top = rect.top - tooltipHeight - gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case "bottom":
        top = rect.bottom + gap
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - gap
        break
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + gap
        break
    }

    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding))

    return {
      position: { top, left, arrowPosition: step.position },
      rect,
    }
  }, [step.targetSelector, step.position])

  useLayoutEffect(() => {
    const { position: newPosition, rect } = computePosition()
    setPosition(newPosition)
    setTargetRect(rect)

    if (!hasScrolled.current) {
      const target = document.querySelector(step.targetSelector)
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" })
        hasScrolled.current = true
      }
    }
  }, [computePosition, step.targetSelector])

  useLayoutEffect(() => {
    hasScrolled.current = false
  }, [step.id])

  useLayoutEffect(() => {
    const handleUpdate = () => {
      const { position: newPosition, rect } = computePosition()
      setPosition(newPosition)
      setTargetRect(rect)
    }

    window.addEventListener("resize", handleUpdate)
    window.addEventListener("scroll", handleUpdate)

    return () => {
      window.removeEventListener("resize", handleUpdate)
      window.removeEventListener("scroll", handleUpdate)
    }
  }, [computePosition])

  if (!position) return null

  return (
    <>
      {targetRect && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.6)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        </div>
      )}

      {targetRect && (
        <div
          className="fixed z-40 pointer-events-none rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      <div
        className="fixed z-50 w-80 rounded-2xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95"
        style={{
          top: position.top,
          left: position.left,
        }}
        role="dialog"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-description"
      >
        <div className="flex items-center justify-between p-4 pb-0">
          <span className="text-xs font-medium text-primary">
            Step {currentStep} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 id="tour-step-title" className="text-lg font-semibold mb-2">
            {step.title}
          </h3>
          <p id="tour-step-description" className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>
        </div>

        <div className="flex justify-center gap-1.5 px-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index + 1 === currentStep
                  ? "w-4 bg-primary"
                  : index + 1 < currentStep
                  ? "w-1.5 bg-primary/60"
                  : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between p-4 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button variant="default" size="sm" onClick={onNext} className="gap-1">
            {isLast ? (
              "Finish"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <Arrow position={position.arrowPosition} />
      </div>
    </>
  )
}

function Arrow({ position }: { position: TourStepPosition }) {
  const baseClasses = "absolute w-3 h-3 rotate-45 bg-card border-border"

  switch (position) {
    case "top":
      return (
        <div
          className={`${baseClasses} border-b border-r bottom-[-7px] left-1/2 -translate-x-1/2`}
        />
      )
    case "bottom":
      return (
        <div
          className={`${baseClasses} border-t border-l top-[-7px] left-1/2 -translate-x-1/2`}
        />
      )
    case "left":
      return (
        <div
          className={`${baseClasses} border-t border-r right-[-7px] top-1/2 -translate-y-1/2`}
        />
      )
    case "right":
      return (
        <div
          className={`${baseClasses} border-b border-l left-[-7px] top-1/2 -translate-y-1/2`}
        />
      )
  }
}
