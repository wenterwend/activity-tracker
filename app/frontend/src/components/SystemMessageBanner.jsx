import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'dismissed_system_msg'

export function SystemMessageBanner() {
  const [message, setMessage] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    apiFetch('/system/message')
      .then(data => {
        if (!data) return
        const dismissed = localStorage.getItem(STORAGE_KEY)
        if (dismissed === data.id) return
        setMessage(data)
        setVisible(true)
      })
      .catch(() => {})
  }, [])

  function dismiss() {
    if (message) localStorage.setItem(STORAGE_KEY, message.id)
    setVisible(false)
  }

  if (!visible || !message) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
        <p className="text-sm text-amber-800 leading-relaxed">{message.message}</p>
        <button
          onClick={dismiss}
          aria-label="Dismiss message"
          className="shrink-0 text-amber-600 hover:text-amber-900 transition-colors mt-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
