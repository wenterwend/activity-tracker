import { useState } from 'react'
import { apiFetch } from '../lib/api'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

export function AiSummaryPanel({ entries, periodStart, periodEnd }) {
  const [enabled, setEnabled] = useState(false)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const disabled = entries.length === 0

  async function handleToggle() {
    const next = !enabled
    setEnabled(next)

    // Only fetch if turning ON and we don't already have a summary in memory
    if (next && summary === null) {
      setLoading(true)
      setError(null)
      try {
        const res = await apiFetch('/ai/summary', {
          method: 'POST',
          body: { entries, period_start: periodStart, period_end: periodEnd },
        })
        setSummary(res.summary)
      } catch (e) {
        setError(e.message)
        setEnabled(false)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header row with toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">AI Summary</span>
          <span className="text-xs text-gray-400 italic">Powered by Claude</span>
        </div>
        <div title={disabled ? 'No entries to summarize' : undefined}>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={disabled || loading}
            onClick={handleToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 ${
              enabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                enabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Body — only shown when toggle is ON */}
      {enabled && (
        <div className="px-4 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Spinner />
              Generating summary…
            </div>
          )}

          {error && !loading && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          {summary && !loading && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-400">✦ AI-Generated — review for accuracy</p>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
