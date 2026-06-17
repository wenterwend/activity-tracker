import { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

const AdminContext = createContext({ isAdmin: false, loading: true })

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/admin/me')
      .then(data => setIsAdmin(!!data.is_admin))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
