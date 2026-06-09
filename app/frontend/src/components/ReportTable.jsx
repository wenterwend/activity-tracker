import { TagBadge } from './TagBadge'
import { SkeletonRow } from './SkeletonRow'

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

export function ReportTable({ entries, loading = false }) {
  if (!loading && entries.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4 text-center">
        No entries match your filters. Try adjusting the date range or tag selection.
      </p>
    )
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.time_spent_minutes, 0)

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-200">
      <table className="w-full text-sm border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">Date</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Task</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Tags</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600 whitespace-nowrap">Time</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600">Notes</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
            : entries.map(entry => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-600">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{entry.task_name}</td>
                  <td className="px-3 py-2">
                    {entry.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map(t => <TagBadge key={t.id} name={t.name} />)}
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 font-medium">
                    {formatTime(entry.time_spent_minutes)}
                  </td>
                  <td className="px-3 py-2 text-gray-500 max-w-xs truncate">
                    {entry.notes || <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))
          }
        </tbody>
        {!loading && entries.length > 0 && (
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200">
              <td colSpan={5} className="px-3 py-2 text-sm font-semibold text-gray-700">
                Total: {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {formatTime(totalMinutes)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
