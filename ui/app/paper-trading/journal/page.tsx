"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, BookOpen, Plus, Search } from "lucide-react"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { Button } from "@/components/ui/Button"
import { TradeJournalEntry } from "@/components/paper-trading/TradeJournalEntry"
import { TradeJournalForm } from "@/components/paper-trading/TradeJournalForm"
import { mockJournalEntries, generateJournalId } from "@/lib/paper-trading/mock-journal"
import type { JournalEntry } from "@/lib/paper-trading/mock-journal"
import { mockMarketWatch } from "@/lib/paper-trading/mock-data"

export default function JournalPage() {
  return (
    <RequireAuth fallbackTitle="Sign in to view journal" fallbackDescription="Trade journal requires authentication.">
      <JournalContent />
    </RequireAuth>
  )
}

function JournalContent() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockJournalEntries)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    entries.forEach(e => e.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query) ||
          entry.ticker?.toLowerCase().includes(query) ||
          entry.tags.some(t => t.includes(query))
        if (!matchesSearch) return false
      }
      if (filterTag && !entry.tags.includes(filterTag)) {
        return false
      }
      return true
    })
  }, [entries, searchQuery, filterTag])

  const handleSave = (data: Omit<JournalEntry, 'id' | 'createdAt'> & { id?: string }) => {
    if (data.id) {
      setEntries(prev => prev.map(e => 
        e.id === data.id 
          ? { ...e, ...data, updatedAt: new Date().toISOString() }
          : e
      ))
    } else {
      const newEntry: JournalEntry = {
        ...data,
        id: generateJournalId(),
        createdAt: new Date().toISOString(),
      } as JournalEntry
      setEntries(prev => [newEntry, ...prev])
    }
    setShowForm(false)
    setEditingEntry(null)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setShowForm(true)
  }

  const handleDelete = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEntry(null)
  }

  return (
    <main className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_34rem),var(--background)] p-4 pb-24 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/paper-trading">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Trade Journal
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
          </div>
          
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        {!showForm && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries..."
                className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTag(null)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    !filterTag 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      filterTag === tag 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <TradeJournalForm
            entry={editingEntry}
            marketWatch={mockMarketWatch}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        {/* Entries List */}
        {!showForm && (
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="rounded-2xl bg-background/60 p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {searchQuery || filterTag ? 'No matching entries' : 'No journal entries yet'}
                </p>
                <p className="text-sm text-muted-foreground/70">
                  {searchQuery || filterTag 
                    ? 'Try adjusting your search or filters'
                    : 'Start documenting your trading journey'
                  }
                </p>
              </div>
            ) : (
              filteredEntries.map(entry => (
                <TradeJournalEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}

        {/* Tips */}
        {!showForm && entries.length < 5 && (
          <section className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
            <h3 className="font-semibold text-primary mb-2">Tips for effective journaling:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Record your reasoning before entering trades</li>
              <li>Note your emotional state and confidence level</li>
              <li>Review what went right or wrong after closing positions</li>
              <li>Use tags to categorize and find patterns later</li>
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
