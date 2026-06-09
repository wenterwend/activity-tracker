import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { useTags } from '../hooks/useTags'
import { EntryForm } from '../components/EntryForm'
import { useShowToast } from '../components/ToastContext'

export function EntryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useShowToast()
  const isEditing = Boolean(id)

  const { tags } = useTags()
  const [initialValues, setInitialValues] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    document.title = isEditing ? 'TaskJournal — Edit Entry' : 'TaskJournal — New Entry'
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) return
    apiFetch('/entries/' + id)
      .then(entry => {
        setInitialValues({ ...entry, tag_ids: entry.tags?.map(t => t.id) ?? [] })
      })
      .catch(e => setLoadError(e.message))
  }, [id, isEditing])

  async function handleSubmit(values) {
    if (isEditing) {
      await apiFetch('/entries/' + id, { method: 'PUT', body: values })
    } else {
      await apiFetch('/entries', { method: 'POST', body: values })
    }
    showToast('Entry saved')
    navigate('/dashboard')
  }

  if (isEditing && !initialValues && !loadError) {
    return <div className="text-gray-400 text-sm py-8 text-center">Loading entry…</div>
  }

  if (loadError) {
    return (
      <div className="text-red-600 text-sm py-8 text-center">
        Failed to load entry: {loadError}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Back
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Entry' : 'New Entry'}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <EntryForm
          initialValues={initialValues}
          tags={tags}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Update Entry' : 'Save Entry'}
        />
      </div>
    </div>
  )
}
