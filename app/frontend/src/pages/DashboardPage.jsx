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
  const [filterTagIds, setFilterTagIds] = useState([])

  useEffect(() => { document.title = 'TaskJournal — Dashboard' }, [])

  const visibleEntries = filterTagIds.length === 0
    ? entries
    : entries.filter(entry =>
        filterTagIds.every(tid => entry.tags?.some(t => t.id === tid))
      )

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
        <TagFilterBar tags={tags} selected={filterTagIds} onChange={setFilterTagIds} />
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
          No entries match the selected tags.
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
