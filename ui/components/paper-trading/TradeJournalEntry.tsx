"use client"

import { Edit2, Trash2, Link as LinkIcon, Tag } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { JournalEntry } from "@/lib/paper-trading/mock-journal"
import { MOOD_OPTIONS } from "@/lib/paper-trading/mock-journal"
import { formatRelativeTime } from "@/lib/paper-trading/formatters"

interface TradeJournalEntryProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (entryId: string) => void
}

export function TradeJournalEntry({ entry, onEdit, onDelete }: TradeJournalEntryProps) {
  const mood = MOOD_OPTIONS.find(m => m.value === entry.mood)

  return (
    <div className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{entry.title}</h3>
            {mood && (
              <span className={`text-sm ${mood.color}`} title={mood.label}>
                {mood.emoji}
              </span>
            )}
            {entry.ticker && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {entry.ticker}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(entry.createdAt)}
            {entry.updatedAt && ` · Edited ${formatRelativeTime(entry.updatedAt)}`}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onEdit(entry)}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(entry.id)}
            className="text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">
        {entry.content}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {entry.tags.map(tag => (
              <span 
                key={tag} 
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Linked Order */}
        {entry.orderId && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <LinkIcon className="h-3 w-3" />
            <span>Order {entry.orderId}</span>
          </div>
        )}
      </div>
    </div>
  )
}
