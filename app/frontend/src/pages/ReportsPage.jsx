import { useState, useEffect } from 'react'
import { useTags } from '../hooks/useTags'
import { apiFetch } from '../lib/api'
import { ReportFilters } from '../components/ReportFilters'
import { ReportTable } from '../components/ReportTable'
import { AiSummaryPanel } from '../components/AiSummaryPanel'
import { downloadCsv } from '../lib/exportCsv'
import { downloadPdf } from '../lib/exportPdf'

function defaultStart() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

function defaultEnd() {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsPage() {
  const { tags } = useTags()
  const [filters, setFilters] = useState({
    start: defaultStart(),
    end: defaultEnd(),
    tagIds: [],
  })
  const [entries, setEntries] = useState(null) // null = report not yet run
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { document.title = 'TaskJournal — Reports' }, [])

  async function runReport() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ start: filters.start, end: filters.end })
      if (filters.tagIds.length > 0) params.set('tag_ids', filters.tagIds.join(','))
      const data = await apiFetch('/reports?' + params.toString())
      setEntries(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setFilters({ start: defaultStart(), end: defaultEnd(), tagIds: [] })
    setEntries(null)
    setError(null)
  }

  const showResults = entries !== null || loading

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onRun={runReport}
        onClear={clearFilters}
        tags={tags}
        loading={loading}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!showResults && (
        <p className="text-gray-400 text-sm">
          Select a date range and press "Run Report" to see results.
        </p>
      )}

      {showResults && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => downloadCsv(entries, filters.start, filters.end)}
              disabled={loading || !entries || entries.length === 0}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={async () => {
                setPdfLoading(true)
                try { await downloadPdf(entries, filters.start, filters.end) }
                finally { setPdfLoading(false) }
              }}
              disabled={loading || !entries || entries.length === 0 || pdfLoading}
              className="border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              {pdfLoading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>

          <ReportTable entries={entries ?? []} loading={loading} />

          {!loading && entries !== null && (
            <AiSummaryPanel
              entries={entries}
              periodStart={filters.start}
              periodEnd={filters.end}
            />
          )}
        </div>
      )}
    </div>
  )
}
