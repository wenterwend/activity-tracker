import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { AdminNav } from '../../components/AdminNav'

export function AdminTagCleanup() {
  const [orphans, setOrphans] = useState({ personal: [], shared: [] })
  const [selected, setSelected] = useState({ personal: new Set(), shared: new Set() })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    document.title = 'Admin — Tag Cleanup'
    load()
  }, [])

  function load() {
    setLoading(true)
    apiFetch('/admin/tags/orphaned')
      .then(data => {
        setOrphans(data)
        setSelected({ personal: new Set(), shared: new Set() })
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  function toggle(type, id) {
    setSelected(prev => {
      const next = new Set(prev[type])
      next.has(id) ? next.delete(id) : next.add(id)
      return { ...prev, [type]: next }
    })
  }

  function selectAll(type) {
    setSelected(prev => ({
      ...prev,
      [type]: new Set(orphans[type].map(t => t.id)),
    }))
  }

  function deselectAll(type) {
    setSelected(prev => ({ ...prev, [type]: new Set() }))
  }

  async function handleDelete() {
    const personal_tag_ids = [...selected.personal]
    const shared_tag_ids   = [...selected.shared]
    if (personal_tag_ids.length === 0 && shared_tag_ids.length === 0) return

    setDeleting(true)
    setFeedback(null)
    try {
      const result = await apiFetch('/admin/tags/orphaned', {
        method: 'DELETE',
        body: { personal_tag_ids, shared_tag_ids },
      })
      setFeedback({ type: 'success', text: `Deleted ${result.deleted_personal} personal + ${result.deleted_shared} shared tags.` })
      load()
    } catch (e) {
      setFeedback({ type: 'error', text: e.message })
    } finally {
      setDeleting(false)
    }
  }

  const totalSelected = selected.personal.size + selected.shared.size
  const totalOrphans  = orphans.personal.length + orphans.shared.length

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      <AdminNav />

      {error && <p className="text-red-600 text-sm">Error: {error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : totalOrphans === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">No orphaned tags found.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{totalOrphans} orphaned tags found.</p>
            {totalSelected > 0 && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting…' : `Delete ${totalSelected} selected`}
              </button>
            )}
          </div>

          {feedback && (
            <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.text}
            </p>
          )}

          {orphans.personal.length > 0 && (
            <TagTable
              title="Personal tags"
              tags={orphans.personal}
              emailKey="owner_email"
              selected={selected.personal}
              onToggle={id => toggle('personal', id)}
              onSelectAll={() => selectAll('personal')}
              onDeselectAll={() => deselectAll('personal')}
            />
          )}

          {orphans.shared.length > 0 && (
            <TagTable
              title="Shared tags"
              tags={orphans.shared}
              emailKey="creator_email"
              selected={selected.shared}
              onToggle={id => toggle('shared', id)}
              onSelectAll={() => selectAll('shared')}
              onDeselectAll={() => deselectAll('shared')}
            />
          )}
        </>
      )}
    </div>
  )
}

function TagTable({ title, tags, emailKey, selected, onToggle, onSelectAll, onDeselectAll }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{title} ({tags.length})</p>
        <div className="flex gap-3 text-xs text-indigo-600">
          <button onClick={onSelectAll} className="hover:underline">Select all</button>
          <button onClick={onDeselectAll} className="hover:underline">Deselect all</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="py-2 pr-3 w-8"></th>
              <th className="py-2 pr-4">Tag name</th>
              <th className="py-2">Owner / Creator</th>
            </tr>
          </thead>
          <tbody>
            {tags.map(tag => (
              <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.has(tag.id)}
                    onChange={() => onToggle(tag.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="py-2 pr-4 font-medium text-gray-800">{tag.name}</td>
                <td className="py-2 text-gray-500">{tag[emailKey] ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
