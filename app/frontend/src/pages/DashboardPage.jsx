import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useTags } from '../hooks/useTags'
import { EntryCard } from '../components/EntryCard'
import { TagFilterBar } from '../components/TagFilterBar'
import { SkeletonCard } from '../components/SkeletonCard'

export function DashboardPage() {
  const { entries, loading, error, refetch } = useEntries()
  const { tags } = useTags()
  const [tagStates, setTagStates] = useState({})

  useEffect(() => { document.title = 'TaskJournal — Dashboard' }, [])

  const includeTags = Object.entries(tagStates).filter(([, s]) => s === 'include').map(([id]) => id)
  const excludeTags = Object.entries(tagStates).filter(([, s]) => s === 'exclude').map(([id]) => id)

  const visibleEntries = entries.filter(entry => {
    if (includeTags.length > 0 && !includeTags.every(tid => entry.tags?.some(t => t.id === tid))) return false
    if (excludeTags.some(tid => entry.tags?.some(t => t.id === tid))) return false
    return true
  })

  const isFiltered = Object.keys(tagStates).length > 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/entries/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors min-h-[44px] flex items-center"
        >
          + New Entry
        </Link>
      </div>

      {tags.length > 0 && (
        <TagFilterBar tags={tags} states={tagStates} onChange={setTagStates} />
      )}

      {error && (
        <p className="text-red-600 text-sm">Failed to load entries: {error}</p>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="text-5xl">📝</div>
          <p className="text-gray-600 font-medium">No entries yet</p>
          <p className="text-gray-400 text-sm">Start logging your work to track progress and generate reports.</p>
          <Link
            to="/entries/new"
            className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Log your first task →
          </Link>
        </div>
      )}

      {!loading && entries.length > 0 && visibleEntries.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-8">
          No entries match the selected filters.
        </p>
      )}

      {!loading && visibleEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          {visibleEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDeleted={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}
