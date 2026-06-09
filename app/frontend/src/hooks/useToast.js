import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message) => {
    const id = Date.now()
    setToast({ message, id })
    setTimeout(() => setToast(cur => cur?.id === id ? null : cur), 3000)
  }, [])

  return { toast, showToast }
}
