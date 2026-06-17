import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { AdminNav } from '../../components/AdminNav'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function MiniBar({ count, max, date }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex flex-col items-center gap-1" title={`${date}: ${count} entries`}>
      <div className="w-4 bg-gray-100 rounded-t" style={{ height: '60px', position: 'relative' }}>
        <div
          className="absolute bottom-0 w-full bg-indigo-400 rounded-t transition-all"
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Admin — Overview'
    apiFetch('/admin/stats')
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Fill last 30 days with zeros
  const chartData = (() => {
    if (!stats) return []
    const map = Object.fromEntries(stats.entries.per_day.map(d => [d.date, d.count]))
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      days.push({ date: d, count: map[d] ?? 0 })
    }
    return days
  })()
  const chartMax = Math.max(...chartData.map(d => d.count), 1)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      <AdminNav />

      {error && <p className="text-red-600 text-sm">Failed to load stats: {error}</p>}

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total users"      value={stats.users.total}         sub={`${stats.users.deactivated} deactivated`} />
            <StatCard label="Total entries"    value={stats.entries.total}       />
            <StatCard label="Tags"             value={stats.tags.personal + stats.tags.shared} sub={`${stats.tags.shared} shared`} />
            <StatCard label="AI summaries"     value={stats.ai.calls}            sub={`≈ $${stats.ai.estimated_cost_usd.toFixed(4)} est.`} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">Entries logged — last 30 days</p>
            {chartData.every(d => d.count === 0) ? (
              <p className="text-gray-400 text-sm">No entries in this period.</p>
            ) : (
              <div className="flex items-end gap-1 overflow-x-auto pb-1">
                {chartData.map(d => (
                  <MiniBar key={d.date} count={d.count} max={chartMax} date={d.date} />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <p className="font-medium text-gray-700 mb-2">AI usage</p>
              <p>Input tokens: {stats.ai.input_tokens.toLocaleString()}</p>
              <p>Output tokens: {stats.ai.output_tokens.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">Priced at Haiku rates ($0.80/$4.00 per M tokens)</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <p className="font-medium text-gray-700 mb-2">Users</p>
              <p>Active: {stats.users.active}</p>
              <p>Deactivated: {stats.users.deactivated}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
