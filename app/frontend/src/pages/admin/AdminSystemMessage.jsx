import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { AdminNav } from '../../components/AdminNav'

export function AdminSystemMessage() {
  const [current, setCurrent] = useState(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    document.title = 'Admin — System Message'
    apiFetch('/admin/system-message')
      .then(data => {
        setCurrent(data)
        if (data?.message) setDraft(data.message)
      })
      .catch(() => {})
  }, [])

  async function handlePublish(e) {
    e.preventDefault()
    if (!draft.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const data = await apiFetch('/admin/system-message', { method: 'POST', body: { message: draft.trim() } })
      setCurrent(data)
      setFeedback({ type: 'success', text: 'Message published.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    if (!window.confirm('Clear the active system message?')) return
    setClearing(true)
    setFeedback(null)
    try {
      await apiFetch('/admin/system-message', { method: 'DELETE' })
      setCurrent(null)
      setDraft('')
      setFeedback({ type: 'success', text: 'Message cleared.' })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      <AdminNav />

      {current?.is_active && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Active message</p>
          <p>{current.message}</p>
          <p className="text-xs text-amber-600 mt-2">
            Published {new Date(current.created_at).toLocaleString()}
          </p>
        </div>
      )}

      {!current?.is_active && (
        <p className="text-sm text-gray-400">No active system message.</p>
      )}

      <form onSubmit={handlePublish} className="flex flex-col gap-3 max-w-lg">
        <label className="text-sm font-medium text-gray-700">
          Compose message
        </label>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={4}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="Enter a message to display to all users on login…"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !draft.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Publishing…' : 'Publish'}
          </button>
          {current?.is_active && (
            <button
              type="button"
              onClick={handleClear}
              disabled={clearing}
              className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              {clearing ? 'Clearing…' : 'Clear message'}
            </button>
          )}
        </div>
      </form>

      {feedback && (
        <p className={`text-sm ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.text}
        </p>
      )}
    </div>
  )
}
