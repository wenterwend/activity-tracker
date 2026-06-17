import { Navigate } from 'react-router-dom'
import { useAdmin } from './AdminContext'

export function AdminRoute({ children }) {
  const { isAdmin, loading } = useAdmin()
  if (loading) return null
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
