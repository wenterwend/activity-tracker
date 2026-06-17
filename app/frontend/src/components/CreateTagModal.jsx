import { useState } from 'react'
import { apiFetch } from '../lib/api'

export function CreateTagModal({ onCreated, onClose }) {
  const [name, setName] = useState('')
  const [tagType, setTagType] = useState('personal')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const endpoint = tagType === 'shared' ? '/tags/shared' : '/tags'
      const tag = await apiFetch(endpoint, { method: 'POST', body: { name: name.trim() } })
      onCreated({ ...tag, type: tagType })
    } catch (err) {
      setError(
        err.message.includes('409') || err.message.includes('already')
          ? 'A tag with this name already exists.'
          : err.message
      )
    } finally {
      setSaving(false)
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">New Tag</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Personal / Shared toggle */}
        <div className="flex rounded-md border border-gray-300 overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setTagType('personal')}
            className={`flex-1 px-3 py-2 transition-colors ${
              tagType === 'personal' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setTagType('shared')}
            className={`flex-1 px-3 py-2 border-l border-gray-300 transition-colors ${
              tagType === 'shared' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Shared
          </button>
        </div>
        {tagType === 'shared' && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
            Shared tags are visible to all users.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="modal-tag-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tag name
            </label>
            <input
              id="modal-tag-name"
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design, Backend…"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className={`px-4 py-2 text-sm text-white rounded-md disabled:opacity-50 transition-colors ${
                tagType === 'shared'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saving ? 'Creating…' : 'Create Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
