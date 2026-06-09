import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      navigate(user ? '/dashboard' : '/login', { replace: true })
    }
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      Signing you in…
    </div>
  )
}
