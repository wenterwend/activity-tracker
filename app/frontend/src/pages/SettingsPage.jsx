import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { TagBadge } from '../components/TagBadge'

export function SettingsPage() {
  const [sharedTags, setSharedTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  useEffect(() => { document.title = 'TaskJournal — Settings' }, [])

  const fetchSharedTags = useCallback(async () => {
    setLoading(true)
    try {
      setSharedTags(await apiFetch('/tags/shared'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSharedTags() }, [fetchSharedTags])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await apiFetch('/tags/shared', { method: 'POST', body: { name: name.trim() } })
      setName('')
      await fetchSharedTags()
    } catch (err) {
      setCreateError(
        err.message.includes('409') || err.message.includes('already')
          ? 'A shared tag with this name already exists.'
          : err.message
      )
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(tag) {
    if (!window.confirm(`Delete shared tag "${tag.name}"? It will be removed from all entries across all users.`)) return
    try {
      await apiFetch('/tags/shared/' + tag.id, { method: 'DELETE' })
      await fetchSharedTags()
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Shared Tags</h2>
          <p className="text-sm text-gray-500 mt-1">
            Shared tags are available to all users. Anyone can create them; only the creator can delete them.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <label htmlFor="shared-tag-name" className="text-sm font-medium text-gray-700">
              New shared tag
            </label>
            <div className="flex gap-2">
              <input
                id="shared-tag-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Client Work, Internal, Urgent…"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {creating ? 'Adding…' : 'Add'}
              </button>
            </div>
            {createError && <p className="text-red-600 text-xs">{createError}</p>}
          </form>
        </div>

        <div className="flex flex-col gap-2">
          {loading && (
            <div className="animate-pulse flex flex-col gap-2">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          )}

          {!loading && sharedTags.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">No shared tags yet</p>
              <p className="text-gray-400 text-sm mt-1">Create one above to share it with all users.</p>
            </div>
          )}

          {!loading && sharedTags.map(tag => (
            <div
              key={tag.id}
              className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between"
            >
              <TagBadge name={tag.name} type="shared" />
              <button
                type="button"
                onClick={() => handleDelete(tag)}
                aria-label={`Delete shared tag ${tag.name}`}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
