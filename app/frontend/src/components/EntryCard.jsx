import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { TagBadge } from './TagBadge'

function formatTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EntryCard({ entry, onDeleted }) {
  async function handleDelete() {
    if (!window.confirm('Delete this entry?')) return
    try {
      await apiFetch('/entries/' + entry.id, { method: 'DELETE' })
      onDeleted(entry.id)
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-base font-semibold text-gray-900 leading-snug">{entry.task_name}</p>
        <div className="flex items-center gap-3 shrink-0 text-sm">
          <Link
            to={`/entries/${entry.id}/edit`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>{formatDate(entry.date)}</span>
        <span className="text-gray-300">·</span>
        <span className="font-medium text-gray-700">{formatTime(entry.time_spent_minutes)}</span>
      </div>

      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map(tag => (
            <TagBadge key={tag.id} name={tag.name} />
          ))}
        </div>
      )}

      {entry.notes && (
        <p className="text-sm text-gray-500 leading-relaxed">
          {entry.notes.length > 100 ? entry.notes.slice(0, 100) + '…' : entry.notes}
        </p>
      )}
    </div>
  )
}
