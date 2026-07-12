"use client"

import { useState, useEffect } from "react"
import { X, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/Button"
import type { JournalEntry } from "@/lib/paper-trading/mock-journal"
import { MOOD_OPTIONS, SUGGESTED_TAGS } from "@/lib/paper-trading/mock-journal"
import type { PaperTradingMarketTicker } from "@/lib/paper-trading/types"

interface TradeJournalFormProps {
  entry?: JournalEntry | null
  marketWatch: PaperTradingMarketTicker[]
  onSave: (entry: Omit<JournalEntry, 'id' | 'createdAt'> & { id?: string }) => void
  onCancel: () => void
}

export function TradeJournalForm({ entry, marketWatch, onSave, onCancel }: TradeJournalFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [ticker, setTicker] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [mood, setMood] = useState<'bullish' | 'bearish' | 'neutral'>('neutral')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setContent(entry.content)
      setTicker(entry.ticker || '')
      setTags(entry.tags)
      setMood(entry.mood)
    }
  }, [entry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onSave({
      id: entry?.id,
      title: title.trim(),
      content: content.trim(),
      ticker: ticker || undefined,
      tags,
      mood,
      updatedAt: entry ? new Date().toISOString() : undefined,
    })
  }

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{entry ? 'Edit Entry' : 'New Journal Entry'}</h3>
        </div>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-muted rounded">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title..."
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      {/* Ticker (optional) */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Related Stock (optional)</label>
        <select
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-input px-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">No specific stock</option>
          {marketWatch.map((stock) => (
            <option key={stock.ticker} value={stock.ticker}>
              {stock.ticker} - {stock.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mood */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Sentiment</label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition border ${
                mood === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span>{option.emoji}</span>
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Notes</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts, analysis, lessons learned..."
          rows={5}
          className="w-full rounded-lg border border-border bg-input p-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          required
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-danger">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tags (press Enter)"
          className="h-9 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
        />
        {/* Suggested tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition"
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!title.trim() || !content.trim()}>
          {entry ? 'Save Changes' : 'Create Entry'}
        </Button>
      </div>
    </form>
  )
}
