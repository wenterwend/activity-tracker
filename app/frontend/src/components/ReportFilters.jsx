import { TagFilterBar } from './TagFilterBar'

export function ReportFilters({ filters, onChange, onRun, onClear, tags, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="report-start" className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            id="report-start"
            type="date"
            value={filters.start}
            onChange={e => onChange({ ...filters, start: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="report-end" className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            id="report-end"
            type="date"
            value={filters.end}
            onChange={e => onChange({ ...filters, end: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={onRun}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading…' : 'Run Report'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Filter by Tags</p>
          <TagFilterBar
            tags={tags}
            states={filters.tagStates}
            onChange={tagStates => onChange({ ...filters, tagStates })}
          />
        </div>
      )}
    </div>
  )
}
