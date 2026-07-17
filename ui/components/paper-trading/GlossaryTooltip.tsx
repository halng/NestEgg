"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { HelpCircle, ExternalLink } from "lucide-react"
import { getGlossaryTerm, GLOSSARY_TERMS } from "@/lib/paper-trading/glossary"
import type { GlossaryTerm } from "@/lib/paper-trading/types"

interface GlossaryTooltipProps {
  term: string
  children?: React.ReactNode
  showIcon?: boolean
  className?: string
}

export function GlossaryTooltip({
  term,
  children,
  showIcon = true,
  className = "",
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<"top" | "bottom">("bottom")
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const glossaryEntry = getGlossaryTerm(term)

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    // Prefer showing below, but switch to above if not enough space
    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      setPosition("top")
    } else {
      setPosition("bottom")
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      calculatePosition()
    }
  }, [isOpen, calculatePosition])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Close only if focus moves outside the tooltip
    if (!tooltipRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
    }
  }

  if (!glossaryEntry) {
    return <span className={className}>{children || term}</span>
  }

  return (
    <span className="relative inline-flex items-center">
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className={`inline-flex items-center gap-1 border-b border-dashed border-primary/50 cursor-help text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 rounded-sm ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-describedby={`glossary-${term.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {children || term}
        {showIcon && <HelpCircle className="h-3 w-3 flex-shrink-0" />}
      </span>

      {isOpen && (
        <TooltipContent
          ref={tooltipRef}
          glossaryEntry={glossaryEntry}
          position={position}
          onBlur={handleBlur}
        />
      )}
    </span>
  )
}

interface TooltipContentProps {
  glossaryEntry: GlossaryTerm
  position: "top" | "bottom"
  onBlur: (e: React.FocusEvent) => void
}

const TooltipContent = ({
  ref,
  glossaryEntry,
  position,
  onBlur,
}: TooltipContentProps & { ref: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div
      ref={ref}
      id={`glossary-${glossaryEntry.term.replace(/\s+/g, "-").toLowerCase()}`}
      role="tooltip"
      onBlur={onBlur}
      className={`absolute z-50 w-72 sm:w-80 p-4 rounded-xl border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 ${
        position === "top"
          ? "bottom-full mb-2 origin-bottom"
          : "top-full mt-2 origin-top"
      }`}
    >
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">{glossaryEntry.term}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {glossaryEntry.definition}
        </p>

        {glossaryEntry.example && (
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Example: </span>
              {glossaryEntry.example}
            </p>
          </div>
        )}

        {glossaryEntry.learnMoreUrl && (
          <a
            href={glossaryEntry.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Arrow */}
      <div
        className={`absolute left-4 w-2 h-2 rotate-45 border bg-popover ${
          position === "top"
            ? "bottom-[-5px] border-r border-b border-border"
            : "top-[-5px] border-l border-t border-border"
        }`}
      />
    </div>
  )
}

interface GlossaryHighlightProps {
  text: string
  terms?: string[]
}

export function GlossaryHighlight({ text, terms }: GlossaryHighlightProps) {
  const allTerms = terms || Object.keys(GLOSSARY_TERMS)

  // Create a regex pattern from terms, escaping special characters
  const pattern = new RegExp(
    `\\b(${allTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  )

  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, index) => {
        const matchedTerm = allTerms.find(
          (t) => t.toLowerCase() === part.toLowerCase()
        )
        if (matchedTerm) {
          return <GlossaryTooltip key={index} term={matchedTerm} />
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
