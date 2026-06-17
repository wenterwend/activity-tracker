import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export function useTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const [personal, shared] = await Promise.all([
        apiFetch('/tags'),
        apiFetch('/tags/shared'),
      ])
      setTags([
        ...personal.map(t => ({ ...t, type: 'personal' })),
        ...shared.map(t => ({ ...t, type: 'shared' })),
      ])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  return { tags, loading, error, refetch }
}
