import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { AdminNav } from '../../components/AdminNav'

const ACTION_LABELS = {
  user_login:               'User login',
  user_deactivated:         'Account deactivated',
  user_reactivated:         'Account reactivated',
  system_message_published: 'System message published',
  system_message_cleared:   'System message cleared',
  ai_summary_generated:     'AI summary generated',
  orphaned_tags_deleted:    'Orphaned tags deleted',
}

export function AdminAuditLog() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Admin — Audit Log'
    apiFetch('/admin/audit-log?limit=200')
      .then(setEntries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      <AdminNav />

      {error && <p className="text-red-600 text-sm">Error: {error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">User</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-gray-800">
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-600">
                    {entry.profiles?.email ?? <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="py-2.5 text-gray-500 text-xs">
                    {entry.metadata ? JSON.stringify(entry.metadata) : ''}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">No audit events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
