import { useState, useEffect } from 'react'
import { useTags } from '../hooks/useTags'
import { TagBadge } from '../components/TagBadge'
import { apiFetch } from '../lib/api'

export function TagsPage() {
  const { tags, loading, refetch } = useTags()
  const [name, setName] = useState('')
  const [createError, setCreateError] = useState(null)
  const [creating, setCreating] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreateError(null)
    setCreating(true)
    try {
      await apiFetch('/tags', { method: 'POST', body: { name: name.trim() } })
      setName('')
      await refetch()
    } catch (e) {
      // 409 = duplicate
      setCreateError(e.message.includes('409') || e.message.includes('already')
        ? 'You already have a tag with this name.'
        : e.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(tag) {
    if (!window.confirm(`Delete tag "${tag.name}"? It will be removed from all entries.`)) return
    try {
      await apiFetch('/tags/' + tag.id, { method: 'DELETE' })
      await refetch()
    } catch (e) {
      alert('Failed to delete tag: ' + e.message)
    }
  }

  useEffect(() => { document.title = 'TaskJournal — Tags' }, [])

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Tags</h1>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label htmlFor="tag-name" className="text-sm font-medium text-gray-700">
            New tag
          </label>
          <div className="flex gap-2">
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design, Backend, Meetings…"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={creating || !name.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Adding…' : 'Add Tag'}
            </button>
          </div>
          {createError && <p className="text-red-600 text-xs">{createError}</p>}
        </form>
      </div>

      {/* Tag list */}
      <div className="flex flex-col gap-2">
        {loading && (
          <div className="animate-pulse flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        )}

        {!loading && tags.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No tags yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Tags help you organize and filter your entries.
            </p>
          </div>
        )}

        {!loading && tags.map(tag => (
          <div
            key={tag.id}
            className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center justify-between"
          >
            <TagBadge name={tag.name} />
            <button
              type="button"
              onClick={() => handleDelete(tag)}
              aria-label={`Delete tag ${tag.name}`}
              className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
